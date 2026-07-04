/**
 * Utility for mapping geographical regions (states/countries) to their local languages/dialects 
 * and browser TTS BCP-47 language codes.
 */

// Global defaults for countries
const countryLanguageMap = {
  'france': { name: 'French', ttsCode: 'fr-FR' },
  'japan': { name: 'Japanese', ttsCode: 'ja-JP' },
  'spain': { name: 'Spanish', ttsCode: 'es-ES' },
  'mexico': { name: 'Spanish', ttsCode: 'es-MX' },
  'germany': { name: 'German', ttsCode: 'de-DE' },
  'italy': { name: 'Italian', ttsCode: 'it-IT' },
  'china': { name: 'Mandarin', ttsCode: 'zh-CN' },
  'russia': { name: 'Russian', ttsCode: 'ru-RU' },
  'south korea': { name: 'Korean', ttsCode: 'ko-KR' },
  'brazil': { name: 'Portuguese', ttsCode: 'pt-BR' },
  'portugal': { name: 'Portuguese', ttsCode: 'pt-PT' },
};

// Hyper-localized defaults for Indian States
const indiaStateLanguageMap = {
  'karnataka': { name: 'Kannada', ttsCode: 'kn-IN' },
  'tamil nadu': { name: 'Tamil', ttsCode: 'ta-IN' },
  'kerala': { name: 'Malayalam', ttsCode: 'ml-IN' },
  'andhra pradesh': { name: 'Telugu', ttsCode: 'te-IN' },
  'telangana': { name: 'Telugu', ttsCode: 'te-IN' },
  'maharashtra': { name: 'Marathi', ttsCode: 'mr-IN' },
  'gujarat': { name: 'Gujarati', ttsCode: 'gu-IN' },
  'odisha': { name: 'Odia', ttsCode: 'or-IN' }, // Some browsers use or-IN or od-IN. English/Hindi fallback handles TTS.
  'west bengal': { name: 'Bengali', ttsCode: 'bn-IN' },
  'punjab': { name: 'Punjabi', ttsCode: 'pa-IN' },
  'bihar': { name: 'Bhojpuri (Bihari)', ttsCode: 'hi-IN' }, // Groq will write Bhojpuri, TTS falls back to Hindi voice
  'uttar pradesh': { name: 'Hindi', ttsCode: 'hi-IN' },
  'rajasthan': { name: 'Rajasthani', ttsCode: 'hi-IN' },
  'madhya pradesh': { name: 'Hindi', ttsCode: 'hi-IN' },
  'assam': { name: 'Assamese', ttsCode: 'en-IN' }
};

export const AVAILABLE_LANGUAGES = [
  { name: 'English', ttsCode: 'en-US' },
  { name: 'Hindi', ttsCode: 'hi-IN' },
  { name: 'Bhojpuri (Bihari)', ttsCode: 'hi-IN' },
  { name: 'Tamil', ttsCode: 'ta-IN' },
  { name: 'Telugu', ttsCode: 'te-IN' },
  { name: 'Kannada', ttsCode: 'kn-IN' },
  { name: 'Malayalam', ttsCode: 'ml-IN' },
  { name: 'Marathi', ttsCode: 'mr-IN' },
  { name: 'Gujarati', ttsCode: 'gu-IN' },
  { name: 'Bengali', ttsCode: 'bn-IN' },
  { name: 'Punjabi', ttsCode: 'pa-IN' },
  { name: 'Odia', ttsCode: 'or-IN' },
  { name: 'French', ttsCode: 'fr-FR' },
  { name: 'Japanese', ttsCode: 'ja-JP' },
  { name: 'Spanish', ttsCode: 'es-ES' },
  { name: 'German', ttsCode: 'de-DE' }
];

/**
 * Detects the most authentic local language given an OSM address object.
 * @param {Object} address - Address details from Nominatim reverse geocoding
 * @returns {Object|null} - The language object { name, ttsCode } or null if unknown
 */
export function detectLocalLanguage(address) {
  if (!address) return null;

  const country = (address.country || '').toLowerCase();
  const state = (address.state || '').toLowerCase();

  // If it's India, try to use state-level detection for hyper-localization
  if (country === 'india' && state) {
    if (indiaStateLanguageMap[state]) {
      return indiaStateLanguageMap[state];
    }
    // Default to Hindi/English for unmapped Indian states
    return { name: 'Hindi', ttsCode: 'hi-IN' };
  }

  // Otherwise, use country-level detection
  if (countryLanguageMap[country]) {
    return countryLanguageMap[country];
  }

  return null;
}
