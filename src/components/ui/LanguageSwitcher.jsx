import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const LANGUAGE_LABELS = {
  en: 'English',
  es: 'Espanol',
  fr: 'Francais',
  zh: '\u4E2D\u6587',
  ja: '\u65E5\u672C\u8A9E',
};

export default function LanguageSwitcher() {
  const { lang, setLang, supportedLanguages } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Select language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#1b2a4a',
          fontSize: '14px',
          fontFamily: 'inherit',
          padding: '6px 10px',
          borderRadius: '4px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(27,42,74,0.06)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        {/* Globe icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
        </svg>
        <span style={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
          {lang}
        </span>
      </button>

      {open && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            margin: '4px 0 0 0',
            padding: '6px 0',
            listStyle: 'none',
            background: '#fdf8f0',
            border: '1px solid rgba(27,42,74,0.12)',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            minWidth: '160px',
            zIndex: 1000,
          }}
        >
          {supportedLanguages.map((code) => (
            <li key={code}>
              <button
                onClick={() => {
                  setLang(code);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 16px',
                  border: 'none',
                  background: code === lang ? 'rgba(232,100,80,0.08)' : 'transparent',
                  cursor: 'pointer',
                  color: '#1b2a4a',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (code !== lang) e.currentTarget.style.background = 'rgba(27,42,74,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    code === lang ? 'rgba(232,100,80,0.08)' : 'transparent';
                }}
              >
                <span>{LANGUAGE_LABELS[code]}</span>
                <span
                  style={{
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: code === lang ? '#e86450' : '#1b2a4a80',
                    letterSpacing: '0.5px',
                  }}
                >
                  {code}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
