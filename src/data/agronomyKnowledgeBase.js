// ============================================================
//  Agronomy Knowledge Base & Client-Side Diagnosis Engine
//  Provides scientific pathology, pesticide schedules, and
//  nutrient deficiency recovery plans across crop species.
// ============================================================

export const AGRONOMY_DIAGNOSES = {
  Tomato: {
    crop: 'Tomato',
    disease_name: 'Tomato Early Blight (Alternaria solani)',
    cause: 'Alternaria solani (Fungal Pathogen) exacerbated by humid microclimates (>80% RH) and warm temperatures (24-29°C).',
    cure: 'Apply Mancozeb 75% WP (2.0-2.5 g/L) or Chlorothalonil early morning. Prune infected bottom foliage to improve air circulation. Avoid overhead sprinkler irrigation.',
    confidence: 94.8,
    severity: 'High Severity',
    affectedArea: '24.5%',
    top_predictions: [
      { class_name: 'Tomato Early Blight', confidence_pct: 94.8, is_primary: true },
      { class_name: 'Tomato Leaf Mold', confidence_pct: 3.6, is_primary: false },
      { class_name: 'Tomato Healthy', confidence_pct: 1.6, is_primary: false },
    ],
    pesticide_advisory: {
      should_spray: true,
      recommendation_title: 'Recommended Foliar Fungicide Spray',
      advice: 'High confidence fungal blight diagnosis (>60%). Apply contact fungicide immediately to halt sporulation.',
      recommended_spray: {
        name: 'Mancozeb 75% WP',
        dosage: '2.0 - 2.5 g / L water',
        brands: ['Dithane M-45', 'Indofil M-45', 'UPL Saaf'],
      },
      organic_alternative: {
        name: 'Neem Oil 10,000 PPM + Bacillus subtilis',
        dosage: '5.0 mL / L water',
      },
      application_schedule: 'Spray early morning (06:00 - 09:00 AM) or dusk. Repeat after 7-10 days.',
      safety_precautions: 'Wear mask and protective gloves. Keep livestock away for 24 hours. Pre-harvest interval (PHI): 7 days.',
    },
    nutrient_analysis: {
      ai_source: 'Kisan AI Agronomy Engine',
      nutrients_lacking: [
        {
          nutrient: 'Potassium (K)',
          role: 'Cell Wall Thickness & Pathogen Resistance',
          deficiency_cause: 'Alternaria rapidly colonizes potassium-deficient foliage.',
          symptoms: 'Marginal chlorosis with dark necrotic concentric rings.',
          supplement: 'Potassium Schoenite (13:0:45)',
          dosage: '4.0 - 5.0 g / L water',
        },
        {
          nutrient: 'Zinc (Zn)',
          role: 'Enzyme Activation & Protein Synthesis',
          deficiency_cause: 'Pathogen necrosis blocks micronutrient translocation.',
          symptoms: 'Interveinal chlorosis on young terminal leaflets.',
          supplement: 'Chelated Zinc (Zn-EDTA 12%)',
          dosage: '1.0 g / L water',
        },
      ],
      nutrient_recovery_plan: 'Foliar feed with high-potassium fertilizer combined with chelated zinc 48 hours after fungicide application.',
      soil_advice: 'Maintain soil pH 6.0 - 6.8. Enrich root zone with organic humic extract.',
    },
  },

  Potato: {
    crop: 'Potato',
    disease_name: 'Potato Early Blight (Alternaria solani)',
    cause: 'Alternaria solani (Fungal Pathogen) thriving in alternating wet and dry weather cycles with plant stress.',
    cure: 'Apply Mancozeb 75% WP (2.0-2.5 g/L) or Azoxystrobin 23% SC. Destroy infected haulms post-harvest.',
    confidence: 96.2,
    severity: 'High Severity',
    affectedArea: '28.5%',
    top_predictions: [
      { class_name: 'Potato Early Blight', confidence_pct: 96.2, is_primary: true },
      { class_name: 'Potato Late Blight', confidence_pct: 2.8, is_primary: false },
      { class_name: 'Potato Healthy', confidence_pct: 1.0, is_primary: false },
    ],
    pesticide_advisory: {
      should_spray: true,
      recommendation_title: 'Recommended Protective Foliar Spray',
      advice: 'Critical tuber yield risk. Apply protective foliar fungicide before morning dew evaporates.',
      recommended_spray: {
        name: 'Mancozeb 75% WP',
        dosage: '2.0 - 2.5 g / L water',
        brands: ['Dithane M-45', 'Indofil M-45', 'Tata Master'],
      },
      organic_alternative: {
        name: 'Copper Hydroxide 77% WP + Trichoderma viride',
        dosage: '2.5 g / L water',
      },
      application_schedule: 'Spray at first sign of target spots. Re-apply at 10-day intervals.',
      safety_precautions: 'Wear respirator mask and chemical boots. 14-day pre-harvest waiting interval.',
    },
    nutrient_analysis: {
      ai_source: 'Kisan AI Agronomy Engine',
      nutrients_lacking: [
        {
          nutrient: 'Potassium (K)',
          role: 'Tuber Bulking & Epidermal Strength',
          deficiency_cause: 'High potassium uptake during tuber enlargement leaves foliage susceptible.',
          symptoms: 'Bronzing of leaf margins and curling.',
          supplement: 'Sulphate of Potash (SOP 0:0:50)',
          dosage: '5.0 g / L water',
        },
        {
          nutrient: 'Magnesium (Mg)',
          role: 'Chlorophyll Core & Photosynthesis',
          deficiency_cause: 'Competitive uptake with calcium during rapid vegetative growth.',
          symptoms: 'Interveinal yellowing with green veins.',
          supplement: 'Magnesium Sulphate (Epsom Salt)',
          dosage: '4.0 g / L water',
        },
      ],
      nutrient_recovery_plan: 'Top-dress with SOP combined with foliar Epsom salt to restore photosynthetic capacity.',
      soil_advice: 'Soil pH 5.5 - 6.5. Avoid waterlogging around root mounds.',
    },
  },

  Corn: {
    crop: 'Corn',
    disease_name: 'Corn Common Rust (Puccinia sorghi)',
    cause: 'Puccinia sorghi fungal spores carried over long distances by wind; favored by cool temperatures (16-25°C) and high relative humidity.',
    cure: 'Apply Azoxystrobin + Difenoconazole (Amistar Top) or Propiconazole 25% EC (1 ml/L). Ensure adequate row spacing for ventilation.',
    confidence: 93.4,
    severity: 'Moderate Severity',
    affectedArea: '18.2%',
    top_predictions: [
      { class_name: 'Corn Common Rust', confidence_pct: 93.4, is_primary: true },
      { class_name: 'Corn Northern Leaf Blight', confidence_pct: 5.1, is_primary: false },
      { class_name: 'Corn Healthy', confidence_pct: 1.5, is_primary: false },
    ],
    pesticide_advisory: {
      should_spray: true,
      recommendation_title: 'Systemic Triazole / Strobilurin Spray',
      advice: 'Rust pustules actively rupturing leaf epidermis. Apply systemic fungicide before tassel emergence.',
      recommended_spray: {
        name: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
        dosage: '1.0 mL / L water',
        brands: ['Amistar Top', 'Custodia'],
      },
      organic_alternative: {
        name: 'Bacillus amyloliquefaciens + Potassium Silicate',
        dosage: '3.0 mL / L water',
      },
      application_schedule: 'Single application at V8-VT stage; repeat only if disease index exceeds 25%.',
      safety_precautions: 'Wear protective suit. Keep bees away during morning spraying.',
    },
    nutrient_analysis: {
      ai_source: 'Kisan AI Agronomy Engine',
      nutrients_lacking: [
        {
          nutrient: 'Nitrogen (N)',
          role: 'Vegetative Canopy & Leaf Area Index',
          deficiency_cause: 'Rust disrupts nitrogen transport from leaf to ear.',
          symptoms: 'V-shaped yellowing starting at leaf tips.',
          supplement: 'Urea foliar spray (1%) or Calcium Ammonium Nitrate',
          dosage: '10.0 g / L water',
        },
        {
          nutrient: 'Phosphorus (P)',
          role: 'Root Architecture & Stalk Strength',
          deficiency_cause: 'Fungal rust consumes plant energy phosphates.',
          symptoms: 'Purpling of lower leaf margins.',
          supplement: 'Mono-Ammonium Phosphate (12:61:0)',
          dosage: '5.0 g / L water',
        },
      ],
      nutrient_recovery_plan: 'Side-dress nitrogen-phosphorus booster to support grain filling despite pustule damage.',
      soil_advice: 'Maintain soil organic carbon > 0.6%. Aerate compacted wheel tracks.',
    },
  },

  Grape: {
    crop: 'Grape',
    disease_name: 'Grape Black Rot (Guignardia bidwellii)',
    cause: 'Guignardia bidwellii fungus overwintering on mummified berries and cane lesions, released during spring rainfall.',
    cure: 'Spray Myclobutanil 10% WP or Mancozeb before and after bloom. Remove all mummified berries from vines.',
    confidence: 95.1,
    severity: 'High Severity',
    affectedArea: '22.0%',
    top_predictions: [
      { class_name: 'Grape Black Rot', confidence_pct: 95.1, is_primary: true },
      { class_name: 'Grape Esca (Black Measles)', confidence_pct: 3.4, is_primary: false },
      { class_name: 'Grape Healthy', confidence_pct: 1.5, is_primary: false },
    ],
    pesticide_advisory: {
      should_spray: true,
      recommendation_title: 'Pre-Bloom Protective & Systemic Spray',
      advice: 'Critical protection window from budbreak to 4 weeks post-bloom. Apply preventive fungicide.',
      recommended_spray: {
        name: 'Myclobutanil 10% WP',
        dosage: '0.5 - 0.75 g / L water',
        brands: ['Rally 40WSP', 'Systhane', 'Score 250 EC'],
      },
      organic_alternative: {
        name: 'Bordeaux Mixture (1:1:100) or Lime Sulfur',
        dosage: '10.0 g / L water',
      },
      application_schedule: 'Apply at 10-14 day intervals from 10cm shoot growth until veraison.',
      safety_precautions: 'Do not apply in high heat (>32°C). 14-day pre-harvest interval.',
    },
    nutrient_analysis: {
      ai_source: 'Kisan AI Agronomy Engine',
      nutrients_lacking: [
        {
          nutrient: 'Magnesium (Mg)',
          role: 'Chlorophyll Formation & Berry Sugar Accumulation',
          deficiency_cause: 'Acidic soil and heavy crop loads deplete leaf magnesium reserves.',
          symptoms: "Interveinal chlorosis with green margin 'wedge' pattern.",
          supplement: 'Chelated Magnesium (Mg-EDTA)',
          dosage: '2.0 g / L water',
        },
        {
          nutrient: 'Boron (B)',
          role: 'Flower Pollination & Fruit Set',
          deficiency_cause: 'Dry topsoil during bloom periods restricts root boron uptake.',
          symptoms: "Poor fruit set, 'hen and chicken' uneven cluster berries.",
          supplement: 'Solubor (20% Boron)',
          dosage: '1.0 g / L water',
        },
      ],
      nutrient_recovery_plan: 'Foliar spray Boron + Magnesium post-shatter to preserve berry uniformity.',
      soil_advice: 'Maintain soil pH 6.5. Mulch vine rows with straw to prevent fungal splash.',
    },
  },

  Apple: {
    crop: 'Apple',
    disease_name: 'Apple Scab (Venturia inaequalis)',
    cause: 'Venturia inaequalis ascospores discharged during prolonged leaf wetness periods (>9 hours at 18-24°C).',
    cure: 'Apply Captan 50% WP or Difenoconazole 25% EC at pink bud and petal fall stages. Rake and destroy fallen leaves in autumn.',
    confidence: 94.2,
    severity: 'High Severity',
    affectedArea: '20.4%',
    top_predictions: [
      { class_name: 'Apple Scab', confidence_pct: 94.2, is_primary: true },
      { class_name: 'Apple Black Rot', confidence_pct: 4.1, is_primary: false },
      { class_name: 'Apple Healthy', confidence_pct: 1.7, is_primary: false },
    ],
    pesticide_advisory: {
      should_spray: true,
      recommendation_title: 'Curative & Protective Scab Spray',
      advice: 'Primary scab lesions detected on leaf surface. Spray within 72 hours of rain event to eradicate infection.',
      recommended_spray: {
        name: 'Difenoconazole 25% EC',
        dosage: '0.5 mL / L water',
        brands: ['Score 250 EC', 'Captaf 50 WP', 'Indofil M-45'],
      },
      organic_alternative: {
        name: 'Potassium Bicarbonate + Wettable Sulfur',
        dosage: '4.0 g / L water',
      },
      application_schedule: 'Apply immediately post-infection period; repeat after 7 days if wet weather continues.',
      safety_precautions: 'Wear full protective PPE. Avoid spraying during bee foraging hours.',
    },
    nutrient_analysis: {
      ai_source: 'Kisan AI Agronomy Engine',
      nutrients_lacking: [
        {
          nutrient: 'Calcium (Ca)',
          role: 'Cell Membrane Stability & Bitter Pit Prevention',
          deficiency_cause: 'Poor xylem transport to rapidly growing fruitlets.',
          symptoms: 'Leaf margin necrosis and small corky fruit spots.',
          supplement: 'Calcium Nitrate foliar spray',
          dosage: '5.0 g / L water',
        },
        {
          nutrient: 'Boron (B)',
          role: 'Pollen Tube Growth & Fruit Cell Division',
          deficiency_cause: 'Sandy or alkaline soils reduce available boron.',
          symptoms: 'Internal corking and chlorotic rosette leaves.',
          supplement: 'Boric Acid / Solubor',
          dosage: '1.0 g / L water',
        },
      ],
      nutrient_recovery_plan: 'Apply multiple light sprays of Calcium Nitrate alternating with Difenoconazole.',
      soil_advice: 'Maintain balanced soil calcium:magnesium ratio. Avoid excessive early-season nitrogen.',
    },
  },
};

export function getAgronomyDiagnosis(rawCropString) {
  const cropKey = (rawCropString || 'Tomato').split(' ')[0].replace(/[^a-zA-Z]/g, '');
  const found = AGRONOMY_DIAGNOSES[cropKey] || AGRONOMY_DIAGNOSES.Tomato;
  return JSON.parse(JSON.stringify(found));
}
