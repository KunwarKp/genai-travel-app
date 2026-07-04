import React, { useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons not rendering correctly in React/Vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Component to fly the map to new coordinates
 * @param {Object} props - The component props
 * @param {Object} props.coords - Latitude and longitude to fly to
 * @param {number} props.coords.lat - Latitude
 * @param {number} props.coords.lon - Longitude
 */
function MapUpdater({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.lat && coords.lon) {
      map.flyTo([parseFloat(coords.lat), parseFloat(coords.lon)], 13, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}
MapUpdater.propTypes = { coords: PropTypes.object };

/**
 * Renders the interactive background map using Leaflet.
 * Memoized to prevent unnecessary re-renders during story updates.
 * 
 * @param {Object} props - The component props
 * @param {Object} props.coordinates - Target coordinates to focus the map on
 * @returns {JSX.Element}
 */
const MapBackground = memo(({ coordinates }) => {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: -1 }} aria-hidden="true">
      <MapContainer 
        center={[20.5937, 78.9629]} // Default to India
        zoom={5} 
        style={{ width: '100%', height: '100%', background: '#0a0a0f' }} // Darker map background
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />
        {coordinates && coordinates.lat && coordinates.lon && (
          <>
            <MapUpdater coords={coordinates} />
            <Marker position={[parseFloat(coordinates.lat), parseFloat(coordinates.lon)]}>
              <Popup>Selected Location</Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
});

MapBackground.displayName = 'MapBackground';

MapBackground.propTypes = {
  coordinates: PropTypes.shape({
    lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lon: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })
};

export default MapBackground;
