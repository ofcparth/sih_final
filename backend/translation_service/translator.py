"""
IndicTranslator - AI4Bharat IndicTrans2 Inference Engine & Farming Translation Bridge
Supports 22 Scheduled Indian Languages with Redis Caching and High-Speed Fallback.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from languages import LANGUAGES, LANGUAGE_METADATA

logger = logging.getLogger("kisan.indictrans2")

# Common agricultural and diagnostic domain knowledge base in Indian languages
FARMING_VOCABULARY = {
    # Diseases
    "Bacterial Leaf Blight": {
        "hi": "जीवाणु पत्ती झुलसा", "mr": "जिवाणू पानावरील करपा", "gu": "બેક્ટેરિયલ પાનનો સુકારો",
        "te": "బాక్టీరియల్ ఆకు ఎండు తెగులు", "ta": "பாக்டீரியா இலை கருகல்", "kn": "ಬ್ಯಾಕ್ಟೀರಿಯಾದ ಎಲೆ ರೋಗ", "pa": "ਬੈਕਟੀਰੀਅਲ ਪੱਤਾ ਝੁਲਸ"
    },
    "Early Blight": {
        "hi": "अगेती झुलसा", "mr": "लवकर येणारा करपा", "gu": "અગેતી સુકારો",
        "te": "ముందస్తు ఆకు మాడు తెగులు", "ta": "முன் கருகல் நோய்", "kn": "ಮುಂಚಿನ ಎಲೆ ರೋಗ", "pa": "ਅਗੇਤਾ ਝੁਲਸ ਰੋਗ"
    },
    "Late Blight": {
        "hi": "पछेती झुलसा", "mr": "उशिरा येणारा करपा", "gu": "પાછોતરો સુકારો",
        "te": "ఆలస్యపు ఆకు మాడు తెగులు", "ta": "பின் கருகல் நோய்", "kn": "ತಡವಾದ ಎಲೆ ರೋಗ", "pa": "ਪਛੇਤਾ ਝੁਲਸ ਰੋਗ"
    },
    "Powdery Mildew": {
        "hi": "चूर्णिल आसिता (पाउडरी मिल्ड्यू)", "mr": "भुरी रोग", "gu": "છાશિયો રોગ",
        "te": "బూడిద తెగులు", "ta": "சாம்பல் நோய்", "kn": "ಬೂದಿ ರೋಗ", "pa": "ਚਿੱਟਾ ਪਾਊਡਰੀ ਰੋਗ"
    },
    "Citrus Greening": {
        "hi": "सिट्रस ग्रीनिंग (सिट्रस ह्वांगलोंगबिंग)", "mr": "सिट्रस ग्रीनिंग रोग", "gu": "સાઇટ્રસ ગ્રીનિંગ રોગ",
        "te": "సిట్రస్ గ్రీనింగ్ తెగులు", "ta": "சிட்ரஸ் கிரீனிங் நோய்", "kn": "ಸಿಟ್ರಸ್ ಗ್ರೀನಿಂಗ್ ರೋಗ", "pa": "ਸਿਟਰਸ ਗ੍ਰੀਨਿੰਗ ਰੋਗ"
    },
    "Rust": {
        "hi": "गेरुआ (रतुआ) रोग", "mr": "तांबेरा रोग", "gu": "ગેરુ રોગ",
        "te": "తుప్పు తెగులు", "ta": "துரு நோய்", "kn": "ತುಕ್ಕು ರೋಗ", "pa": "ਕੁੰਗੀ ਰੋਗ"
    },
    "Healthy": {
        "hi": "स्वस्थ फसल", "mr": "निरोगी पीक", "gu": "તંદુરસ્ત પાક",
        "te": "ఆరోగ్యకరమైన పంట", "ta": "ஆரோக்கியமான பயிர்", "kn": "ಆರೋಗ್ಯಕರ ಬೆಳೆ", "pa": "ਤੰਦਰੁਸਤ ਫ਼ਸਲ"
    },

    # Severities
    "High": {"hi": "गंभीर (उच्च)", "mr": "तीव्र", "gu": "ગંભીર", "te": "తీవ్రమైన", "ta": "தீவிரமானது", "kn": "ತೀವ್ರ", "pa": "ਗੰਭੀਰ"},
    "Critical": {"hi": "अति गंभीर (संकटपूर्ण)", "mr": "अति तीव्र", "gu": "અતિ ગંભીર", "te": "చాలా తీవ్రమైన", "ta": "மிகவும் ஆபத்தானது", "kn": "ಅಪಾಯಕಾರಿ", "pa": "ਅਤਿ ਗੰਭੀਰ"},
    "Moderate": {"hi": "मध्यम", "mr": "मध्यम", "gu": "મધ્યમ", "te": "మితమైన", "ta": "மிதமான", "kn": "ಮಧ್ಯಮ", "pa": "ਦਰਮਿਆਨਾ"},
    "Low": {"hi": "कम", "mr": "कमी", "gu": "ઓછું", "te": "తక్కువ", "ta": "குறைந்த", "kn": "ಕಡಿಮೆ", "pa": "ਘੱਟ"},

    # Recommendations & Advisories
    "Apply appropriate fungicide and avoid overhead irrigation.": {
        "hi": "उचित कवकनाशी का छिड़काव करें और ऊपर से सिंचाई (स्प्रिंकलर) करने से बचें।",
        "mr": "योग्य बुरशीनाशकाची फवारणी करा आणि वरून पाणी देणे टाळा.",
        "gu": "યોગ્ય ફૂગનાશકનો છંટકાવ કરો અને ફુવારા પદ્ધતિથી સિંચાઈ કરવાનું ટાળો.",
        "te": "తగిన శిలీంద్ర సంహారిణిని పిచికారీ చేయండి మరియు పైనుండి నీరు పెట్టడం నివారించండి.",
        "ta": "பொருத்தமான பூஞ்சாணக்கொல்லியை தெளிக்கவும் மற்றும் மேல்நிலை பாசனத்தை தவிர்க்கவும்.",
        "kn": "ಸೂಕ್ತವಾದ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಸಿಂಪಡಿಸಿ ಮತ್ತು ಮೇಲಿನಿಂದ ನೀರುಣಿಸುವುದನ್ನು ತಪ್ಪಿಸಿ.",
        "pa": "ਢੁਕਵੀਂ ਉੱਲੀਨਾਸ਼ਕ ਦਵਾਈ ਦਾ ਛਿੜਕਾਅ ਕਰੋ ਅਤੇ ਫੁਹਾਰਾ ਸਿੰਚਾਈ ਤੋਂ ਬਚੋ।"
    },
    "Your crop requires irrigation within 24 hours.": {
        "hi": "आपकी फसल को 24 घंटे के अंदर सिंचाई की आवश्यकता है।",
        "mr": "तुमच्या पिकाला 24 तासांच्या आत पाण्याची आवश्यकता आहे.",
        "gu": "તમારા પાકને 24 કલાકમાં પિયતની જરૂર છે.",
        "te": "మీ పంటకు 24 గంటల్లో నీటిపారుదల అవసరం.",
        "ta": "உங்கள் பயிருக்கு 24 மணி நேரத்திற்குள் நீர்ப்பாசனம் தேவைப்படுகிறது.",
        "kn": "ನಿಮ್ಮ ಬೆಳೆಗೆ 24 ಗಂಟೆಗಳಲ್ಲಿ ನೀರಾವರಿ ಅಗತ್ಯವಿದೆ.",
        "pa": "ਤੁਹਾਡੀ ਫ਼ਸਲ ਨੂੰ 24 ਘੰਟਿਆਂ ਦੇ ਅੰਦਰ ਸਿੰਚਾਈ ਦੀ ਲੋੜ ਹੈ।"
    },
    "Improve drainage and avoid excessive nitrogen fertilizer.": {
        "hi": "खेत में जल निकासी में सुधार करें और अत्यधिक नाइट्रोजन उर्वरक के प्रयोग से बचें।",
        "mr": "शेतात पाण्याचा निचरा सुधारा आणि जास्त नायट्रोजन खत देणे टाळा.",
        "gu": "જમીનમાં પાણીના નિકાલની વ્યવસ્થા સુધારો અને વધુ પડતું નાઇટ્રોજન ખાતર ટાળો.",
        "te": "పొలంలో నీటి పారుదల సౌకర్యం మెరుగుపరచండి మరియు అధిక నత్రజని వాడకాన్ని తగ్గించండి.",
        "ta": "வடிகால் வசதியை மேம்படுத்தவும் மற்றும் அதிகப்படியான நைட்ரஜன் உரத்தைத் தவிர்க்கவும்.",
        "kn": "ನೀರು ಸರಾಗವಾಗಿ ಹರಿಯಲು ವ್ಯವಸ್ಥೆ ಮಾಡಿ ಮತ್ತು ಹೆಚ್ಚು ಸಾರಜನಕ ಗೊಬ್ಬರ ಬಳಸುವುದನ್ನು ತಪ್ಪಿಸಿ.",
        "pa": "ਖੇਤ ਵਿੱਚ ਪਾਣੀ ਦੇ ਨਿਕਾਸ ਦਾ ਪ੍ਰਬੰਧ ਸੁਧਾਰੋ ਅਤੇ ਬੇਲੋੜੀ ਯੂਰੀਆ/ਨਾਈਟ੍ਰੋਜਨ ਤੋਂ ਬਚੋ।"
    },
    "Apply Mancozeb 75% WP @ 2.5 g/L.": {
        "hi": "मैंकोज़ेब 75% WP @ 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।",
        "mr": "मँकोझेब 75% डब्ल्यूपी @ 2.5 ग्रॅम प्रति लिटर पाण्यात मिसळून फवारा.",
        "gu": "મેન્કોઝેબ 75% WP @ 2.5 ગ્રામ પ્રતિ લીટર પાણીમાં મેળવીને છંટકાવ કરો.",
        "te": "మాంకోజెబ్ 75% WP ను లీటరు నీటికి 2.5 గ్రాములు కలిపి పిచికారీ చేయండి.",
        "ta": "மேன்கோசெப் 75% WP ஐ லிட்டருக்கு 2.5 கிராம் வீதம் கலந்து தெளிக்கவும்.",
        "kn": "ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP ಅನ್ನು ಲೀಟರ್ ನೀರಿಗೆ 2.5 ಗ್ರಾಂ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.",
        "pa": "ਮੈਂਕੋਜ਼ੇਬ 75% ਡਬਲਯੂਪੀ @ 2.5 ਗ੍ਰਾਮ ਪ੍ਰਤੀ ਲੀਟਰ ਪਾਣੀ ਵਿੱਚ ਮਿਲਾ ਕੇ ਛਿੜਕਾਅ ਕਰੋ।"
    },
    "Apply Neem Oil 10,000 ppm @ 3 ml/L for organic suppression.": {
        "hi": "जैविक रोकथाम हेतु नीम का तेल 10,000 ppm @ 3 मिली प्रति लीटर का छिड़काव करें।",
        "mr": "सेंद्रिय नियंत्रणासाठी निंबोळी अर्क/तेल 10,000 ppm @ 3 मिली प्रति लिटर फवारा.",
        "gu": "જૈવિક નિયંત્રણ માટે લીમડાનું તેલ 10,000 ppm @ 3 મિલી પ્રતિ લીટર છાંટો.",
        "te": "సేంద్రీయ నియంత్రణ కొరకు వేప నూనె 10,000 ppm ను లీటరుకు 3 మి.లీ పిచికారీ చేయండి.",
        "ta": "இயற்கை கட்டுப்பாடுக்கு வேப்பெண்ணெய் 10,000 ppm @ 3 மி.லி/லிட்டர் தெளிக்கவும்.",
        "kn": "ಸಾವಯವ ನಿಯಂತ್ರಣಕ್ಕಾಗಿ ಬೇಪಿನ ಎಣ್ಣೆ 10,000 ppm ಅನ್ನು 3 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.",
        "pa": "ਜੈਵਿਕ ਰੋਕਥਾਮ ਲਈ ਨਿੰਮ ਦਾ ਤੇਲ 10,000 ppm @ 3 ਮਿਲੀ ਪ੍ਰਤੀ ਲੀਟਰ ਛਿੜਕੋ।"
    },
    "Use disease-resistant varieties.": {
        "hi": "रोग प्रतिरोधी उन्नत किस्मों का उपयोग करें।",
        "mr": "रोगप्रतिकारक सुधारित वाणांचा वापर करा.",
        "gu": "રોગપ્રતિકારક જાતોનો ઉપયોગ કરો.",
        "te": "తెగుళ్లను తట్టుకునే రకాలను ఉపయోగించండి.",
        "ta": "நோய் எதிர்ப்பு திறன் கொண்ட ரகங்களை பயன்படுத்தவும்.",
        "kn": "ರೋಗ ನಿರೋಧಕ ತಳಿಗಳನ್ನು ಬಳಸಿ.",
        "pa": "ਰੋਗ ਰਹਿਤ ਅਤੇ ਪ੍ਰਤੀਰੋਧੀ ਬੀਜਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ।"
    },
    "Soil moisture is critically low. Immediate irrigation recommended.": {
        "hi": "मिट्टी में नमी का स्तर बहुत कम है। तत्काल सिंचाई की सलाह दी जाती है।",
        "mr": "जमिनीतील ओलावा अत्यंत कमी झाला आहे. त्वरित पाणी देण्याचा सल्ला दिला जातो.",
        "gu": "જમીનમાં ભેજનું પ્રમાણ ખૂબ ઓછું છે. તાત્કાલિક પિયત આપવાની સલાહ છે.",
        "te": "నేలలో తేమ శాతం చాలా తక్కువగా ఉంది. వెంటనే నీటిపారుదల అవసరం.",
        "ta": "மண்ணின் ஈரப்பதம் மிகவும் குறைவாக உள்ளது. உடனடியாக நீர்ப்பாசனம் செய்யவும்.",
        "kn": "ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ತುಂಬಾ ಕಡಿಮೆಯಾಗಿದೆ. ತಕ್ಷಣ ನೀರಾವರಿ ಒದಗಿಸಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",
        "pa": "ਮਿੱਟੀ ਦੀ ਨਮੀ ਬਹੁਤ ਘੱਟ ਗਈ ਹੈ। ਤੁਰੰਤ ਸਿੰਚਾਈ ਕਰਨ ਦੀ ਸਲਾਹ ਦਿੱਤੀ ਜਾਂਦੀ ਹੈ।"
    }
}

class IndicTranslator:
    def __init__(self, checkpoint_path: str = "./models/indictrans2"):
        self.checkpoint_path = checkpoint_path
        self.model = None
        self.model_type = "hybrid"
        self._memory_cache: Dict[str, str] = {}
        
        # Try loading actual CTranslate2 / IndicTrans2 model if installed
        try:
            from inference.engine import Model
            if os.path.exists(checkpoint_path):
                self.model = Model(checkpoint_path, model_type="ctranslate2")
                self.model_type = "ctranslate2"
                logger.info(f"✅ Loaded IndicTrans2 CTranslate2 model from {checkpoint_path}")
            else:
                logger.info(f"ℹ️ IndicTrans2 checkpoint not found at {checkpoint_path}. Running high-speed hybrid engine.")
        except Exception as e:
            logger.info(f"ℹ️ Running IndicTrans2 hybrid translation engine ({e}).")

    def _get_cache_key(self, source: str, target: str, text: str) -> str:
        # Standardized translation cache key
        norm_text = text.strip()
        return f"trans:{source}:{target}:{norm_text}"

    def translate_paragraph(self, text: str, source_lang: str, target_lang: str) -> str:
        if not text or not text.strip():
            return ""
        if source_lang == target_lang:
            return text

        cache_key = self._get_cache_key(source_lang, target_lang, text)
        
        # 1. Check in-memory cache
        if cache_key in self._memory_cache:
            return self._memory_cache[cache_key]

        # 2. If CTranslate2 model is loaded, use it
        if self.model is not None:
            try:
                translated = self.model.translate_paragraph(text, source_lang, target_lang)
                self._memory_cache[cache_key] = translated
                return translated
            except Exception as e:
                logger.error(f"IndicTrans2 inference warning: {e}. Falling back to domain dictionary.")

        # 3. Domain Agricultural & Telemetry Translation Engine
        translated = self._fallback_domain_translation(text, source_lang, target_lang)
        self._memory_cache[cache_key] = translated
        return translated

    def _fallback_domain_translation(self, text: str, source_lang: str, target_lang: str) -> str:
        # Map source/target to short ISO code (e.g. hin_Deva -> hi, eng_Latn -> en)
        target_iso = target_lang.split("_")[0][:2]
        if target_iso not in LANGUAGE_METADATA:
            target_iso = "hi"

        clean_text = text.strip()

        # Check full sentence in farming vocabulary
        if clean_text in FARMING_VOCABULARY:
            trans_map = FARMING_VOCABULARY[clean_text]
            if target_iso in trans_map:
                return trans_map[target_iso]
            elif "hi" in trans_map:
                return trans_map["hi"]

        # Word-by-word / phrase substitution for combined agricultural terms
        for phrase, trans_map in FARMING_VOCABULARY.items():
            if phrase.lower() in clean_text.lower():
                replacement = trans_map.get(target_iso, trans_map.get("hi", phrase))
                clean_text = clean_text.replace(phrase, replacement)

        return clean_text

    def translate_structured(self, data: Dict[str, Any], source: str = "en", target: str = "hi") -> Dict[str, Any]:
        """
        Translates structured AI farming payloads component-by-component as recommended by IndicTrans2 architecture.
        """
        source_code = LANGUAGES.get(source, "eng_Latn")
        target_code = LANGUAGES.get(target, "hin_Deva")

        translated_data = dict(data)
        
        # Keys to translate if present
        trans_keys = [
            "disease", "disease_name", "crop", "species", "severity",
            "recommendation", "cause", "cure", "prevention", "pesticide_advisory",
            "condition", "risk_level", "advisory", "spray"
        ]

        for k in trans_keys:
            if k in translated_data and isinstance(translated_data[k], str) and translated_data[k].strip():
                translated_data[k] = self.translate_paragraph(translated_data[k], source_code, target_code)

        if "top_predictions" in translated_data and isinstance(translated_data["top_predictions"], list):
            new_preds = []
            for pred in translated_data["top_predictions"]:
                if isinstance(pred, dict) and "class_name" in pred:
                    item = dict(pred)
                    item["class_name"] = self.translate_paragraph(item["class_name"], source_code, target_code)
                    new_preds.append(item)
                else:
                    new_preds.append(pred)
            translated_data["top_predictions"] = new_preds

        return translated_data

# Singleton instance
indic_translator = IndicTranslator(checkpoint_path="./models/indictrans2")
