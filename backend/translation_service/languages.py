"""
IndicTrans2 Language Mapping Specification
AI4Bharat IndicTrans2 supports all 22 scheduled Indian languages.
This module maps standard ISO 639-1 / BCP-47 codes to IndicTrans2 language identifiers.
"""

LANGUAGES = {
    "en": "eng_Latn",
    "hi": "hin_Deva",
    "mr": "mar_Deva",
    "gu": "guj_Gujr",
    "bn": "ben_Beng",
    "ta": "tam_Taml",
    "te": "tel_Telu",
    "kn": "kan_Knda",
    "ml": "mal_Mlym",
    "pa": "pan_Guru",
    "or": "ory_Orya",
    "as": "asm_Beng",
    "ne": "npi_Deva",
    "ur": "urd_Arab",
    "sa": "san_Deva",
    "mai": "mai_Deva",
    "gom": "gom_Deva",
    "sd": "snd_Arab",
    "ks": "kas_Arab",
    "sat": "sat_Olck",
    "mni": "mni_Beng",
    "brx": "brx_Deva",
    "doi": "doi_Deva"
}

LANGUAGE_METADATA = {
    "en": {"code": "en", "name": "English", "native": "English", "indic_code": "eng_Latn", "flag": "🌐"},
    "hi": {"code": "hi", "name": "Hindi", "native": "हिन्दी", "indic_code": "hin_Deva", "flag": "🇮🇳"},
    "mr": {"code": "mr", "name": "Marathi", "native": "मराठी", "indic_code": "mar_Deva", "flag": "🌾"},
    "gu": {"code": "gu", "name": "Gujarati", "native": "ગુજરાતી", "indic_code": "guj_Gujr", "flag": "🌱"},
    "te": {"code": "te", "name": "Telugu", "native": "తెలుగు", "indic_code": "tel_Telu", "flag": "🌿"},
    "ta": {"code": "ta", "name": "Tamil", "native": "தமிழ்", "indic_code": "tam_Taml", "flag": "🍃"},
    "kn": {"code": "kn", "name": "Kannada", "native": "ಕನ್ನಡ", "indic_code": "kan_Knda", "flag": "🎋"},
    "pa": {"code": "pa", "name": "Punjabi", "native": "ਪੰਜਾਬੀ", "indic_code": "pan_Guru", "flag": "🚜"},
    "bn": {"code": "bn", "name": "Bengali", "native": "বাংলা", "indic_code": "ben_Beng", "flag": "🌾"},
    "ml": {"code": "ml", "name": "Malayalam", "native": "മലയാളം", "indic_code": "mal_Mlym", "flag": "🌴"}
}
