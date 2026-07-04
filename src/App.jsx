import React, { useState, useCallback, useEffect, useRef, Suspense, lazy } from 'react';
import SearchBar from './components/SearchBar';
import ImmersiveView from './components/ImmersiveView';
import StoryGuide from './components/StoryGuide';
import LanguageSelector from './components/LanguageSelector';
import { fetchDestinationStory } from './utils/groqApi';
import { detectLocalLanguage, AVAILABLE_LANGUAGES } from './utils/languageMap';

// Lazy load the heavy Leaflet Map component to drastically improve Time to Interactive and First Contentful Paint
const MapBackground = lazy(() => import('./components/MapBackground'));

/**
 * Main Application Component for the GenAI Travel App.
 * Orchestrates state between the search, AI storytelling, and map/immersive views.
 * 
 * @returns {JSX.Element}
 */
export default function App() {
  const [destination, setDestination] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('Hidden Gems');
  const [arMode, setArMode] = useState(false);
  const [wikiImage, setWikiImage] = useState(null);
  const [activePlaceImage, setActivePlaceImage] = useState(null);
  const [language, setLanguage] = useState(AVAILABLE_LANGUAGES[0]); // Default English

  const categories = ['Hidden Gems', 'Attractions', 'Local Culture', 'Recipes', 'Events', 'Storytelling', 'Connect'];

  /**
   * Handles searching for a new destination or topic.
   * Fetches coordinates, background images, and the AI story.
   * 
   * @param {string} query - The search query (e.g. "Paris")
   * @param {string} category - The active category (e.g. "Hidden Gems")
   * @param {Object} lang - Language override, defaults to current language state
   */
  const handleSearch = useCallback(async (query, category = activeCategory, lang = language) => {
    // Strictly prevent searching for the exact same query and category in a loop
    if (query === destination && category === activeCategory && lang.name === language.name) return;
    
    setDestination(query);
    setActiveCategory(category);
    setLanguage(lang);
    setStory('');
    setError('');
    setIsLoading(true);
    setActivePlaceImage(null);

    let detectedLanguage = lang; // Start with requested language

    try {
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1`, {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9'
          }
        });
        const geoData = await geoRes.json();
        
        if (geoData && geoData.length > 0) {
          setCoordinates({ lat: geoData[0].lat, lon: geoData[0].lon });
          
          // Auto-detect language if the user didn't explicitly override it for this search
          // Only auto-detect on fresh destination searches, not deep dives or category switches
          if (query !== destination) {
             const autoLang = detectLocalLanguage(geoData[0].address);
             if (autoLang) {
               detectedLanguage = autoLang;
               setLanguage(autoLang);
             }
          }
        }
      } catch (geoError) {
        console.warn("Geocoding failed, map won't update but story will proceed:", geoError);
      }

      try {
        let wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&piprop=original&format=json&origin=*`);
        let wikiData = await wikiRes.json();
        let pages = wikiData.query?.pages;

        // If no page found, or page found but has no image
        const hasValidImage = (p) => p && Object.keys(p)[0] !== '-1' && p[Object.keys(p)[0]].original;

        if (!hasValidImage(pages) && query.includes(',')) {
          const fallbackQuery = query.split(',').pop().trim();
          wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(fallbackQuery)}&gsrlimit=1&prop=pageimages&piprop=original&format=json&origin=*`);
          wikiData = await wikiRes.json();
          pages = wikiData.query?.pages;
        }

        if (hasValidImage(pages)) {
          setWikiImage(pages[Object.keys(pages)[0]].original.source);
        } else {
          setWikiImage(null);
        }
      } catch (wikiError) {
        console.warn("Wiki image fetch failed:", wikiError);
        setWikiImage(null);
      }

      const generatedStory = await fetchDestinationStory(query, category, detectedLanguage.name);
      setStory(generatedStory);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not generate story or find location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [destination, activeCategory, language]);

  /**
   * Deep dive handler for exploring a specific topic related to the current destination.
   * 
   * @param {string} topic - The topic to deep dive into
   */
  const handleDeepDive = useCallback((topic) => {
    handleSearch(`${topic} in ${destination}`, 'Deep Dive');
  }, [destination, handleSearch]);

  const imageCache = useRef({});

  /**
   * Fetches high-resolution images for specific places as the user reads about them.
   * Uses an LRU cache pattern to prevent API spam and visual flickering.
   * 
   * @param {string} placeName - The name of the specific place inside the story
   */
  const handleFocusPlace = useCallback(async (placeName) => {
    if (!placeName) return;
    
    // Use cached image if we've already fetched it to prevent flickering
    if (imageCache.current[placeName] !== undefined) {
      setActivePlaceImage(imageCache.current[placeName]);
      return;
    }

    try {
      let wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(placeName + ' ' + destination)}&gsrlimit=1&prop=pageimages&piprop=original&format=json&origin=*`);
      let wikiData = await wikiRes.json();
      let pages = wikiData.query?.pages;

      const hasValidImage = (p) => p && Object.keys(p)[0] !== '-1' && p[Object.keys(p)[0]].original;

      if (!hasValidImage(pages)) {
        wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(placeName)}&gsrlimit=1&prop=pageimages&piprop=original&format=json&origin=*`);
        wikiData = await wikiRes.json();
        pages = wikiData.query?.pages;
      }

      let source = null;
      if (hasValidImage(pages)) {
        source = pages[Object.keys(pages)[0]].original.source;
      }
      
      imageCache.current[placeName] = source;
      setActivePlaceImage(source);
    } catch (err) {
      imageCache.current[placeName] = null;
      console.warn("Could not fetch place image", err);
    }
  }, [destination]);

  return (
    <main style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <h1 className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>GenAI Travel Guide</h1>
      
      {/* Background Layers - Ensure zIndex is 0 so they aren't hidden behind body */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }} aria-hidden="true">
        {arMode ? (
          <ImmersiveView imageUrl={activePlaceImage || wikiImage} destination={destination} />
        ) : (
          <Suspense fallback={<div style={{ width: '100%', height: '100%', background: '#0a0a0f' }} />}>
            <MapBackground coordinates={coordinates} />
          </Suspense>
        )}
      </div>

      {/* Floating Glass UI Layer */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, left: 0, width: '100%', height: '100%', 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          pointerEvents: 'none', // Allow clicking through to the map where there's no UI
          zIndex: 10
        }}
      >
        {/* Top Header Row */}
        <header style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start', maxWidth: '100%' }}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <SearchBar onSearch={(query) => handleSearch(query, activeCategory)} />
              <LanguageSelector 
                currentLanguage={language} 
                onLanguageChange={(lang) => {
                  if (destination) {
                    handleSearch(destination, activeCategory, lang);
                  } else {
                    setLanguage(lang);
                  }
                }} 
              />
            </div>
            
            <button 
              onClick={() => setArMode(!arMode)}
              className="glass-button"
              style={{ 
                padding: '10px 20px', 
                borderRadius: '30px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: arMode ? 'var(--accent-primary)' : 'rgba(0, 0, 0, 0.4)', 
                color: arMode ? '#000' : '#fff',
                fontWeight: '600',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              title="Toggle Immersive Photo Mode"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              {arMode ? 'Map View' : 'Immersive Photos'}
            </button>
          </div>
          
          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  if (destination) {
                    handleSearch(destination, cat);
                  }
                }}
                className="glass-button"
                style={{ 
                  padding: '6px 16px', 
                  borderRadius: '20px', 
                  whiteSpace: 'nowrap',
                  fontSize: '0.9rem',
                  backgroundColor: activeCategory === cat ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: activeCategory === cat ? '#000' : 'var(--text-primary)',
                  fontWeight: activeCategory === cat ? 600 : 400
                }}
                aria-pressed={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* Main Content Area (Bottom) */}
        <section 
          style={{ 
            pointerEvents: 'auto', 
            marginTop: 'auto', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end',
            gap: '24px'
          }}
        >
          {/* Floating Story Guide */}
          <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'auto', width: '100%', maxWidth: '600px' }}>
              {destination && (
                <StoryGuide 
                  destination={destination} 
                  story={story} 
                  isLoading={isLoading} 
                  error={error} 
                  onDeepDive={handleDeepDive} 
                  onFocusPlace={handleFocusPlace}
                  language={language}
                />
              )}
            </div>
          </div>
          {!destination && (
            <div style={{ padding: '24px', color: 'var(--text-muted)' }}>
              <h2>Where are you exploring today?</h2>
              <p>Type a destination above to begin your immersive journey.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
