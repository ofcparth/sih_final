"""
AI Agronomy & Nutrient Deficiency Service
Integrates with Google Gemini API and Groq Cloud API, with a built-in Agronomic Expert Engine fallback.
Processes disease diagnosis, pathogen causes, and analyzes specific plant nutrient deficiencies.
"""

import os
import json
import requests

# Load environment variables from .env if present
def load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip().strip("'\"")

load_env_file()

# Comprehensive agronomic knowledge base of nutrient deficiencies by crop and disease
AGRONOMY_KNOWLEDGE_BASE = {
    "Potato___Early_blight": {
        "nutrients_lacking": [
            {
                "nutrient": "Potassium (K)",
                "role": "Cellular Osmoregulation & Disease Resistance",
                "deficiency_cause": "Alternaria solani aggressively targets foliage with low potassium status. Potassium-deficient leaves accumulate soluble sugars and free amino acids that fungal hyphae readily consume.",
                "symptoms": "Marginal leaf scorch, bronze flecking, accelerated bottom-leaf dieback.",
                "supplement": "Potassium Schoenite or Potassium Nitrate (13:0:45)",
                "dosage": "4.0 - 5.0 g per liter of water (foliar spray)"
            },
            {
                "nutrient": "Zinc (Zn)",
                "role": "Enzyme Activation & Auxin Synthesis",
                "deficiency_cause": "Fungal necrosis disrupts micronutrient uptake, leading to stunted leaf blade expansion and reduced plant phytoalexin defense.",
                "symptoms": "Interveinal chlorosis, small leaves, reduced internode elongation.",
                "supplement": "Chelated Zinc (Zn-EDTA 12%)",
                "dosage": "1.0 g per liter of water"
            }
        ],
        "nutrient_recovery_plan": "Apply a high-potassium foliar feed combined with chelated zinc immediately after removing severely infected lower leaves. Avoid excessive nitrogen which promotes soft, vulnerable vegetative growth.",
        "soil_advice": "Ensure soil pH is between 5.5 - 6.5. Top-dress with well-rotted organic compost enriched with wood ash (rich in potassium)."
    },
    "Potato___Late_blight": {
        "nutrients_lacking": [
            {
                "nutrient": "Calcium (Ca)",
                "role": "Cell Wall Pectin & Membrane Integrity",
                "deficiency_cause": "Phytophthora zoospores produce pectinases that dissolve the middle lamella. Insufficient calcium makes epidermal cell walls highly porous and unable to resist enzymatic digestion.",
                "symptoms": "Blackened necrosis, water-soaked leaf margins, stem collapse.",
                "supplement": "Calcium Nitrate (18.8% Ca, 15.5% N)",
                "dosage": "4.0 - 5.0 g per liter of water"
            },
            {
                "nutrient": "Magnesium (Mg)",
                "role": "Chlorophyll Core & Photosynthetic Energy (ATP)",
                "deficiency_cause": "Extensive vascular breakdown caused by late blight blocks phloem translocation of magnesium, halting carbohydrate synthesis.",
                "symptoms": "Rapid interveinal yellowing followed by dark necrotic lesions.",
                "supplement": "Magnesium Sulfate (Epsom Salt)",
                "dosage": "3.0 g per liter of water"
            }
        ],
        "nutrient_recovery_plan": "Foliar application of water-soluble Calcium Nitrate to reinforce cell wall strength in unaffected foliage. Rebalance soil nutrition once blight is chemically halted.",
        "soil_advice": "Avoid over-watering and poorly drained soils. Maintain balanced calcium-to-magnesium soil saturation."
    },
    "Tomato___Early_blight": {
        "nutrients_lacking": [
            {
                "nutrient": "Potassium (K)",
                "role": "Stomatal Function & Plant Immunity",
                "deficiency_cause": "Alternaria solani thrives on stressed plants deficient in potassium. Plants redirect potassium to fruits, leaving vegetative leaves vulnerable to rapid necrotic spot development.",
                "symptoms": "Yellow halos around target spots, curling leaf tips, premature defoliation.",
                "supplement": "Mono-Potassium Phosphate (0:52:34) or Potassium Sulfate",
                "dosage": "4.0 g per liter of water"
            },
            {
                "nutrient": "Nitrogen (N) Balance",
                "role": "Vigor and Protein Synthesis",
                "deficiency_cause": "Nitrogen exhaustion during heavy fruiting stages weakens lower vegetative leaves, inviting Alternaria spores.",
                "symptoms": "Pale green bottom foliage with concentric brown ring spots.",
                "supplement": "Balanced NPK (19:19:19 or 20:20:20) water-soluble",
                "dosage": "3.0 g per liter of water"
            }
        ],
        "nutrient_recovery_plan": "Foliar feed with 0:52:34 (MKP) to supply both phosphorus and potassium directly to leaf stomata, bypassing stressed roots.",
        "soil_advice": "Mulch the root zone with straw to prevent soil-splash pathogens and retain consistent root moisture."
    },
    "Tomato___Late_blight": {
        "nutrients_lacking": [
            {
                "nutrient": "Calcium (Ca)",
                "role": "Cell Wall Stability & Tissue Hardiness",
                "deficiency_cause": "Phytophthora easily destroys soft tissues low in calcium. Calcium strengthens the structural matrix against oomycete mycelial growth.",
                "symptoms": "Dark greasy water-soaked lesions on stems, petiole collapse, fruit rot.",
                "supplement": "Calcium Chloride (0.3%) or Calcium Nitrate",
                "dosage": "4.0 g per liter of water"
            },
            {
                "nutrient": "Phosphorus (P)",
                "role": "Root Resilience & Systemic Defense",
                "deficiency_cause": "Infection disrupts ATP generation and energy transport needed for phytoalexin defense compounds.",
                "symptoms": "Purpling of leaf veins followed by greasy wilt.",
                "supplement": "Mono-Ammonium Phosphate (12:61:0)",
                "dosage": "3.0 g per liter of water"
            }
        ],
        "nutrient_recovery_plan": "After applying systemic fungicides (Ridomil Gold), spray Calcium Nitrate to fortify remaining healthy vines and fruit clusters.",
        "soil_advice": "Ensure high aeration in soil. Avoid cold, saturated root zones."
    },
    "Tomato___Bacterial_spot": {
        "nutrients_lacking": [
            {
                "nutrient": "Calcium (Ca)",
                "role": "Intercellular Cementing & Pectin Binding",
                "deficiency_cause": "Xanthomonas bacteria invade through hydathodes and stomata. Low calcium creates fragile intercellular spaces that easily leak nutrients to bacteria.",
                "symptoms": "Small greasy water-soaked specks turning brown with chlorotic borders.",
                "supplement": "Chelated Calcium (Ca-EDTA) or Calcium Nitrate",
                "dosage": "3.0 - 4.0 g per liter of water"
            },
            {
                "nutrient": "Boron (B)",
                "role": "Membrane Integrity & Lignification",
                "deficiency_cause": "Boron deficiency inhibits phenolic defense synthesis, leaving tomato cuticle thin and prone to bacterial lesions.",
                "symptoms": "Brittle stems, stunted leaf buds, deformed small fruit lesions.",
                "supplement": "Solubor (Borax 20% B)",
                "dosage": "1.0 g per liter of water"
            }
        ],
        "nutrient_recovery_plan": "Foliar spray of Calcium + Boron combo (Cal-Bor) to rebuild cuticular wax and harden leaves against bacterial colonization.",
        "soil_advice": "Maintain soil pH around 6.2 - 6.8. Avoid overhead splash irrigation."
    },
    "Apple___Apple_scab": {
        "nutrients_lacking": [
            {
                "nutrient": "Calcium (Ca)",
                "role": "Leaf Cuticle Density & Epicuticular Wax",
                "deficiency_cause": "High leaf nitrogen combined with low calcium results in thin, succulent leaf layers easily penetrated by Venturia inaequalis ascospores.",
                "symptoms": "Olive-brown velvety spots, puckered distorted leaves, scabby fruit.",
                "supplement": "Foliar Calcium Chloride or Calcium Chelate",
                "dosage": "3.0 - 5.0 g per liter of water"
            },
            {
                "nutrient": "Silicon (Si)",
                "role": "Physical Cell Wall Shield",
                "deficiency_cause": "Silicon polymerizes beneath the cuticle, forming a mechanical barrier against fungal appressoria penetration.",
                "symptoms": "Soft foliage susceptible to fungal spore adhesion.",
                "supplement": "Potassium Silicate",
                "dosage": "1.5 - 2.0 ml per liter of water"
            }
        ],
        "nutrient_recovery_plan": "Apply post-bloom calcium sprays bi-weekly. Supplement with potassium silicate to deposit hard silica armor on apple leaf surfaces.",
        "soil_advice": "Apply dolomitic lime to acid soils in autumn to boost available calcium and magnesium."
    },
    "Corn___Common_rust": {
        "nutrients_lacking": [
            {
                "nutrient": "Potassium (K)",
                "role": "Vascular Transport & Epidermal Elasticity",
                "deficiency_cause": "Puccinia rust pustules rupture epidermal cells, triggering intense transpiration and potassium leaching from foliage.",
                "symptoms": "Golden/cinnamon powdery pustules, leaf edge drying, weak stalk strength.",
                "supplement": "Potassium Sulfate (0:0:50 SOP)",
                "dosage": "5.0 g per liter of water"
            },
            {
                "nutrient": "Phosphorus (P)",
                "role": "Energy Metabolism & Root Support",
                "deficiency_cause": "Rust infection draws massive amounts of plant carbohydrates and phosphate to sustain fungal sporulation.",
                "symptoms": "Purplish red tint on lower leaves, slowed ear development.",
                "supplement": "Di-Ammonium Phosphate (DAP) or 0:52:34",
                "dosage": "4.0 g per liter of water"
            }
        ],
        "nutrient_recovery_plan": "Spray 0:0:50 Potassium Sulfate to arrest water loss and restore turgor pressure in infected maize whorls.",
        "soil_advice": "Side-dress maize with balanced NPK before tasseling; avoid excess nitrogen without matching potassium."
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "nutrients_lacking": [
            {
                "nutrient": "Magnesium (Mg)",
                "role": "Chlorophyll Molecule Heart",
                "deficiency_cause": "Spider mites pierce individual plant cells and consume the chloroplasts, triggering intense bronzing and magnesium starvation.",
                "symptoms": "Speckled stippled yellowing of leaves, webbing, bronze scorched foliage.",
                "supplement": "Magnesium Sulfate (Epsom Salt)",
                "dosage": "3.0 - 4.0 g per liter of water"
            },
            {
                "nutrient": "Iron (Fe)",
                "role": "Photosynthetic Electron Transport",
                "deficiency_cause": "Cellular sap draining restricts micronutrient uptake to terminal shoots.",
                "symptoms": "Fine bleached stippling across upper canopy leaves.",
                "supplement": "Chelated Iron (Fe-EDDHA / Fe-EDTA)",
                "dosage": "1.0 g per liter of water"
            }
        ],
        "nutrient_recovery_plan": "Foliar spray with Magnesium Sulfate + Chelated Micronutrient solution 24 hours after applying miticide/neem oil to stimulate chlorophyll regeneration.",
        "soil_advice": "Ensure consistent soil moisture; drought-stressed plants produce higher nitrogen sap that attracts mite swarms."
    },
    "Tomato___healthy": {
        "nutrients_lacking": [],
        "nutrient_recovery_plan": "Crop nutrition is in optimal equilibrium. Maintain regular fertigation schedule with balanced NPK (19:19:19) and periodic compost tea.",
        "soil_advice": "Keep soil organic matter >3% and mulch to sustain beneficial rhizosphere microorganisms."
    }
}


def call_gemini_api(api_key, crop, disease, cause, confidence):
    """Call Google Gemini API for dynamic agronomy analysis."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt = f"""You are an elite Senior Plant Pathologist & Agronomist.
Diagnosed Crop: {crop}
Disease: {disease}
Identified Cause/Pathogen: {cause}
AI Confidence: {confidence}%

Perform a detailed scientific NUTRIENT DEFICIENCY & PESTICIDE ANALYSIS.
Determine what essential plant nutrients (e.g. Potassium, Calcium, Nitrogen, Magnesium, Zinc, Boron, Phosphorus, Silicon) are lacking, blocked, or needed for physiological recovery.

Return ONLY a valid JSON object strictly adhering to this schema:
{{
  "nutrients_lacking": [
    {{
      "nutrient": "Nutrient Name (e.g., Potassium (K))",
      "role": "Biological role in plant defense",
      "deficiency_cause": "How this disease causes or exploits this nutrient deficiency",
      "symptoms": "Observable foliar symptoms of this deficiency",
      "supplement": "Recommended fertilizer/nutrient product (e.g., Potassium Schoenite)",
      "dosage": "Specific dilution or application dosage (e.g., 4-5 g per liter foliar spray)"
    }}
  ],
  "nutrient_recovery_plan": "2-3 sentences explaining overall foliar & soil nutrition strategy for recovery",
  "soil_advice": "Actionable soil management, pH, and root-zone advice",
  "ai_pesticide_advice": {{
    "chemical_spray": "Recommended chemical spray with dosage and active ingredient",
    "organic_spray": "Organic / biological spray alternative with dosage",
    "spray_timing": "Best time of day and application frequency"
  }}
}}"""

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
    }
    
    response = requests.post(url, headers=headers, json=payload, timeout=12)
    response.raise_for_status()
    result = response.json()
    
    text = result['candidates'][0]['content']['parts'][0]['text']
    data = json.loads(text)
    data["ai_source"] = "Google Gemini 1.5 Flash (Live AI)"
    return data


def call_groq_api(api_key, crop, disease, cause, confidence):
    """Call Groq API (LLaMA-3.3-70b-versatile) for dynamic agronomy analysis."""
    url = "https://api.groq.com/openai/v1/chat/completions"
    
    prompt = f"""You are an elite Senior Plant Pathologist & Agronomist.
Diagnosed Crop: {crop}
Disease: {disease}
Identified Cause/Pathogen: {cause}
AI Confidence: {confidence}%

Perform a detailed scientific NUTRIENT DEFICIENCY & PESTICIDE ANALYSIS.
Determine what essential plant nutrients (e.g. Potassium, Calcium, Nitrogen, Magnesium, Zinc, Boron, Phosphorus, Silicon) are lacking, blocked, or needed for physiological recovery.

Return ONLY a valid JSON object strictly adhering to this schema:
{{
  "nutrients_lacking": [
    {{
      "nutrient": "Nutrient Name (e.g., Potassium (K))",
      "role": "Biological role in plant defense",
      "deficiency_cause": "How this disease causes or exploits this nutrient deficiency",
      "symptoms": "Observable foliar symptoms of this deficiency",
      "supplement": "Recommended fertilizer/nutrient product (e.g., Potassium Schoenite)",
      "dosage": "Specific dilution or application dosage (e.g., 4-5 g per liter foliar spray)"
    }}
  ],
  "nutrient_recovery_plan": "2-3 sentences explaining overall foliar & soil nutrition strategy for recovery",
  "soil_advice": "Actionable soil management, pH, and root-zone advice",
  "ai_pesticide_advice": {{
    "chemical_spray": "Recommended chemical spray with dosage and active ingredient",
    "organic_spray": "Organic / biological spray alternative with dosage",
    "spray_timing": "Best time of day and application frequency"
  }}
}}"""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Try preferred high-performance models available on Groq
    candidate_models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]
    last_err = None
    
    for model_name in candidate_models:
        try:
            payload = {
                "model": model_name,
                "messages": [
                    {"role": "system", "content": "You are an agricultural plant pathologist and soil agronomist. Always return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=12)
            response.raise_for_status()
            result = response.json()
            content = result['choices'][0]['message']['content']
            data = json.loads(content)
            data["ai_source"] = f"Groq Cloud AI ({model_name})"
            return data
        except Exception as err:
            last_err = err
            continue
            
    raise last_err or RuntimeError("All Groq models failed")


def analyze_crop_nutrients_and_pesticide(disease_raw_name, display_name, cause, confidence):
    """
    Primary interface for nutrient deficiency & pesticide processing.
    Tries live Gemini API, then Groq API, then Agronomy Expert Engine fallback.
    """
    load_env_file()
    is_healthy = "healthy" in disease_raw_name.lower() or "healthy" in display_name.lower()
    crop_name = display_name.split()[0] if display_name else "Crop"
    if "___" in disease_raw_name:
        crop_name = disease_raw_name.split("___")[0].replace("_", " ")

    if is_healthy:
        return {
            "status": "healthy",
            "ai_source": "AI Agronomy Intelligence Engine",
            "nutrients_lacking": [],
            "nutrient_recovery_plan": f"The {crop_name} plant shows healthy, vigorous foliage with optimal nutrient reserves. No deficiency detected.",
            "soil_advice": "Maintain standard organic mulch, balanced irrigation, and a monthly maintenance dose of water-soluble NPK (19:19:19).",
            "ai_pesticide_advice": {
                "chemical_spray": "None required.",
                "organic_spray": "Optional organic preventative: Neem oil 1500 PPM monthly.",
                "spray_timing": "Early morning or late afternoon."
            }
        }

    # 1. Try Google Gemini API if key is available
    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if gemini_key:
        try:
            return call_gemini_api(gemini_key, crop_name, display_name, cause, confidence)
        except Exception as e:
            print(f"[AI Service] Gemini API call failed ({e}), checking Groq...")

    # 2. Try Groq API if key is available
    groq_key = os.environ.get("GROQ_API_KEY")
    if groq_key:
        try:
            return call_groq_api(groq_key, crop_name, display_name, cause, confidence)
        except Exception as e:
            print(f"[AI Service] Groq API call failed ({e}), using Expert Agronomy Engine...")

    # 3. Use Agronomy Expert Engine Knowledge Base
    data = AGRONOMY_KNOWLEDGE_BASE.get(disease_raw_name)
    if not data:
        # Generic intelligent agronomy extrapolation
        data = {
            "nutrients_lacking": [
                {
                    "nutrient": "Potassium (K)",
                    "role": "Plant Immunity & Cell Turgor",
                    "deficiency_cause": f"Pathogen infection in {crop_name} breaks down cell membranes and accelerates foliar senescence, draining mobile potassium.",
                    "symptoms": "Leaf margin chlorosis, premature tip burn.",
                    "supplement": "Potassium Sulfate (0:0:50) or Potassium Nitrate",
                    "dosage": "4.0 - 5.0 g per liter of water (foliar spray)"
                },
                {
                    "nutrient": "Calcium (Ca)",
                    "role": "Cell Wall Pectin & Structural Barrier",
                    "deficiency_cause": "Enzymatic cellular breakdown limits calcium integration into newly developing foliage.",
                    "symptoms": "Curling young leaves, weak leaf stems.",
                    "supplement": "Chelated Calcium or Calcium Nitrate",
                    "dosage": "3.0 - 4.0 g per liter of water"
                }
            ],
            "nutrient_recovery_plan": f"Restore vascular transport by applying a water-soluble potassium and calcium foliar supplement to boost {crop_name} cellular resilience.",
            "soil_advice": "Check soil pH and ensure adequate drainage. Side-dress with well-decomposed organic manure."
        }

    result = {
        "status": "deficiency_detected",
        "ai_source": "Agronomy Expert AI Engine (Built-in)",
        "crop": crop_name,
        "disease": display_name,
        "nutrients_lacking": data["nutrients_lacking"],
        "nutrient_recovery_plan": data["nutrient_recovery_plan"],
        "soil_advice": data["soil_advice"],
        "ai_pesticide_advice": {
            "chemical_spray": "Mancozeb 75% WP or Chlorothalonil 75% WP @ 2.0-2.5 g/L",
            "organic_spray": "Cold-Pressed Neem Oil (1500 PPM) @ 5 ml/L",
            "spray_timing": "Spray in the early morning or evening; repeat every 7-10 days."
        }
    }
    return result
