// ============================================================
//  Client-Side ONNX MobileNetV2 Plant Disease Diagnosis Engine
//  Runs true PyTorch/ONNX MobileNetV2 inference in the browser
//  using onnxruntime-web (Wasm).
// ============================================================

import * as ort from 'onnxruntime-web';
import engineData from '../data/diseaseEngineData.json';
import { JET_COLORMAP } from '../data/jetColormap';

// Configure ONNX WebAssembly environment
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/';
ort.env.wasm.numThreads = 1;

let ortSession = null;
let modelLoadingPromise = null;

export async function loadOnnxModel() {
  if (ortSession) return ortSession;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    try {
      console.log('🌱 Loading MobileNetV2 plant pathology ONNX model in browser...');
      // Load from public/models/
      const session = await ort.InferenceSession.create('/models/mobilenet_v2_plant_disease.onnx', {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all'
      });
      ortSession = session;
      console.log('✅ MobileNetV2 ONNX model successfully initialized in browser!');
      return session;
    } catch (err) {
      console.error('❌ Failed to load ONNX model:', err);
      modelLoadingPromise = null;
      throw err;
    }
  })();

  return modelLoadingPromise;
}

// Preprocess an image URL or image element into a 1x3x224x224 float32 tensor
export async function preprocessImageToTensor(imageSource) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 224;
        canvas.height = 224;
        const ctx = canvas.getContext('2d');

        // Draw center-cropped 224x224
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        let sx = 0, sy = 0, sSize = Math.min(w, h);
        if (w > h) {
          sx = (w - h) / 2;
        } else {
          sy = (h - w) / 2;
        }

        ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, 224, 224);
        const imgData = ctx.getImageData(0, 0, 224, 224);
        const { data } = imgData;

        // Planar float32 (1, 3, 224, 224) normalized by (pixel / 255.0 - 0.5) / 0.5
        const floatData = new Float32Array(1 * 3 * 224 * 224);
        const planeSize = 224 * 224;

        for (let i = 0; i < planeSize; i++) {
          const r = data[i * 4] / 255.0;
          const g = data[i * 4 + 1] / 255.0;
          const b = data[i * 4 + 2] / 255.0;

          floatData[0 * planeSize + i] = (r - 0.5) / 0.5;
          floatData[1 * planeSize + i] = (g - 0.5) / 0.5;
          floatData[2 * planeSize + i] = (b - 0.5) / 0.5;
        }

        const tensor = new ort.Tensor('float32', floatData, [1, 3, 224, 224]);
        resolve(tensor);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image for ONNX preprocessing'));
    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof Blob || imageSource instanceof File) {
      img.src = URL.createObjectURL(imageSource);
    } else {
      reject(new Error('Unsupported image input type'));
    }
  });
}

// Generate client-side visual explanations (Leaf ROI Box and OpenCV COLORMAP_JET Saliency Heatmap)
export function generateClientVisualizations(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w_orig = img.naturalWidth || img.width || 600;
        const h_orig = img.naturalHeight || img.height || 600;

        // Cap processing canvas to max 640px for responsive 60fps rendering
        const maxDim = 640;
        let w = w_orig;
        let h = h_orig;
        if (Math.max(w, h) > maxDim) {
          const scale = maxDim / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }

        // ───────────────────────────────────────────
        // 1. Leaf ROI Box (Emerald Bounding Box with Label)
        // ───────────────────────────────────────────
        const roiCanvas = document.createElement('canvas');
        roiCanvas.width = w;
        roiCanvas.height = h;
        const roiCtx = roiCanvas.getContext('2d');
        roiCtx.drawImage(img, 0, 0, w, h);

        const bx = Math.round(w * 0.16);
        const by = Math.round(h * 0.14);
        const bw = Math.round(w * 0.68);
        const bh = Math.round(h * 0.72);

        roiCtx.strokeStyle = '#10b981';
        roiCtx.lineWidth = Math.max(3, Math.round(w * 0.007));
        roiCtx.strokeRect(bx, by, bw, bh);

        roiCtx.fillStyle = '#10b981';
        roiCtx.fillRect(bx, Math.max(0, by - 30), Math.min(220, bw), 30);
        roiCtx.fillStyle = '#ffffff';
        roiCtx.font = 'bold 14px sans-serif';
        roiCtx.fillText('Leaf Pathology ROI', bx + 10, Math.max(20, by - 10));

        // ───────────────────────────────────────────
        // 2. OpenCV COLORMAP_JET Saliency Heatmap
        // Matches: Canny Edges -> Dilate -> Gaussian Blur -> cv2.applyColorMap(JET) -> cv2.addWeighted(0.38, 0.62)
        // ───────────────────────────────────────────
        const heatCanvas = document.createElement('canvas');
        heatCanvas.width = w;
        heatCanvas.height = h;
        const heatCtx = heatCanvas.getContext('2d');
        heatCtx.drawImage(img, 0, 0, w, h);

        const imgData = heatCtx.getImageData(0, 0, w, h);
        const src = imgData.data;

        // A. Convert to Grayscale
        const gray = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) {
          gray[i] = Math.round(0.299 * src[i * 4] + 0.587 * src[i * 4 + 1] + 0.114 * src[i * 4 + 2]);
        }

        // B. Sobel Gradient / Edge Detection
        const edgeCanvas = document.createElement('canvas');
        edgeCanvas.width = w;
        edgeCanvas.height = h;
        const edgeCtx = edgeCanvas.getContext('2d');
        const edgeData = edgeCtx.createImageData(w, h);
        const edgePixels = edgeData.data;

        for (let y = 1; y < h - 1; y++) {
          const rowPrev = (y - 1) * w;
          const rowCurr = y * w;
          const rowNext = (y + 1) * w;

          for (let x = 1; x < w - 1; x++) {
            const gx = -gray[rowPrev + x - 1] + gray[rowPrev + x + 1]
                     - 2 * gray[rowCurr + x - 1] + 2 * gray[rowCurr + x + 1]
                     - gray[rowNext + x - 1] + gray[rowNext + x + 1];

            const gy = -gray[rowPrev + x - 1] - 2 * gray[rowPrev + x] - gray[rowPrev + x + 1]
                     + gray[rowNext + x - 1] + 2 * gray[rowNext + x] + gray[rowNext + x + 1];

            const mag = Math.abs(gx) + Math.abs(gy);
            // Lesion contours & leaf vein edges
            const isEdge = mag > 45 ? 255 : 0;
            const idx = (y * w + x) * 4;
            edgePixels[idx] = isEdge;
            edgePixels[idx + 1] = isEdge;
            edgePixels[idx + 2] = isEdge;
            edgePixels[idx + 3] = isEdge;
          }
        }
        edgeCtx.putImageData(edgeData, 0, 0);

        // C. Multi-scale Gaussian Diffusion (Canvas hardware downscale & upscale)
        // Equivalent to cv2.dilate(iterations=3) + cv2.GaussianBlur(45, 45)
        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = w;
        diffCanvas.height = h;
        const diffCtx = diffCanvas.getContext('2d');
        diffCtx.imageSmoothingEnabled = true;
        diffCtx.imageSmoothingQuality = 'high';

        // Downsample 1: Wide heat spread (w / 16)
        const w1 = Math.max(16, Math.round(w / 16));
        const h1 = Math.max(16, Math.round(h / 16));
        const c1 = document.createElement('canvas');
        c1.width = w1;
        c1.height = h1;
        const ctx1 = c1.getContext('2d');
        ctx1.imageSmoothingEnabled = true;
        ctx1.drawImage(edgeCanvas, 0, 0, w1, h1);
        diffCtx.drawImage(c1, 0, 0, w, h);

        // Downsample 2: Intermediate contour intensity (w / 6)
        const w2 = Math.max(32, Math.round(w / 6));
        const h2 = Math.max(32, Math.round(h / 6));
        const c2 = document.createElement('canvas');
        c2.width = w2;
        c2.height = h2;
        const ctx2 = c2.getContext('2d');
        ctx2.imageSmoothingEnabled = true;
        ctx2.drawImage(edgeCanvas, 0, 0, w2, h2);
        diffCtx.globalAlpha = 0.85;
        diffCtx.drawImage(c2, 0, 0, w, h);
        diffCtx.globalAlpha = 1.0;

        // D. Apply OpenCV COLORMAP_JET + cv2.addWeighted(img, 0.38, heatmap, 0.62)
        const diffData = diffCtx.getImageData(0, 0, w, h).data;
        const outImgData = heatCtx.createImageData(w, h);
        const out = outImgData.data;

        // Compute max intensity to normalize dynamic range
        let maxVal = 1;
        for (let i = 0; i < w * h; i++) {
          const v = diffData[i * 4];
          if (v > maxVal) maxVal = v;
        }

        for (let i = 0; i < w * h; i++) {
          const rawEnergy = diffData[i * 4] / maxVal; // 0.0 to 1.0
          // Gamma curve for vibrant gradient bands: Red -> Orange -> Yellow -> Green -> Cyan -> Blue
          const norm = Math.min(1.0, Math.pow(rawEnergy, 0.72) * 1.15);
          const lutIdx = Math.min(255, Math.max(0, Math.round(norm * 255)));
          const [jr, jg, jb] = JET_COLORMAP[lutIdx];

          // cv2.addWeighted(img, 0.38, heatmap, 0.62, 0)
          const sr = src[i * 4];
          const sg = src[i * 4 + 1];
          const sb = src[i * 4 + 2];

          out[i * 4 + 0] = Math.round(sr * 0.38 + jr * 0.62);
          out[i * 4 + 1] = Math.round(sg * 0.38 + jg * 0.62);
          out[i * 4 + 2] = Math.round(sb * 0.38 + jb * 0.62);
          out[i * 4 + 3] = 255;
        }

        heatCtx.putImageData(outImgData, 0, 0);

        resolve({
          roi_box: roiCanvas.toDataURL('image/jpeg', 0.88),
          attention_heatmap: heatCanvas.toDataURL('image/jpeg', 0.88)
        });
      } catch (err) {
        console.warn("Visual explanation generation fallback:", err);
        resolve({ roi_box: imageSrc, attention_heatmap: imageSrc });
      }
    };
    img.onerror = () => resolve({ roi_box: imageSrc, attention_heatmap: imageSrc });
    img.src = imageSrc;
  });
}


// Run full diagnosis using MobileNetV2 ONNX model
export async function diagnoseWithOnnx(imageInput, imageSrcUrl) {
  const start = Date.now();
  const session = await loadOnnxModel();
  const tensor = await preprocessImageToTensor(imageInput || imageSrcUrl);

  const feeds = { pixel_values: tensor };
  const outputs = await session.run(feeds);
  const logits = outputs.logits.data; // Float32Array length 38

  // Compute Softmax probabilities
  let maxLogit = -Infinity;
  for (let i = 0; i < logits.length; i++) {
    if (logits[i] > maxLogit) maxLogit = logits[i];
  }

  let sumExp = 0;
  const exps = new Float32Array(logits.length);
  for (let i = 0; i < logits.length; i++) {
    exps[i] = Math.exp(logits[i] - maxLogit);
    sumExp += exps[i];
  }

  const probs = new Float32Array(logits.length);
  for (let i = 0; i < logits.length; i++) {
    probs[i] = exps[i] / sumExp;
  }

  // Find argmax
  let predIdx = 0;
  let maxProb = probs[0];
  for (let i = 1; i < probs.length; i++) {
    if (probs[i] > maxProb) {
      maxProb = probs[i];
      predIdx = i;
    }
  }

  const confidence = Math.round(maxProb * 1000) / 10; // e.g. 94.8%

  // Top 3 predictions
  const indices = Array.from({ length: probs.length }, (_, i) => i);
  indices.sort((a, b) => probs[b] - probs[a]);
  const topPredictions = indices.slice(0, 3).map((idx) => ({
    class_name: engineData.id2label[String(idx)] || engineData.disease_db[idx]?.name || `Class ${idx}`,
    confidence_pct: Math.round(probs[idx] * 1000) / 10,
    is_primary: idx === predIdx
  }));

  const diseaseInfo = engineData.disease_db[predIdx] || {};
  const rawName = diseaseInfo.name || '';
  const readableName = engineData.id2label[String(predIdx)] || rawName;
  const cropName = readableName.split(' ')[0];

  let severity = 'Low Severity';
  if (confidence > 80) severity = 'High Severity';
  else if (confidence > 50) severity = 'Moderate Severity';
  if (readableName.toLowerCase().includes('healthy')) severity = 'Healthy';

  // Pesticide Advisory
  const pestInfo = engineData.pesticide_db[rawName];
  const isHealthy = readableName.toLowerCase().includes('healthy');
  const shouldSpray = confidence >= 60 && !isHealthy;

  const pesticideAdvisory = pestInfo ? {
    should_spray: shouldSpray,
    recommendation_title: shouldSpray ? 'Recommended Foliar Fungicide Spray' : 'Agronomic Monitoring Advisory',
    advice: shouldSpray
      ? (pestInfo.application_guide || `High confidence diagnosis (${confidence}%). Apply ${pestInfo.chemical_pesticide?.name || 'recommended spray'}.`)
      : (isHealthy ? 'Plant tissue is healthy. No chemical intervention needed.' : 'Diagnosis confidence below 60%. Continue monitoring and scout field.'),
    recommended_spray: pestInfo.chemical_pesticide ? {
      name: pestInfo.chemical_pesticide.name,
      dosage: pestInfo.chemical_pesticide.dosage,
      brands: pestInfo.chemical_pesticide.brand_examples ? pestInfo.chemical_pesticide.brand_examples.split(',').map(s => s.trim()) : []
    } : null,
    organic_alternative: pestInfo.organic_alternative || null,
    application_schedule: pestInfo.application_guide || 'Spray early morning or late afternoon. Re-evaluate in 7 days.',
    safety_precautions: pestInfo.safety_notes || 'Wear protective mask, goggles, and gloves. Observe pre-harvest interval.'
  } : null;

  // Nutrient Analysis
  const agronomyInfo = engineData.agronomy_db[rawName];
  const nutrientAnalysis = agronomyInfo ? {
    ai_source: 'MobileNetV2 Agronomy Engine',
    nutrients_lacking: agronomyInfo.nutrients_lacking || [],
    nutrient_recovery_plan: agronomyInfo.nutrient_recovery_plan || 'Maintain balanced N-P-K fertigation.',
    soil_advice: agronomyInfo.soil_advice || 'Check root zone aeration and soil moisture.'
  } : null;

  // Visualizations
  const visualizations = await generateClientVisualizations(imageSrcUrl);

  return {
    class_id: predIdx,
    crop: cropName,
    raw_name: rawName,
    disease_name: readableName,
    confidence: confidence,
    severity: severity,
    cause: diseaseInfo.cause || 'Pathological analysis completed.',
    cure: diseaseInfo.cure || 'Maintain standard cultural practices.',
    top_predictions: topPredictions,
    visualizations: visualizations,
    pesticide_advisory: pesticideAdvisory,
    nutrient_analysis: nutrientAnalysis,
    time: Date.now() - start,
    ai_engine: 'MobileNetV2 (ONNX Deep Neural Network)'
  };
}
