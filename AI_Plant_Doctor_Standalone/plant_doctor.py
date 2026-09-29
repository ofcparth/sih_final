"""
PlantDoctor: Drop-in Plant Pathology & Agronomy Engine
Integrates MobileNetV2 ONNX inference, pesticide advisory, and Groq/Gemini nutrient deficiency analysis.
Can be imported directly into Flask, FastAPI, Django, Streamlit, or Celery workers.
"""

import os
import json
import base64
import numpy as np
from PIL import Image
import cv2
import onnxruntime as ort

try:
    from pesticide_advisory import get_pesticide_recommendation
    from ai_agronomy_service import analyze_crop_nutrients_and_pesticide, load_env_file
except ImportError:
    from app.ml.pesticide_advisory import get_pesticide_recommendation
    from app.ml.ai_agronomy_service import analyze_crop_nutrients_and_pesticide, load_env_file

class PlantDoctor:
    def __init__(self, model_path=None, config_path=None, disease_db_path=None):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        load_env_file()
        
        self.model_path = model_path or os.path.join(base_dir, "models", "mobilenet_v2_plant_disease.onnx")
        self.config_path = config_path or os.path.join(base_dir, "models", "onnx_config.json")
        self.disease_db_path = disease_db_path or os.path.join(base_dir, "plant_disease.json")
        
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found at: {self.model_path}")
            
        # Initialize ONNX runtime session
        self.session = ort.InferenceSession(self.model_path)
        
        # Load class labels
        with open(self.config_path, "r") as f:
            cfg = json.load(f)
        self.id2label = cfg.get("id2label", {})
        
        # Load disease pathology database (excluding non-plant background)
        with open(self.disease_db_path, "r") as f:
            raw_data = json.load(f)
        self.disease_db = [p for p in raw_data if p.get("name") != "Background_without_leaves"]

    def preprocess_image(self, image_input):
        """
        Preprocesses an image path or PIL.Image instance.
        - Resizes shortest edge to 256px maintaining aspect ratio
        - Center-crops to 224x224
        - Normalizes pixels: (pixel / 255.0 - 0.5) / 0.5 -> [-1.0, 1.0]
        - Transposes to (1, 3, 224, 224) float32
        """
        if isinstance(image_input, str):
            img = Image.open(image_input).convert('RGB')
        elif isinstance(image_input, Image.Image):
            img = image_input.convert('RGB')
        else:
            raise TypeError("Expected file path string or PIL Image object")

        w, h = img.size
        if w < h:
            new_w = 256
            new_h = int(h * (256 / w))
        else:
            new_h = 256
            new_w = int(w * (256 / h))
        img_resized = img.resize((new_w, new_h), Image.BILINEAR)

        left = (new_w - 224) // 2
        top = (new_h - 224) // 2
        img_cropped = img_resized.crop((left, top, left + 224, top + 224))

        arr = np.array(img_cropped).astype(np.float32) / 255.0
        arr = (arr - np.array([0.5, 0.5, 0.5], dtype=np.float32)) / np.array([0.5, 0.5, 0.5], dtype=np.float32)
        arr = np.transpose(arr, (2, 0, 1))
        arr = np.expand_dims(arr, axis=0)
        return arr

    def diagnose(self, image_input, include_nutrients=True, include_pesticides=True):
        """
        Runs full diagnosis pipeline:
        1. AI model disease classification
        2. Pesticide Spray Recommendation (>60% threshold logic)
        3. Nutrient Deficiency Analysis (GroqCloud / Gemini / Expert Engine)
        """
        features = self.preprocess_image(image_input)
        
        # Generate visualizations using OpenCV
        roi_b64, heatmap_b64 = self.generate_visual_explanations(image_input)
        
        outputs = self.session.run(['logits'], {'pixel_values': features})
        logits = outputs[0][0]
        
        # Softmax probabilities
        probs = np.exp(logits - np.max(logits))
        probs = probs / probs.sum()

        pred_idx = int(np.argmax(probs))
        confidence = round(float(probs[pred_idx] * 100), 2)

        disease_info = self.disease_db[pred_idx].copy()
        raw_name = disease_info.get("name", "")
        readable_name = self.id2label.get(str(pred_idx), raw_name)
        crop_name = readable_name.split()[0]
        if "___" in raw_name:
            crop_name = raw_name.split("___")[0].replace("_", " ")

        top_indices = np.argsort(probs)[::-1][:3]
        top_predictions = [
            {
                "class_name": self.id2label.get(str(idx), self.disease_db[idx].get("name", "") if idx < len(self.disease_db) else f"Class {idx}"),
                "confidence_pct": round(float(probs[idx] * 100), 2),
                "is_primary": bool(idx == pred_idx)
            }
            for idx in top_indices
        ]

        diagnosis = {
            "class_id": pred_idx,
            "crop": crop_name,
            "raw_name": raw_name,
            "disease_name": readable_name,
            "confidence": confidence,
            "cause": disease_info.get("cause", ""),
            "cure": disease_info.get("cure", ""),
            "top_predictions": top_predictions,
            "visualizations": {
                "roi_box": roi_b64,
                "attention_heatmap": heatmap_b64
            }
        }

        # 2. Pesticide Spray Advisory
        if include_pesticides:
            diagnosis["pesticide_advisory"] = get_pesticide_recommendation(
                raw_name, readable_name, confidence
            )

        # 3. Nutrient Deficiency Analysis
        if include_nutrients:
            diagnosis["nutrient_analysis"] = analyze_crop_nutrients_and_pesticide(
                raw_name, readable_name, disease_info.get("cause", ""), confidence
            )

        return diagnosis

    def generate_visual_explanations(self, image_input):
        try:
            if isinstance(image_input, str):
                img = cv2.imread(image_input)
            elif isinstance(image_input, Image.Image):
                img = cv2.cvtColor(np.array(image_input), cv2.COLOR_RGB2BGR)
            else:
                return None, None
                
            if img is None: return None, None
            
            # Resize image to reasonable size for processing and web transport
            h, w = img.shape[:2]
            max_dim = 800
            if max(h, w) > max_dim:
                scale = max_dim / max(h, w)
                img = cv2.resize(img, (int(w * scale), int(h * scale)))
                
            # 1. ROI Box (Find biggest green contour or just center crop)
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            mask = cv2.inRange(hsv, (25, 40, 40), (85, 255, 255))
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            roi_img = img.copy()
            if contours:
                c = max(contours, key=cv2.contourArea)
                x, y, w_box, h_box = cv2.boundingRect(c)
                pad = max(10, min(w, h) // 20)
                x, y = max(0, x-pad), max(0, y-pad)
                w_box, h_box = min(img.shape[1]-x, w_box+2*pad), min(img.shape[0]-y, h_box+2*pad)
                cv2.rectangle(roi_img, (x, y), (x+w_box, y+h_box), (0, 255, 0), max(2, img.shape[0]//150))
                cv2.putText(roi_img, 'Leaf ROI', (x, max(20, y-10)), cv2.FONT_HERSHEY_SIMPLEX, 
                            max(0.5, img.shape[0]//600), (0, 255, 0), 2)
            else:
                h_img, w_img = img.shape[:2]
                cv2.rectangle(roi_img, (w_img//6, h_img//6), (w_img*5//6, h_img*5//6), (0, 255, 0), max(2, h_img//150))
                
            # 2. Saliency Heatmap (Simulated based on edge detection + blur)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            blur = cv2.GaussianBlur(gray, (15, 15), 0)
            edges = cv2.Canny(blur, 50, 150)
            edges = cv2.dilate(edges, np.ones((15, 15), np.uint8), iterations=3)
            edges = cv2.GaussianBlur(edges, (45, 45), 0)
            
            heatmap = cv2.applyColorMap(edges, cv2.COLORMAP_JET)
            heatmap_overlay = cv2.addWeighted(img, 0.4, heatmap, 0.6, 0)
            
            _, buffer_roi = cv2.imencode('.jpg', roi_img, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            roi_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer_roi).decode('utf-8')
            
            _, buffer_hm = cv2.imencode('.jpg', heatmap_overlay, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            hm_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer_hm).decode('utf-8')
            
            return roi_b64, hm_b64
        except Exception as e:
            print(f"Error generating visual explanations: {e}")
            return None, None
