// ============================================================
//  AI_RECOMMENDATIONS — per-module structured suggestions
//  Each entry: problem, ai_action[], products[], cost estimate
// ============================================================

export const AI_RECOMMENDATIONS = {
  disease: {
    module: 'Disease Management',
    problem: 'Cotton Leaf Curl Virus (CLCuD) — Moderate Severity',
    severity: 'critical',
    aiSummary:
      'CLCuD is an irreversible, vector-transmitted viral disease. Priority is immediate vector (whitefly) control and roguing of heavily infected plants. No curative treatment exists — management is entirely prophylactic and vector-suppressive.',
    actions: [
      {
        step: 1,
        action: 'Rogue infected plants',
        detail: 'Remove and destroy all plants showing severe leaf curling + enations. Reduces inoculum source.',
        timing: 'Immediately',
        priority: 'critical',
      },
      {
        step: 2,
        action: 'Insecticide spray for whitefly vector',
        detail: 'Apply Imidacloprid 17.8 SL @ 0.3 ml/L or Thiamethoxam 25 WG @ 0.3 g/L to suppress Bemisia tabaci.',
        timing: 'Within 24–48 hours (avoid rainy days)',
        priority: 'critical',
      },
      {
        step: 3,
        action: 'Yellow sticky traps',
        detail: 'Deploy yellow sticky traps at 10/acre height of 30 cm above crop canopy for monitoring and mass trapping.',
        timing: 'This week',
        priority: 'warning',
      },
      {
        step: 4,
        action: 'Neem-based repellent spray',
        detail: 'Spray NSKE (Neem Seed Kernel Extract) 5% or Azadirachtin 0.03% EC @ 5 ml/L as an eco-friendly supplement.',
        timing: 'Alternate week with chemical spray',
        priority: 'info',
      },
      {
        step: 5,
        action: 'Field scouting every 7 days',
        detail: 'Re-assess disease spread. If >30% canopy affected, escalate to plant pathologist and consider replanting decision.',
        timing: '7 days post-spray',
        priority: 'warning',
      },
    ],
    products: [
      { name: 'Imidacloprid 17.8 SL', brand: 'Confidor (Bayer)', dose: '0.3 ml/L water', costPer: '₹320–380/100 ml', usagePerAcre: '200 ml in 200 L water' },
      { name: 'Thiamethoxam 25 WG', brand: 'Actara (Syngenta)', dose: '0.3 g/L water', costPer: '₹280–340/100 g', usagePerAcre: '60 g in 200 L water' },
      { name: 'Azadirachtin 0.03% EC', brand: 'Neemazal (ICAR)', dose: '5 ml/L water', costPer: '₹80–100/500 ml', usagePerAcre: '500 ml in 100 L water' },
      { name: 'Yellow Sticky Traps', brand: 'Any reputable brand', dose: '10 traps/acre', costPer: '₹8–12/trap', usagePerAcre: '10 traps' },
    ],
    costEstimate: {
      oneTime: 1400,
      monthly: 900,
      perAcre: 1400,
      breakdown: [
        { item: 'Imidacloprid 17.8 SL (1 spray)', cost: 380 },
        { item: 'Thiamethoxam 25 WG (1 spray)', cost: 340 },
        { item: 'Yellow Sticky Traps (10 nos)', cost: 100 },
        { item: 'Neem spray (1 application)', cost: 100 },
        { item: 'Labour (spraying, 4.2 acres)', cost: 480 },
      ],
    },
  },

  pest: {
    module: 'Pest Management',
    problem: 'Whitefly (Bemisia tabaci) — High Severity',
    severity: 'critical',
    aiSummary:
      'Bemisia tabaci at high infestation levels requires immediate chemical intervention combined with cultural and biological controls. Resistance management is critical — rotate between IRAC insecticide groups. Target spray on leaf undersides where nymphs and adults congregate.',
    actions: [
      {
        step: 1,
        action: 'Emergency insecticide spray',
        detail: 'Apply Spiromesifen 22.9 SC @ 0.9 ml/L (IRAC Group 23) as contact and translaminar ovicide/larvicide targeting all life stages.',
        timing: 'Immediately (dry day, early morning)',
        priority: 'critical',
      },
      {
        step: 2,
        action: 'Follow-up spray with alternate group',
        detail: 'After 10 days, rotate to Pyriproxyfen 10% EC @ 1 ml/L (IRAC Group 7C) to prevent resistance development.',
        timing: '10 days after first spray',
        priority: 'critical',
      },
      {
        step: 3,
        action: 'Spray adjuvant / spreader sticker',
        detail: 'Add Silwet L-77 or Sandovit at 0.5 ml/L to improve coverage on waxy leaf undersides.',
        timing: 'Mix with each spray',
        priority: 'warning',
      },
      {
        step: 4,
        action: 'Reflective mulching',
        detail: 'Lay silver/aluminum reflective mulch around plant base. Reflects UV light, disorienting and repelling adult whiteflies.',
        timing: 'This week',
        priority: 'info',
      },
      {
        step: 5,
        action: 'Conserve natural enemies',
        detail: 'Avoid broad-spectrum insecticides (pyrethroids). Parasitic wasp Encarsia formosa naturally regulates whitefly populations.',
        timing: 'Ongoing',
        priority: 'info',
      },
    ],
    products: [
      { name: 'Spiromesifen 22.9 SC', brand: 'Oberon (Bayer)', dose: '0.9 ml/L water', costPer: '₹1,100–1,300/100 ml', usagePerAcre: '180 ml in 200 L water' },
      { name: 'Pyriproxyfen 10% EC', brand: 'Juvinal (Sumitomo)', dose: '1 ml/L water', costPer: '₹420–520/100 ml', usagePerAcre: '200 ml in 200 L water' },
      { name: 'Flonicamid 50% WG', brand: 'Ulala (ISK Biosciences)', dose: '0.3 g/L water', costPer: '₹1,200/100 g', usagePerAcre: '60 g in 200 L water' },
      { name: 'Spreader Sticker (Silwet)', brand: 'Helena Chemical', dose: '0.5 ml/L', costPer: '₹150/100 ml', usagePerAcre: '100 ml' },
    ],
    costEstimate: {
      oneTime: 2600,
      monthly: 1800,
      perAcre: 2600,
      breakdown: [
        { item: 'Spiromesifen 22.9 SC (1 spray)', cost: 1200 },
        { item: 'Pyriproxyfen 10% EC (follow-up)', cost: 520 },
        { item: 'Spreader sticker', cost: 150 },
        { item: 'Yellow sticky traps', cost: 120 },
        { item: 'Labour & spraying equipment', cost: 610 },
      ],
    },
  },

  nutrient: {
    module: 'Nutrient Management',
    problem: 'Nitrogen Deficiency (Moderate) + Marginal P & Zn',
    severity: 'warning',
    aiSummary:
      'Nitrogen is the primary limiting nutrient at boll development stage. Moderate N deficiency reduces boll fill and lint yield significantly. Phosphorus marginality can be corrected via foliar spray. Zinc micronutrient correction is low-cost and high-impact for cotton.',
    actions: [
      {
        step: 1,
        action: 'Top-dress Urea for Nitrogen correction',
        detail: 'Apply Urea (46% N) @ 65 kg/acre as soil top-dressing. Irrigate immediately after application to prevent volatilization losses.',
        timing: 'Within 3 days',
        priority: 'critical',
      },
      {
        step: 2,
        action: 'Foliar DAP spray for Phosphorus',
        detail: 'Dissolve DAP (Di-ammonium phosphate) @ 20 g/L and spray uniformly. Provides both N and P in quick-absorb form.',
        timing: 'Within 5 days (early morning)',
        priority: 'warning',
      },
      {
        step: 3,
        action: 'Zinc Sulphate soil/foliar application',
        detail: 'Apply ZnSO₄ (21% Zn) @ 25 kg/acre as basal or spray 0.5% ZnSO₄ solution (5 g/L) foliarly.',
        timing: 'Combine with DAP spray day',
        priority: 'warning',
      },
      {
        step: 4,
        action: 'Humic acid soil conditioner',
        detail: 'Apply humic acid granules @ 5 kg/acre to improve N uptake efficiency and CEC of soil.',
        timing: 'During irrigation',
        priority: 'info',
      },
      {
        step: 5,
        action: 'Tissue sample re-test after 10 days',
        detail: 'Send leaf tissue samples to NABL-accredited lab to verify nutrient uptake post-application.',
        timing: '10 days after treatment',
        priority: 'info',
      },
    ],
    products: [
      { name: 'Urea (46% N)', brand: 'IFFCO / KRIBHCO', dose: '65 kg/acre top-dress', costPer: '₹270/50 kg bag', usagePerAcre: '65 kg' },
      { name: 'DAP (18:46:0)', brand: 'IFFCO', dose: '20 g/L foliar spray', costPer: '₹1,350/50 kg bag', usagePerAcre: '4 kg (foliar)' },
      { name: 'Zinc Sulphate 21%', brand: 'Tata Chemicals / Coromandel', dose: '5 g/L foliar or 25 kg/acre soil', costPer: '₹55/kg', usagePerAcre: '25 kg (soil)' },
      { name: 'Humic Acid Granules', brand: 'Fulvex / Humizone', dose: '5 kg/acre soil', costPer: '₹120/kg', usagePerAcre: '5 kg' },
    ],
    costEstimate: {
      oneTime: 1950,
      monthly: 700,
      perAcre: 1950,
      breakdown: [
        { item: 'Urea (65 kg/acre)', cost: 351 },
        { item: 'DAP foliar (4 kg)', cost: 108 },
        { item: 'Zinc Sulphate (25 kg)', cost: 1375 },
        { item: 'Humic Acid (5 kg)', cost: 600 },
        { item: 'Labour (application)', cost: 320 },
      ],
    },
  },

  irrigation: {
    module: 'Irrigation Management',
    problem: 'Soil Moisture Below Optimal — Irrigate Within 24 Hours',
    severity: 'warning',
    aiSummary:
      'Current soil moisture at 38.4% is approaching the lower optimal threshold. At boll development stage, even mild water stress causes premature boll drop and reduces lint quality. Drip irrigation is recommended for maximum efficiency and uniform delivery.',
    actions: [
      {
        step: 1,
        action: 'Drip irrigate this evening',
        detail: 'Apply 42 mm water equivalent via drip system. Run drip for 3.5 hours at 4 L/hr/emitter. Evening irrigation reduces evaporation by 30–40%.',
        timing: 'Today evening 5–8 PM',
        priority: 'critical',
      },
      {
        step: 2,
        action: 'Monitor soil moisture daily',
        detail: 'Check tensiometer/moisture sensor readings daily at 15 cm and 30 cm depth. Irrigate when readings drop below 35%.',
        timing: 'Daily monitoring',
        priority: 'warning',
      },
      {
        step: 3,
        action: 'Skip Saturday irrigation',
        detail: '70% probability of 18–25 mm rainfall forecast Saturday. Skip scheduled irrigation if >15 mm rain occurs.',
        timing: 'Saturday',
        priority: 'info',
      },
      {
        step: 4,
        action: 'Mulching to conserve moisture',
        detail: 'Apply dry straw mulch @ 5 cm layer around plant base. Reduces evapotranspiration losses by 25–40% in hot weather.',
        timing: 'This week',
        priority: 'info',
      },
    ],
    products: [
      { name: 'Drip Emitters (4 LPH)', brand: 'Netafim / Jain Irrigation', dose: '1 emitter/plant', costPer: '₹12–18/emitter', usagePerAcre: '~3,500 emitters' },
      { name: 'Soil Moisture Sensor', brand: 'Decagon 5TM / WaterMark', dose: '2 sensors/acre', costPer: '₹1,800–2,500/sensor', usagePerAcre: '2 sensors' },
      { name: 'Tensiometer', brand: 'Irrometer', dose: '2/acre at 15 & 30 cm depth', costPer: '₹800–1,200/unit', usagePerAcre: '2 units' },
      { name: 'Paddy Straw Mulch', brand: 'Local / agricultural waste', dose: '5 cm layer', costPer: '₹800–1,000/ton', usagePerAcre: '2 tons' },
    ],
    costEstimate: {
      oneTime: 580,
      monthly: 200,
      perAcre: 580,
      breakdown: [
        { item: 'Water cost (42 mm irrigation)', cost: 180 },
        { item: 'Electricity for drip pump', cost: 120 },
        { item: 'Straw mulch (2 tons)', cost: 1800 },
        { item: 'Labour (mulch application)', cost: 480 },
      ],
    },
  },

  weather: {
    module: 'Weather Risk Management',
    problem: 'Moderate Risk: Rain Saturday, Heat Stress Risk, Pest-Favoring Humidity',
    severity: 'info',
    aiSummary:
      'Current weather is within safe range for Bt cotton. Key risks: (1) Rain Saturday may delay pesticide efficacy — schedule sprays before Friday or after Sunday. (2) Humidity at 68% and leaf wetness at 2.1h slightly elevates secondary fungal risk. UV Index 7 — field workers need protective gear.',
    actions: [
      {
        step: 1,
        action: 'Complete all pesticide sprays by Friday',
        detail: 'Rain Saturday (70% probability) will wash off freshly applied pesticides. Ensure disease/pest sprays are completed by Friday 2 PM minimum.',
        timing: 'Before Friday 2 PM',
        priority: 'warning',
      },
      {
        step: 2,
        action: 'Monitor for fungal disease post-rain',
        detail: 'After Saturday rain, scout field for secondary fungal infections (Alternaria, Fusarium) encouraged by wet conditions + warm temps.',
        timing: 'Sunday–Monday post-rain',
        priority: 'warning',
      },
      {
        step: 3,
        action: 'Preventive copper fungicide (optional)',
        detail: 'Apply Copper Oxychloride 50% WP @ 3 g/L before rain as a protective measure against fungal secondary infections.',
        timing: 'Thursday–Friday',
        priority: 'info',
      },
      {
        step: 4,
        action: 'Optimal spray window: Tuesday–Wednesday',
        detail: 'Clear skies, low humidity (<60%), wind <10 km/h forecast Tue–Wed. Ideal for pesticide and foliar fertilizer application.',
        timing: 'Tuesday–Wednesday next week',
        priority: 'info',
      },
    ],
    products: [
      { name: 'Copper Oxychloride 50% WP', brand: 'Blitox (TATA) / Kocide', dose: '3 g/L water', costPer: '₹180/kg', usagePerAcre: '500 g in 200 L water' },
      { name: 'Mancozeb 75% WP', brand: 'Dithane M-45 (Dow)', dose: '2.5 g/L water', costPer: '₹220/kg', usagePerAcre: '500 g in 200 L water' },
      { name: 'Rain gauge / Weather station', brand: 'Davis Instruments / AcuRite', dose: '1 unit/farm', costPer: '₹2,500–4,500', usagePerAcre: 'Shared across farm' },
    ],
    costEstimate: {
      oneTime: 320,
      monthly: 200,
      perAcre: 320,
      breakdown: [
        { item: 'Copper Oxychloride spray', cost: 200 },
        { item: 'Labour (protective spray)', cost: 240 },
      ],
    },
  },
};

export const FARM_HEALTH_SCORE = {
  overall: 42,
  label: 'Critical — Immediate Action Required',
  modules: [
    { name: 'Crop Disease', score: 28, status: 'critical', weight: 30 },
    { name: 'Pest Pressure', score: 20, status: 'critical', weight: 25 },
    { name: 'Nutrient Status', score: 55, status: 'warning', weight: 20 },
    { name: 'Irrigation', score: 65, status: 'warning', weight: 15 },
    { name: 'Weather Risk', score: 72, status: 'info', weight: 10 },
  ],
  drawbacks: [
    {
      severity: 'critical',
      title: 'Active Viral Disease (CLCuD)',
      impact: 'Potential yield loss of 40–70% if unmanaged. Disease is currently spreading via whitefly vector.',
      action: 'Immediate vector control + plant roguing required',
    },
    {
      severity: 'critical',
      title: 'High Whitefly Infestation',
      impact: 'Pest population at economically damaging levels. Amplifies disease spread exponentially.',
      action: 'Emergency IPM spray within 24 hours',
    },
    {
      severity: 'warning',
      title: 'Nitrogen Deficiency at Critical Stage',
      impact: 'Boll development stage has highest N demand. Deficiency reduces boll weight and lint quality.',
      action: 'Urea top-dress within 3 days',
    },
    {
      severity: 'warning',
      title: 'Irrigation Required Soon',
      impact: 'Soil moisture trending toward stress threshold. Delay risks boll drop and reduced lint yield.',
      action: 'Irrigate before Thursday evening',
    },
    {
      severity: 'warning',
      title: 'Zinc & Phosphorus Marginal',
      impact: 'Marginal micronutrient levels impair boll development and root function.',
      action: 'Foliar spray correction this week',
    },
    {
      severity: 'info',
      title: 'Rain-Window Pesticide Timing Risk',
      impact: 'Saturday rainfall may reduce efficacy of any newly applied pesticides.',
      action: 'Complete all sprays before Friday afternoon',
    },
  ],
  totalEstimatedCost: 6870,
  costBreakdown: {
    disease: 1400,
    pest: 2600,
    nutrient: 1950,
    irrigation: 580,
    weather: 320,
  },
};
