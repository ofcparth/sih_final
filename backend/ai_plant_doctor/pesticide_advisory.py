"""
Pesticide and Fungicide Recommendation Advisory Module
Provides scientifically backed crop protection sprays based on AI diagnosis and confidence threshold (>60%).
"""

PESTICIDE_DATABASE = {
    "Apple___Apple_scab": {
        "crop": "Apple",
        "disease": "Apple Scab",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Mancozeb 75% WP / Difenoconazole 25% EC",
            "dosage": "2.0 - 2.5 g per liter of water (or 0.5 ml/L for Difenoconazole)",
            "brand_examples": "Dithane M-45, Score 250 EC"
        },
        "organic_alternative": {
            "name": "Wettable Sulfur 80% WP or Liquid Copper Octanoate",
            "dosage": "3.0 g per liter of water"
        },
        "application_guide": "Apply immediately at first appearance of olive-brown spots. Thoroughly coat upper and lower leaf surfaces. Repeat every 7-10 days during humid or rainy weather.",
        "safety_notes": "Wear protective mask and gloves. Observe a 14-day Pre-Harvest Interval (PHI)."
    },
    "Apple___Black_rot": {
        "crop": "Apple",
        "disease": "Black Rot",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Captan 50% WP or Thiophanate-Methyl 70% WP",
            "dosage": "2.5 g per liter of water",
            "brand_examples": "Captec, Topsin-M"
        },
        "organic_alternative": {
            "name": "Copper Soap Fungicide / Bordeaux Mixture 1%",
            "dosage": "10 g Copper Sulfate + 10 g Lime in 1L water"
        },
        "application_guide": "Prune out dead twigs and mummified fruit first. Spray canopy completely during early morning.",
        "safety_notes": "Avoid spraying during peak blossom to protect pollinating bees."
    },
    "Apple___Cedar_apple_rust": {
        "crop": "Apple",
        "disease": "Cedar Apple Rust",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Myclobutanil 20% WP or Mancozeb 75% WP",
            "dosage": "1.0 - 2.0 g per liter of water",
            "brand_examples": "Rally 40W, Systhane"
        },
        "organic_alternative": {
            "name": "Sulfur Dust or Serenade Garden Disease Control (Bacillus subtilis)",
            "dosage": "5 ml per liter of water"
        },
        "application_guide": "Begin sprays when pink flower buds appear and continue through petal fall at 7-10 day intervals.",
        "safety_notes": "Do not enter treated orchards without protective gear within 24 hours."
    },
    "Cherry___Powdery_mildew": {
        "crop": "Cherry",
        "disease": "Powdery Mildew",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Azoxystrobin 23% SC or Myclobutanil 10% WP",
            "dosage": "1.0 ml per liter of water",
            "brand_examples": "Amistar, Eagle 20EW"
        },
        "organic_alternative": {
            "name": "Potassium Bicarbonate or Cold-Pressed Neem Oil (1500 PPM)",
            "dosage": "4.0 - 5.0 ml per liter of water"
        },
        "application_guide": "Spray early morning before sunlight turns intense. Coat both sides of tender new leaves.",
        "safety_notes": "Do not apply sulfur-based sprays within 30 days of oil sprays."
    },
    "Corn___Cercospora_leaf_spot Gray_leaf_spot": {
        "crop": "Corn (Maize)",
        "disease": "Gray Leaf Spot (Cercospora)",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
            "dosage": "1.0 ml per liter of water (200 ml per acre)",
            "brand_examples": "Amistar Top, Quadris"
        },
        "organic_alternative": {
            "name": "Bio-fungicide Trichoderma viride / harzianum",
            "dosage": "5.0 g per liter of water"
        },
        "application_guide": "Spray at VT-R1 growth stage (tasseling/silking) if lesions appear on the third leaf below ear leaf or higher.",
        "safety_notes": "Do not apply within 30 days of maize harvest."
    },
    "Corn___Common_rust": {
        "crop": "Corn (Maize)",
        "disease": "Common Rust",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Propiconazole 25% EC or Mancozeb 75% WP",
            "dosage": "1.0 ml/L for Propiconazole OR 2.5 g/L for Mancozeb",
            "brand_examples": "Tilt 250 EC, Dithane M-45"
        },
        "organic_alternative": {
            "name": "Sulfur 80% WDG or Cold-Pressed Pure Neem Oil",
            "dosage": "2.5 g per liter of water (Sulfur) or 5 ml/L (Neem oil)"
        },
        "application_guide": "Apply foliar spray when rust pustules cover >5% of upper canopy leaves. Ensure complete coverage of leaf whorls.",
        "safety_notes": "Wear protective eyewear and face shield during spraying."
    },
    "Corn___Northern_Leaf_Blight": {
        "crop": "Corn (Maize)",
        "disease": "Northern Leaf Blight",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Pyraclostrobin 20% WG or Chlorothalonil 75% WP",
            "dosage": "2.0 g per liter of water",
            "brand_examples": "Headline, Bravo 720"
        },
        "organic_alternative": {
            "name": "Bacillus amyloliquefaciens microbial bio-spray",
            "dosage": "3.0 g per liter of water"
        },
        "application_guide": "Spray at first sign of cigar-shaped elliptical lesions, particularly during periods of high dew and moderate temperatures.",
        "safety_notes": "Observe recommended buffer zones around water bodies."
    },
    "Grape___Black_rot": {
        "crop": "Grape",
        "disease": "Black Rot",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Mancozeb 75% WP or Kresoxim-methyl 44.3% SC",
            "dosage": "2.5 g/L (Mancozeb) or 0.6 ml/L (Kresoxim-methyl)",
            "brand_examples": "Dithane M-45, Ergon"
        },
        "organic_alternative": {
            "name": "Bordeaux Mixture 1% or Copper Oxychloride 50% WP",
            "dosage": "2.5 g per liter of water"
        },
        "application_guide": "Apply from pre-bloom until 4-6 weeks after bloom to protect sensitive developing berries.",
        "safety_notes": "Allow 66 days PHI for Mancozeb in vineyards."
    },
    "Grape___Esca_(Black_Measles)": {
        "crop": "Grape",
        "disease": "Esca (Black Measles)",
        "pathogen_type": "Fungal Complex",
        "chemical_pesticide": {
            "name": "Thiophanate-Methyl wound paste / Fosetyl-Aluminium foliar spray",
            "dosage": "2.0 g per liter of water",
            "brand_examples": "Aliette, Topsin-M"
        },
        "organic_alternative": {
            "name": "Trichoderma atroviride trunk paste",
            "dosage": "Apply concentrated paste directly on pruning cuts"
        },
        "application_guide": "Seal vine pruning cuts immediately after cutting. Foliar systemic sprays assist vine defense against vascular clogging.",
        "safety_notes": "Sanitize pruning shears in 70% alcohol between vines."
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "crop": "Grape",
        "disease": "Leaf Blight (Isariopsis Spot)",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Carbendazim 50% WP or Copper Hydroxide 53.8% WG",
            "dosage": "1.0 g per liter of water",
            "brand_examples": "Bavistin, Kocide 3000"
        },
        "organic_alternative": {
            "name": "Copper Soap Fungicide",
            "dosage": "10 ml per liter of water"
        },
        "application_guide": "Spray canopy thoroughly after rainfall. Ensure underside of leaves is drenched.",
        "safety_notes": "Avoid spraying when temperatures exceed 32°C (90°F) to avoid leaf scorch."
    },
    "Orange___Haunglongbing_(Citrus_greening)": {
        "crop": "Orange / Citrus",
        "disease": "Huanglongbing (Citrus Greening)",
        "pathogen_type": "Bacterial (Vector: Asian Citrus Psyllid)",
        "chemical_pesticide": {
            "name": "Imidacloprid 17.8% SL or Thiamethoxam 25% WG (Vector Control)",
            "dosage": "0.5 ml per liter of water (Imidacloprid) or 0.3 g/L (Thiamethoxam)",
            "brand_examples": "Confidor, Actara"
        },
        "organic_alternative": {
            "name": "High-Grade Horticultural Spray Oil (1.5%) + Neem Oil 3000 PPM",
            "dosage": "15 ml mineral oil + 4 ml neem oil per liter"
        },
        "application_guide": "Target new flush leaves where psyllids feed and lay eggs. Prune out symptomatic yellow shoots. Apply zinc & nutritional foliar sprays to boost tree resilience.",
        "safety_notes": "Do not spray while citrus trees are in full bloom to protect honeybees."
    },
    "Peach___Bacterial_spot": {
        "crop": "Peach",
        "disease": "Bacterial Spot",
        "pathogen_type": "Bacterial",
        "chemical_pesticide": {
            "name": "Copper Oxychloride 50% WP + Streptocycline (Agri-Mycin)",
            "dosage": "2.0 g Copper + 0.6 g Streptocycline per 10 liters water",
            "brand_examples": "Blitox 50, Agri-Mycin 17"
        },
        "organic_alternative": {
            "name": "Fixed Copper Hydroxide (low rate) or Bacillus subtilis",
            "dosage": "1.5 g per liter of water"
        },
        "application_guide": "Apply from petal fall through cover sprays. Use low copper rates during leafed stages to avoid phytotoxicity.",
        "safety_notes": "Avoid application in hot, sunny midday conditions."
    },
    "Pepper,_bell___Bacterial_spot": {
        "crop": "Bell Pepper",
        "disease": "Bacterial Spot",
        "pathogen_type": "Bacterial",
        "chemical_pesticide": {
            "name": "Copper Hydroxide 53.8% WG mixed with Mancozeb 75% WP",
            "dosage": "2.0 g Copper Hydroxide + 2.0 g Mancozeb per liter of water",
            "brand_examples": "Kocide + Dithane M-45 (Synergistic tank mix)"
        },
        "organic_alternative": {
            "name": "Bacillus amyloliquefaciens (Bio-fungicide) or Liquid Copper Octanoate",
            "dosage": "3.0 - 5.0 ml per liter of water"
        },
        "application_guide": "Spray on a 7-day schedule when conditions are warm and wet. Avoid handling wet plants to prevent bacterial spread.",
        "safety_notes": "Wash spray equipment thoroughly; keep out of child reach."
    },
    "Potato___Early_blight": {
        "crop": "Potato",
        "disease": "Early Blight",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Chlorothalonil 75% WP or Mancozeb 75% WP or Difenoconazole 25% EC",
            "dosage": "2.0 - 2.5 g per liter of water (or 0.5 ml/L Difenoconazole)",
            "brand_examples": "Kavach, Dithane M-45, Score"
        },
        "organic_alternative": {
            "name": "Copper Oxychloride 50% WP or Trichoderma viride",
            "dosage": "2.5 g per liter of water"
        },
        "application_guide": "Apply at the first appearance of concentric brown ring spots on bottom leaves. Re-spray every 7-10 days.",
        "safety_notes": "Wear respirator during mixing. 7-day Pre-Harvest Interval."
    },
    "Potato___Late_blight": {
        "crop": "Potato",
        "disease": "Late Blight",
        "pathogen_type": "Oomycete / Water Mold",
        "chemical_pesticide": {
            "name": "Metalaxyl 8% + Mancozeb 64% WP (Systemic) or Cymoxanil 8% + Mancozeb 64% WP",
            "dosage": "2.5 g per liter of water",
            "brand_examples": "Ridomil Gold MZ, Curzate M"
        },
        "organic_alternative": {
            "name": "Copper Hydroxide 77% WP or Bordeaux Mixture 1%",
            "dosage": "2.5 g per liter of water"
        },
        "application_guide": "URGENT INTERVENTION: Late blight can destroy a field in 4-7 days. Spray immediately across all foliage and stems; re-apply every 5-7 days under cool, foggy or rainy weather.",
        "safety_notes": "Rotate active ingredients to prevent pathogen resistance. Wear complete PPE."
    },
    "Squash___Powdery_mildew": {
        "crop": "Squash / Cucurbits",
        "disease": "Powdery Mildew",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Penconazole 10% EC or Trifloxystrobin 25% + Tebuconazole 50% WG",
            "dosage": "0.5 ml/L (Penconazole) or 0.5 g/L (Trifloxystrobin+Tebuconazole)",
            "brand_examples": "Topas 100 EC, Nativo 75 WG"
        },
        "organic_alternative": {
            "name": "Potassium Bicarbonate (MilStop) or Diluted Milk Solution (40% milk / 60% water)",
            "dosage": "3.0 g per liter of water (Bicarbonate)"
        },
        "application_guide": "Spray white powdery patches promptly. Spray both upper and lower surface of giant squash leaves.",
        "safety_notes": "Do not spray in midday sun to avoid leaf burn."
    },
    "Strawberry___Leaf_scorch": {
        "crop": "Strawberry",
        "disease": "Leaf Scorch",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Captan 50% WP or Azoxystrobin 23% SC",
            "dosage": "2.0 g/L (Captan) or 1.0 ml/L (Azoxystrobin)",
            "brand_examples": "Captan 50W, Quadris"
        },
        "organic_alternative": {
            "name": "Copper Soap or Bio-fungicide Bacillus subtilis",
            "dosage": "4.0 ml per liter of water"
        },
        "application_guide": "Remove severely blighted old leaves before spraying. Apply to crowns and newly emerging runner leaves.",
        "safety_notes": "Observe harvest wait periods carefully."
    },
    "Tomato___Bacterial_spot": {
        "crop": "Tomato",
        "disease": "Bacterial Spot",
        "pathogen_type": "Bacterial",
        "chemical_pesticide": {
            "name": "Copper Hydroxide 53.8% WG + Streptocycline (Plant Bactericide)",
            "dosage": "2.0 g Copper Hydroxide + 0.1 g Streptocycline per liter water",
            "brand_examples": "Kocide 2000 + Streptocycline"
        },
        "organic_alternative": {
            "name": "Liquid Copper Octanoate or Bacillus amyloliquefaciens",
            "dosage": "4.0 ml per liter of water"
        },
        "application_guide": "Spray when plants are dry, covering flowers and young fruits. Repeat every 7 days in wet rainy spells.",
        "safety_notes": "Wear waterproof gloves and face mask."
    },
    "Tomato___Early_blight": {
        "crop": "Tomato",
        "disease": "Early Blight",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Chlorothalonil 75% WP or Mancozeb 75% WP or Azoxystrobin 23% SC",
            "dosage": "2.0 g per liter of water (Chlorothalonil) or 1.0 ml/L (Azoxystrobin)",
            "brand_examples": "Bravo 720, Dithane M-45, Quadris"
        },
        "organic_alternative": {
            "name": "Copper Oxychloride 50% WP or Organic Neem Oil (1500 PPM)",
            "dosage": "2.5 g/L (Copper) or 5 ml/L (Neem oil)"
        },
        "application_guide": "Prune out bottom 12 inches of infected leaves to increase air circulation, then spray remaining plant thoroughly.",
        "safety_notes": "Re-entry interval: 24 hours. Wash hands after handling."
    },
    "Tomato___Late_blight": {
        "crop": "Tomato",
        "disease": "Late Blight",
        "pathogen_type": "Oomycete / Water Mold",
        "chemical_pesticide": {
            "name": "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold) or Dimethomorph 50% WP",
            "dosage": "2.5 g per liter of water (Ridomil) or 1.0 g/L (Dimethomorph)",
            "brand_examples": "Ridomil Gold MZ, Acrobat"
        },
        "organic_alternative": {
            "name": "Copper Hydroxide 53.8% WG or Bordeaux Mixture 1%",
            "dosage": "2.5 g per liter of water"
        },
        "application_guide": "CRITICAL EMERGENCY: Apply immediately. Late blight moves rapidly through stems and fruit. Spray upper and lower leaves, stems, and flower trusses.",
        "safety_notes": "Destroy heavily blighted vines by bagging; do not compost."
    },
    "Tomato___Leaf_Mold": {
        "crop": "Tomato",
        "disease": "Leaf Mold",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Chlorothalonil 75% WP or Mancozeb 75% WP",
            "dosage": "2.0 g per liter of water",
            "brand_examples": "Daconil, Dithane M-45"
        },
        "organic_alternative": {
            "name": "Potassium Bicarbonate or Copper Soap Spray",
            "dosage": "3.0 g per liter of water"
        },
        "application_guide": "Ensure high ventilation and reduce humidity. Spray the pale yellow spots and velvety olive mold on lower leaf surfaces.",
        "safety_notes": "Ventilate greenhouse/tunnel before and after spraying."
    },
    "Tomato___Septoria_leaf_spot": {
        "crop": "Tomato",
        "disease": "Septoria Leaf Spot",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Mancozeb 75% WP or Chlorothalonil 75% WP",
            "dosage": "2.0 - 2.5 g per liter of water",
            "brand_examples": "Indofil M-45, Bravo"
        },
        "organic_alternative": {
            "name": "Liquid Copper Fungicide or Serenade Bio-spray",
            "dosage": "3.0 - 5.0 ml per liter of water"
        },
        "application_guide": "Spray from bottom upwards, thoroughly drenching both surface of leaves where tiny dark-rimmed spots start.",
        "safety_notes": "Mulch soil surface to prevent soil splash during rain."
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "crop": "Tomato",
        "disease": "Two-Spotted Spider Mite Infestation",
        "pathogen_type": "Pest / Arachnid",
        "chemical_pesticide": {
            "name": "Abamectin 1.9% EC or Spiromesifen 22.9% SC (Miticide)",
            "dosage": "0.75 ml per liter of water (Abamectin) or 1.0 ml/L (Spiromesifen)",
            "brand_examples": "Vertimec, Oberon"
        },
        "organic_alternative": {
            "name": "Cold-Pressed Neem Oil 3000 PPM or Insecticidal Potassium Soap",
            "dosage": "5.0 ml per liter of water (with a few drops of mild dish soap as emulsifier)"
        },
        "application_guide": "High-pressure spray directed specifically at the UNDERSIDE of leaves where mites feed and spin webs. Apply in the evening.",
        "safety_notes": "Wear respirator; do not spray during midday heat."
    },
    "Tomato___Target_Spot": {
        "crop": "Tomato",
        "disease": "Target Spot",
        "pathogen_type": "Fungal",
        "chemical_pesticide": {
            "name": "Azoxystrobin 18.2% + Difenoconazole 11.4% SC or Boscalid",
            "dosage": "1.0 ml per liter of water",
            "brand_examples": "Amistar Top, Endura"
        },
        "organic_alternative": {
            "name": "Copper Hydroxide 53.8% WG",
            "dosage": "2.0 g per liter of water"
        },
        "application_guide": "Spray when circular brown target-like lesions are seen on foliage or green fruits. Ensure good air circulation.",
        "safety_notes": "Observe pre-harvest safety interval of 7 days."
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "crop": "Tomato",
        "disease": "Yellow Leaf Curl Virus (Vector: Whitefly)",
        "pathogen_type": "Viral (Vector: Whitefly)",
        "chemical_pesticide": {
            "name": "Diafenthiuron 50% WP or Acetamiprid 20% SP (Whitefly Vector Control)",
            "dosage": "1.2 g/L (Diafenthiuron) or 0.4 g/L (Acetamiprid)",
            "brand_examples": "Pegasus, Pride"
        },
        "organic_alternative": {
            "name": "Yellow Sticky Traps + Cold-Pressed Neem Oil 3000 PPM",
            "dosage": "5.0 ml per liter of water sprayed on whitefly resting zones"
        },
        "application_guide": "There is no direct cure for viral infections once inside the plant; control whitefly insect vectors immediately to stop transmission to adjacent crops.",
        "safety_notes": "Remove and securely bag heavily stunted plants."
    },
    "Tomato___Tomato_mosaic_virus": {
        "crop": "Tomato",
        "disease": "Tomato Mosaic Virus (ToMV)",
        "pathogen_type": "Viral (Mechanical Contact)",
        "chemical_pesticide": {
            "name": "Skim Milk Solution (20% concentration) or Trisodium Phosphate (TSP) tool sterilizer",
            "dosage": "200 ml milk per 800 ml water (Spray to inhibit viral transmission by contact)",
            "brand_examples": "Non-fat dry milk / TSP disinfectant"
        },
        "organic_alternative": {
            "name": "Soap solution tool wash + Neem spray for insect vectors",
            "dosage": "Sterilize shears and hands in 10% TSP or milk before touching clean plants"
        },
        "application_guide": "Viruses cannot be cured with standard fungicides. Immediately rogue out (remove & destroy) infected plants. Wash hands thoroughly with soap after handling.",
        "safety_notes": "Do not compost infected plants. Wash smoker hands as tobacco can carry mosaic virus."
    }
}


def get_pesticide_recommendation(disease_raw_name, display_name, confidence):
    """
    Evaluates AI diagnosis and confidence against the 60% threshold.
    Returns comprehensive pesticide recommendations and application advice.
    """
    is_healthy = "healthy" in disease_raw_name.lower() or "healthy" in display_name.lower()
    
    # Extract crop name if possible
    crop_name = display_name.split()[0] if display_name else "Crop"
    if "___" in disease_raw_name:
        crop_name = disease_raw_name.split("___")[0].replace("_", " ")

    # Case 1: Confidence <= 60%
    if confidence <= 60.0:
        return {
            "status": "low_confidence",
            "should_spray": False,
            "threshold_met": False,
            "confidence": confidence,
            "crop": crop_name,
            "message": f"AI diagnosis confidence ({confidence}%) is below the 60% safety threshold.",
            "recommendation_title": "Manual Inspection Recommended",
            "advice": "Because confidence is below 60%, immediate chemical pesticide spraying is NOT advised to avoid unnecessary chemical exposure. Please inspect the leaf in daylight or upload a clearer, well-lit close-up photo."
        }

    # Case 2: Healthy plant with >60% confidence
    if is_healthy:
        return {
            "status": "healthy",
            "should_spray": False,
            "threshold_met": True,
            "confidence": confidence,
            "crop": crop_name,
            "message": f"Plant is diagnosed as healthy with {confidence}% confidence!",
            "recommendation_title": "No Chemical Pesticide Required",
            "advice": "Your crop shows no signs of active disease. Maintain balanced irrigation, adequate sunlight, and apply organic compost or bio-fertilizers to sustain natural plant immunity."
        }

    # Case 3: Diseased plant with >60% confidence
    data = PESTICIDE_DATABASE.get(disease_raw_name)
    
    # Fallback if not specifically in database
    if not data:
        return {
            "status": "recommended",
            "should_spray": True,
            "threshold_met": True,
            "confidence": confidence,
            "crop": crop_name,
            "disease_name": display_name,
            "recommendation_title": f"Recommended Crop Protection Spray for {crop_name}",
            "chemical_pesticide": {
                "name": "Broad-Spectrum Protectant Fungicide (e.g., Mancozeb 75% WP or Copper Oxychloride 50% WP)",
                "dosage": "2.0 - 2.5 g per liter of water",
                "brand_examples": "Dithane M-45, Blitox"
            },
            "organic_alternative": {
                "name": "Organic Cold-Pressed Neem Oil (1500 PPM) or Copper Soap",
                "dosage": "5.0 ml per liter of water"
            },
            "application_guide": "Spray both sides of affected foliage early in the morning or late evening. Repeat every 7-10 days if symptoms persist.",
            "safety_notes": "Wear gloves and a face mask. Check label for pre-harvest safety interval."
        }

    return {
        "status": "recommended",
        "should_spray": True,
        "threshold_met": True,
        "confidence": confidence,
        "crop": data["crop"],
        "disease_name": data["disease"],
        "pathogen_type": data.get("pathogen_type", "Fungal/Bacterial"),
        "recommendation_title": f"Pesticide Spray Advisory for {data['crop']} ({data['disease']})",
        "chemical_pesticide": data["chemical_pesticide"],
        "organic_alternative": data["organic_alternative"],
        "application_guide": data["application_guide"],
        "safety_notes": data["safety_notes"]
    }
