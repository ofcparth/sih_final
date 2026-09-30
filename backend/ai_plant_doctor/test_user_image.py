import os
import json
import base64
from PIL import Image

from plant_doctor import PlantDoctor

def test():
    doctor = PlantDoctor()
    # Test on test_blank.jpg first to verify pipeline
    test_img_path = os.path.join(os.path.dirname(__file__), "test_blank.jpg")
    img = Image.open(test_img_path)
    res = doctor.diagnose(img, include_nutrients=True, include_pesticides=True)
    
    print("--- DIAGNOSIS TEST RESULT ---")
    print("Crop:", res.get("crop"))
    print("Disease:", res.get("disease_name"))
    print("Confidence:", res.get("confidence"), "%")
    print("Cause:", res.get("cause"))
    print("Pesticide Spray Recommended:", res.get("pesticide_advisory", {}).get("should_spray"))
    print("Nutrients Lacking:", len(res.get("nutrient_analysis", {}).get("nutrients_lacking", [])))
    print("Visualizations Available:", list(res.get("visualizations", {}).keys()))

if __name__ == "__main__":
    test()
