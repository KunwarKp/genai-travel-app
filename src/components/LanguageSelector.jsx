import React from 'react';
import PropTypes from 'prop-types';
import { Globe } from 'lucide-react';
import { AVAILABLE_LANGUAGES } from '../utils/languageMap';

export default function LanguageSelector({ currentLanguage, onLanguageChange }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
      <Globe size={16} color="var(--text-secondary)" />
      <select
        value={currentLanguage.name}
        onChange={(e) => {
          const selected = AVAILABLE_LANGUAGES.find(lang => lang.name === e.target.value);
          if (selected) onLanguageChange(selected);
        }}
        aria-label="Select storytelling language"
        style={{
          background: 'transparent',
          color: 'var(--text-primary)',
          border: 'none',
          outline: 'none',
          fontSize: '14px',
          cursor: 'pointer',
          appearance: 'none',
          paddingRight: '12px'
        }}
      >
        {AVAILABLE_LANGUAGES.map((lang) => (
          <option key={lang.name} value={lang.name} style={{ background: '#1e1b4b', color: 'white' }}>
            {lang.name}
          </option>
        ))}
      </select>
      {/* Custom dropdown arrow to replace native appearance */}
      <div style={{ position: 'absolute', right: '12px', pointerEvents: 'none' }}>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

LanguageSelector.propTypes = {
  currentLanguage: PropTypes.shape({
    name: PropTypes.string,
    ttsCode: PropTypes.string
  }).isRequired,
  onLanguageChange: PropTypes.func.isRequired
};
