import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './languages';
import { TRANSLATIONS } from './translations';

const LanguageContext = createContext(null);

// In-memory cache for dynamic translations
const memoryCache = new Map();

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('kisan_preferred_lang');
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('Unable to read language preference from localStorage:', e);
    }
    return DEFAULT_LANGUAGE;
  });

  const [isTranslating, setIsTranslating] = useState(false);

  // Sync to localStorage
  const changeLanguage = useCallback((code) => {
    if (!SUPPORTED_LANGUAGES.some(l => l.code === code)) {
      console.warn(`Unsupported language code: ${code}`);
      return;
    }
    setCurrentLanguage(code);
    try {
      localStorage.setItem('kisan_preferred_lang', code);
    } catch (e) {
      console.warn('Unable to persist language preference:', e);
    }
  }, []);

  /**
   * Static key translation lookup with deep dot notation support
   * Example: t('weather.currentConditions', 'Current Conditions')
   */
  const t = useCallback((path, fallback = '') => {
    if (!path) return fallback;
    const parts = path.split('.');

    // Try current language
    let cur = TRANSLATIONS[currentLanguage];
    let found = true;
    for (const part of parts) {
      if (cur && typeof cur === 'object' && part in cur) {
        cur = cur[part];
      } else {
        found = false;
        break;
      }
    }
    if (found && typeof cur === 'string') return cur;

    // Fallback to English
    let enCur = TRANSLATIONS.en;
    let enFound = true;
    for (const part of parts) {
      if (enCur && typeof enCur === 'object' && part in enCur) {
        enCur = enCur[part];
      } else {
        enFound = false;
        break;
      }
    }
    if (enFound && typeof enCur === 'string') return enCur;

    return fallback || parts[parts.length - 1] || path;
  }, [currentLanguage]);

  /**
   * Dynamic text translation via backend IndicTrans2 service with caching
   */
  const translateText = useCallback(async (text, targetLang = currentLanguage, sourceLang = 'en') => {
    if (!text || typeof text !== 'string') return text;
    if (targetLang === sourceLang) return text;

    const cacheKey = `${sourceLang}:${targetLang}:${text}`;
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }

    try {
      const cachedSession = sessionStorage.getItem(`it2_${cacheKey}`);
      if (cachedSession) {
        memoryCache.set(cacheKey, cachedSession);
        return cachedSession;
      }
    } catch (e) {}

    // Determine API Base URL
    const configuredApi = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const API_BASE = configuredApi || (isLocalhost ? 'http://localhost:8001' : '');

    try {
      setIsTranslating(true);
      const res = await fetch(`${API_BASE}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          source: sourceLang,
          target: targetLang
        })
      });

      if (res.ok) {
        const data = await res.json();
        const translated = data.translated || text;
        memoryCache.set(cacheKey, translated);
        try {
          sessionStorage.setItem(`it2_${cacheKey}`, translated);
        } catch (e) {}
        return translated;
      }
    } catch (err) {
      console.warn('IndicTrans2 translation failed, falling back to original:', err.message);
    } finally {
      setIsTranslating(false);
    }

    return text;
  }, [currentLanguage]);

  /**
   * Structured AI response translation (e.g. disease name, recommendation, prevention)
   */
  const translateStructured = useCallback(async (dataObj, targetLang = currentLanguage) => {
    if (!dataObj || typeof dataObj !== 'object') return dataObj;
    if (targetLang === 'en') return dataObj;

    const configuredApi = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const API_BASE = configuredApi || (isLocalhost ? 'http://localhost:8001' : '');

    try {
      setIsTranslating(true);
      const res = await fetch(`${API_BASE}/api/translate/structured`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: dataObj,
          target: targetLang
        })
      });

      if (res.ok) {
        const result = await res.json();
        if (result && result.translated) {
          return result.translated;
        }
      }
    } catch (err) {
      console.warn('Structured translation service unavailable:', err.message);
    } finally {
      setIsTranslating(false);
    }

    return dataObj;
  }, [currentLanguage]);

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  }, [currentLanguage]);

  const value = useMemo(() => ({
    currentLanguage,
    setLanguage: changeLanguage,
    currentLanguageInfo,
    supportedLanguages: SUPPORTED_LANGUAGES,
    t,
    translateText,
    translateStructured,
    isTranslating
  }), [currentLanguage, changeLanguage, currentLanguageInfo, t, translateText, translateStructured, isTranslating]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
