/**
 * Supported Languages Specification for Kisan AI (IndicTrans2 Bridge)
 * Focuses on key Indian agricultural regional languages.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', indicCode: 'eng_Latn', flag: '🌐', region: 'Pan-India' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', indicCode: 'hin_Deva', flag: '🇮🇳', region: 'North / Central India' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', indicCode: 'mar_Deva', flag: '🌾', region: 'Maharashtra' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', indicCode: 'guj_Gujr', flag: '🌱', region: 'Gujarat' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', indicCode: 'tel_Telu', flag: '🌿', region: 'Andhra Pradesh / Telangana' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', indicCode: 'tam_Taml', flag: '🍃', region: 'Tamil Nadu' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', indicCode: 'kan_Knda', flag: '🎋', region: 'Karnataka' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', indicCode: 'pan_Guru', flag: '🚜', region: 'Punjab / Haryana' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', indicCode: 'ben_Beng', flag: '🌾', region: 'West Bengal' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', indicCode: 'mal_Mlym', flag: '🌴', region: 'Kerala' },
];

export const DEFAULT_LANGUAGE = 'en';
