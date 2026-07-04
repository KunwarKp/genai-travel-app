import { describe, it, expect } from 'vitest';
import { detectLocalLanguage, AVAILABLE_LANGUAGES } from './languageMap';

describe('languageMap Utility', () => {
  it('defines available languages list', () => {
    expect(AVAILABLE_LANGUAGES.length).toBeGreaterThan(0);
    expect(AVAILABLE_LANGUAGES[0]).toHaveProperty('name');
    expect(AVAILABLE_LANGUAGES[0]).toHaveProperty('ttsCode');
  });

  it('detects state-level language for India', () => {
    const address = { country: 'India', state: 'Karnataka' };
    const language = detectLocalLanguage(address);
    expect(language).toEqual({ name: 'Kannada', ttsCode: 'kn-IN' });
  });

  it('detects country-level language for international destinations', () => {
    const address = { country: 'Japan' };
    const language = detectLocalLanguage(address);
    expect(language).toEqual({ name: 'Japanese', ttsCode: 'ja-JP' });
  });

  it('returns Hindi for unmapped Indian states', () => {
    const address = { country: 'India', state: 'Unknown State' };
    const language = detectLocalLanguage(address);
    expect(language).toEqual({ name: 'Hindi', ttsCode: 'hi-IN' });
  });

  it('returns null for completely unmapped locations', () => {
    const address = { country: 'Atlantis' };
    const language = detectLocalLanguage(address);
    expect(language).toBeNull();
  });
});
