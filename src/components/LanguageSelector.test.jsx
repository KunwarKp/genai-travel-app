import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LanguageSelector from './LanguageSelector';
import { AVAILABLE_LANGUAGES } from '../utils/languageMap';

describe('LanguageSelector Component', () => {
  it('renders the current language name correctly', () => {
    const currentLang = AVAILABLE_LANGUAGES[0]; // e.g., Bhojpuri (Bihar) or similar
    render(<LanguageSelector currentLanguage={currentLang} onLanguageChange={vi.fn()} />);
    
    const selectElement = screen.getByLabelText('Select storytelling language');
    expect(selectElement.value).toBe(currentLang.name);
  });

  it('triggers onLanguageChange when a new language is selected', () => {
    const onLanguageChangeMock = vi.fn();
    const currentLang = AVAILABLE_LANGUAGES[0];
    render(<LanguageSelector currentLanguage={currentLang} onLanguageChange={onLanguageChangeMock} />);

    const selectElement = screen.getByLabelText('Select storytelling language');
    const newLang = AVAILABLE_LANGUAGES[1];
    
    fireEvent.change(selectElement, { target: { value: newLang.name } });

    expect(onLanguageChangeMock).toHaveBeenCalledWith(newLang);
  });
});
