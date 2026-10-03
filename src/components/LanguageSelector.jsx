import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageSelector() {
  const { currentLanguage, setLanguage, currentLanguageInfo, supportedLanguages, isTranslating } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="language-selector-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="language-selector-btn"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Select Language (IndicTrans2)"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: isOpen ? 'var(--green-100)' : 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          fontSize: '13px',
          fontWeight: 600,
          transition: 'all 0.15s ease',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <span style={{ fontSize: '15px' }}>{currentLanguageInfo.flag}</span>
        <span style={{ fontFamily: 'inherit' }}>{currentLanguageInfo.native}</span>
        {isTranslating && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              animation: 'spin 1s linear infinite'
            }}
          >
            <Sparkles size={12} color="var(--brand)" />
          </span>
        )}
        <ChevronDown
          size={14}
          style={{
            color: 'var(--text-faint)',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease'
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '260px',
            maxHeight: '360px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            overflowY: 'auto',
            animation: 'fadeIn 0.15s ease-out',
            padding: '6px'
          }}
        >
          {/* Header Info */}
          <div
            style={{
              padding: '8px 10px 6px',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Globe size={12} />
              AI4Bharat IndicTrans2
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px' }}>
              Select regional agricultural language
            </div>
          </div>

          {/* Options */}
          {supportedLanguages.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(lang.code)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--green-50)' : 'transparent',
                  border: isSelected ? '1px solid var(--green-200)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s ease',
                  marginBottom: '2px'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>{lang.flag}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--brand)' : 'var(--text-primary)' }}>
                      {lang.native}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-faint)' }}>
                      {lang.name} · {lang.region}
                    </div>
                  </div>
                </div>
                {isSelected && <Check size={14} color="var(--brand)" style={{ strokeWidth: 2.5 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
