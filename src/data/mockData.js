/**
 * Smart Farming Assistant — Mock Data
 * Representative agronomic data for demo mode.
 * All values are scientifically plausible for a Kharif wheat + cotton farm.
 */

const today = new Date();
const sowingDate = new Date(today);
sowingDate.setDate(today.getDate() - 103);
const options = { day: 'numeric', month: 'short', year: 'numeric' };

export const FARM_INFO = {
  name: 'Anand Agrofields — Plot B7',
  location: 'Nashik, Maharashtra',
  area: '4.2 acres',
  crop: 'Cotton (Gossypium hirsutum)',
  cropShort: 'Bt Cotton',
  season: 'Kharif 2024–25',
  sowingDate: sowingDate.toLocaleDateString('en-IN', options),
  daysAfterSowing: 103,
  growthStage: 'Boll Development',
  lastUpdated: new Date().toISOString(),
};

export const SENSOR_READINGS = {
  soilMoisture: 38.4,      // %
  soilMoistureUnit: '%',
  soilTemperature: 26.1,   // °C
  soilPH: 7.2,
  soilEC: 0.82,            // dS/m
  airTemp: 29.4,           // °C
  airHumidity: 68,         // %
  rainfall7d: 12.4,        // mm
  windSpeed: 8.2,          // km/h
  solarRadiation: 18.6,    // MJ/m²/day
  leafWetness: 2.1,        // hours
  nitrogenIndex: 62,       // 0-100
};

export const DISEASE_DETECTION = {
  status: 'detected',       // 'healthy' | 'detected' | 'pending' | 'unknown'
  disease: 'Cotton Leaf Curl Virus (CLCuD)',
  scientificName: 'Cotton leaf curl Multan virus',
  confidence: 87,
  affectedArea: '~15% canopy',
  severity: 'Moderate',
  detectedAt: '2024-10-18T09:42:00Z',
  crop: 'Bt Cotton',
  topPredictions: [
    { name: 'Cotton Leaf Curl Virus', confidence: 87 },
    { name: 'Alternaria Leaf Spot', confidence: 8 },
    { name: 'Healthy', confidence: 5 },
  ],
  management: [
    'Remove and destroy infected plants showing severe symptoms immediately',
    'Apply Imidacloprid 17.8 SL @ 0.3 ml/L to control whitefly vector (Bemisia tabaci)',
    'Avoid water stress — maintain uniform soil moisture to reduce vector activity',
    'Deploy yellow sticky traps at 5/acre for whitefly monitoring',
    'Re-scout field in 7 days. Escalate to plant pathologist if spread exceeds 25% canopy',
  ],
  modelId: 'DiseaseNet-v2.1',
};

export const PEST_DETECTION = {
  status: 'detected',       // 'healthy' | 'detected' | 'pending'
  pest: 'Whitefly (Bemisia tabaci)',
  scientificName: 'Bemisia tabaci',
  confidence: 91,
  severity: 'High',
  detectedAt: '2024-10-18T09:43:00Z',
  crop: 'Bt Cotton',
  topPredictions: [
    { name: 'Whitefly (Bemisia tabaci)', confidence: 91 },
    { name: 'Thrips (Thrips tabaci)', confidence: 6 },
    { name: 'Healthy', confidence: 3 },
  ],
  management: [
    'Apply Spiromesifen 22.9 SC @ 0.9 ml/L or Pyriproxyfen 10% EC @ 1 ml/L',
    'Alternate insecticide groups to delay resistance (IRAC group rotation)',
    'Deploy reflective mulches to deter adult whiteflies',
    'Scout for sooty mold — a secondary indicator of heavy infestation',
    'Avoid broad-spectrum insecticides that kill natural enemies (Encarsia spp.)',
  ],
  modelId: 'PestScope-v1.8',
};

export const NUTRIENT_ANALYSIS = {
  status: 'deficient',     // 'optimal' | 'deficient' | 'excess' | 'pending'
  primaryDeficiency: 'Nitrogen (N)',
  confidence: 78,
  detectedAt: '2024-10-17T14:30:00Z',
  crop: 'Bt Cotton',
  nutrients: [
    { name: 'Nitrogen (N)', symbol: 'N', status: 'deficient', index: 38, unit: 'kg/ha available', severity: 'moderate' },
    { name: 'Phosphorus (P)', symbol: 'P', status: 'marginal', index: 51, unit: 'kg/ha available', severity: 'mild' },
    { name: 'Potassium (K)', symbol: 'K', status: 'optimal', index: 74, unit: 'kg/ha available', severity: null },
    { name: 'Sulphur (S)', symbol: 'S', status: 'optimal', index: 68, unit: 'ppm', severity: null },
    { name: 'Zinc (Zn)', symbol: 'Zn', status: 'marginal', index: 46, unit: 'ppm', severity: 'mild' },
    { name: 'Boron (B)', symbol: 'B', status: 'optimal', index: 62, unit: 'ppm', severity: null },
  ],
  management: [
    'Apply 30 kg N/ha as Urea (top-dress) at current boll development stage',
    'Foliar spray: 2% DAP solution (diammonium phosphate) to address marginal P',
    'Zinc sulphate soil application @ 25 kg/ha or 0.5% foliar spray',
    'Avoid excess N — it promotes vegetative growth and delays boll maturity',
    'Retest leaf tissue sample in 10 days post-application to verify uptake',
  ],
  modelId: 'NutriScan-v1.4',
};

export const IRRIGATION_STATUS = {
  recommendation: 'irrigate',  // 'irrigate' | 'hold' | 'optimal'
  urgency: 'within 24h',
  soilMoisture: 38.4,
  fieldCapacity: 45,
  wiltingPoint: 22,
  optimalRange: [35, 50],
  estimatedDeficit: 42,        // mm
  cropWaterRequirement: 5.8,   // mm/day ETc
  nextIrrigationDate: '2024-10-19',
  irrigationDuration: '3.5 hrs',
  methodNote: 'Drip irrigation recommended at 4 L/hr/emitter',
  reasoning: [
    'Soil moisture (38.4%) is approaching lower optimal threshold (35%)',
    'Crop ETc at boll development stage is 5.8 mm/day',
    'No significant rainfall forecast in next 5 days',
    'Leaf water potential indicates mild stress (-1.1 MPa)',
  ],
};

export const WEATHER_CURRENT = {
  temp: 29.4,
  feelsLike: 32.1,
  humidity: 68,
  windSpeed: 8.2,
  windDir: 'SW',
  description: 'Partly Cloudy',
  icon: '⛅',
  uvIndex: 7,
  visibility: 9.4,
  dewPoint: 22.6,
  rainfall24h: 0,
};

const getDayName = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('en-IN', { weekday: 'short' });
};

export const WEATHER_FORECAST = [
  { day: getDayName(0), icon: '⛅', high: 30, low: 22, rain: '10%', condition: 'Partly Cloudy' },
  { day: getDayName(1), icon: '🌧', high: 26, low: 20, rain: '70%', condition: 'Rain' },
  { day: getDayName(2), icon: '🌦', high: 25, low: 19, rain: '55%', condition: 'Showers' },
  { day: getDayName(3), icon: '🌤', high: 28, low: 21, rain: '15%', condition: 'Mostly Sunny' },
  { day: getDayName(4), icon: '☀️', high: 31, low: 23, rain: '5%', condition: 'Sunny' },
];

export const ALERTS = [
  {
    id: 1,
    type: 'critical',
    title: 'Disease Alert: Cotton Leaf Curl Virus Detected',
    desc: '87% confidence detection on field Plot B7. Immediate management action required. Whitefly population driving spread.',
    time: '2h ago',
    module: 'Disease Detection',
  },
  {
    id: 2,
    type: 'critical',
    title: 'High Pest Pressure: Whitefly (Bemisia tabaci)',
    desc: '91% confidence. High severity. Risk of CLCuD amplification. Vector control urgent.',
    time: '2h ago',
    module: 'Pest Detection',
  },
  {
    id: 3,
    type: 'warning',
    title: 'Irrigation Required Within 24 Hours',
    desc: 'Soil moisture trending toward lower threshold. ETc demand 5.8 mm/day exceeds current available water.',
    time: '4h ago',
    module: 'Irrigation',
  },
  {
    id: 4,
    type: 'warning',
    title: 'Nitrogen Deficiency — Moderate Severity',
    desc: 'N index at 38/100. Boll development stage is critical for N demand. Top-dress recommended.',
    time: '1d ago',
    module: 'Nutrient Analysis',
  },
  {
    id: 5,
    type: 'info',
    title: 'Rainfall Expected Saturday',
    desc: '70% probability of 18–25 mm rainfall. Delay pesticide application until Sunday to ensure efficacy.',
    time: '3h ago',
    module: 'Weather',
  },
];

const getOffsetDateString = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

export const DETECTION_HISTORY = [
  {
    id: 'DH001',
    date: getOffsetDateString(0),
    module: 'Disease',
    result: 'Cotton Leaf Curl Virus',
    confidence: 87,
    severity: 'Moderate',
    status: 'Action Required',
  },
  {
    id: 'DH002',
    date: getOffsetDateString(0),
    module: 'Pest',
    result: 'Whitefly (Bemisia tabaci)',
    confidence: 91,
    severity: 'High',
    status: 'Action Required',
  },
  {
    id: 'DH003',
    date: getOffsetDateString(-1),
    module: 'Nutrient',
    result: 'Nitrogen Deficiency',
    confidence: 78,
    severity: 'Moderate',
    status: 'In Progress',
  },
  {
    id: 'DH004',
    date: getOffsetDateString(-8),
    module: 'Disease',
    result: 'Healthy Foliage',
    confidence: 94,
    severity: null,
    status: 'Resolved',
  },
  {
    id: 'DH005',
    date: getOffsetDateString(-13),
    module: 'Pest',
    result: 'Healthy (No Pest)',
    confidence: 89,
    severity: null,
    status: 'Resolved',
  },
  {
    id: 'DH006',
    date: getOffsetDateString(-20),
    module: 'Nutrient',
    result: 'Potassium Optimal',
    confidence: 82,
    severity: null,
    status: 'Resolved',
  },
];
