/**
 * Utility for browser-native Text-to-Speech (Web Speech API).
 * 100% free, zero latency, highly accessible.
 */

let synth = null;
let currentUtterance = null;

// Safe initialization for browser environment
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  synth = window.speechSynthesis;
}

/**
 * Plays the provided text as audio using the browser's TTS engine.
 * @param {string} text - The text to read aloud
 * @param {string} langCode - BCP-47 language tag (e.g. 'en-US', 'fr-FR', 'hi-IN')
 * @param {Function} onEndCallback - Callback fired when audio finishes playing
 */
export function playAudio(text, langCode = 'en-US', onEndCallback) {
  if (!synth) {
    console.warn("Text-to-speech not supported in this browser.");
    if (onEndCallback) onEndCallback();
    return;
  }

  // Stop any currently playing audio before starting new
  stopAudio();

  currentUtterance = new SpeechSynthesisUtterance(text);
  
  // Attempt to select the specific language voice
  const voices = synth.getVoices();
  const preferredVoice = voices.find(v => v.lang.startsWith(langCode)) || 
                         voices.find(v => v.lang.startsWith(langCode.split('-')[0])) ||
                         voices.find(v => v.lang === 'en-GB' || v.lang === 'en-US');
  
  if (preferredVoice) {
    currentUtterance.voice = preferredVoice;
    // Ensure the utterance language matches the voice
    currentUtterance.lang = preferredVoice.lang;
  } else {
    currentUtterance.lang = langCode;
  }
  
  currentUtterance.rate = 0.95; // Slightly slower for dramatic storytelling effect
  currentUtterance.pitch = 1.0;

  if (onEndCallback) {
    currentUtterance.onend = onEndCallback;
  }

  synth.speak(currentUtterance);
}

/**
 * Stops any currently playing audio.
 */
export function stopAudio() {
  if (synth && synth.speaking) {
    synth.cancel();
  }
}
