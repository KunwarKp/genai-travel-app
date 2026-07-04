// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

const mockSynth = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn().mockReturnValue([
    { lang: 'en-US', name: 'US English' },
    { lang: 'fr-FR', name: 'French' }
  ]),
  speaking: false
};

// Properly define speechSynthesis on window so that 'speechSynthesis' in window is true before the module is imported
Object.defineProperty(window, 'speechSynthesis', {
  value: mockSynth,
  writable: true,
  configurable: true,
  enumerable: true
});

global.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.lang = '';
    this.rate = 1.0;
    this.pitch = 1.0;
    this.voice = null;
    this.onend = null;
  }
};

let playAudio, stopAudio;

describe('speechApi Utility', () => {
  beforeAll(async () => {
    // Dynamically import to ensure window mocks are established first
    const speechApi = await import('./speechApi');
    playAudio = speechApi.playAudio;
    stopAudio = speechApi.stopAudio;
  });

  beforeEach(() => {
    mockSynth.speak.mockClear();
    mockSynth.cancel.mockClear();
    mockSynth.speaking = false;
  });

  it('calls speechSynthesis.speak when playAudio is invoked', () => {
    playAudio('Hello world', 'en-US');
    expect(mockSynth.speak).toHaveBeenCalled();
  });

  it('stops existing audio when playAudio or stopAudio is called', () => {
    mockSynth.speaking = true;
    stopAudio();
    expect(mockSynth.cancel).toHaveBeenCalled();
  });
});
