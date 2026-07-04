import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Search, Navigation } from 'lucide-react';
import GlassPanel from './GlassPanel';

/**
 * SearchBar - Handles destination search with debouncing for API efficiency.
 * Now includes HTML5 Geolocation support.
 * 
 * @param {Object} props
 * @param {Function} props.onSearch - Callback fired when a search is triggered
 * @returns {JSX.Element}
 */
export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  
  // Keep a mutable ref of the latest onSearch function to avoid triggering effects when it changes
  const onSearchRef = React.useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim().length > 2) {
        const sanitizedQuery = query.replace(/[<>]/g, '');
        onSearchRef.current(sanitizedQuery);
      }
    }, 1500); // Increased to 1.5 seconds to ensure slow typers don't exhaust the API
    
    return () => clearTimeout(handler);
  }, [query]); // ONLY trigger this effect when the user types (query changes)

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const sanitizedQuery = query.replace(/[<>]/g, '');
      onSearch(sanitizedQuery);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        // Reverse geocode with high detail (zoom=18)
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`, {
          headers: { 'Accept-Language': 'en-US,en;q=0.9' }
        });
        const data = await res.json();
        
        // Extract the most specific location possible (amenity, road, neighborhood) + city context
        const specificName = data.name || data.address?.amenity || data.address?.road || data.address?.neighbourhood || data.address?.suburb;
        const broadName = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Current Location";
        
        let locationName = broadName;
        if (specificName && specificName !== broadName) {
          locationName = `${specificName}, ${broadName}`;
        }
        
        setQuery(locationName);
        onSearchRef.current(locationName);
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
        alert("Could not detect location name from coordinates.");
      } finally {
        setIsLocating(false);
      }
    }, (error) => {
      console.error("GPS Error:", error);
      alert("Please allow location access in your browser to use this feature.");
      setIsLocating(false);
    });
  };

  return (
    <GlassPanel style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '400px', width: '100%' }}>
      <Search size={20} color="var(--text-muted)" aria-hidden="true" />
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', alignItems: 'center' }} aria-label="Search destination form">
        <input 
          type="text"
          className="glass-input"
          placeholder="Where to? (e.g., Haridwar)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search for a destination"
          style={{ border: 'none', padding: 0, background: 'transparent', width: '100%' }}
        />
        <button 
          type="button" 
          onClick={handleLocateMe}
          className="glass-button"
          style={{ padding: '8px', marginLeft: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Use my current GPS location"
          title="Detect my location"
          disabled={isLocating}
        >
          <Navigation size={18} color={isLocating ? "var(--accent-primary)" : "var(--text-primary)"} style={{ opacity: isLocating ? 0.5 : 1 }} />
        </button>
      </form>
    </GlassPanel>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired
};
