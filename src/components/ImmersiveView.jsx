import React, { useState, useEffect } from 'react';

export default function ImmersiveView({ imageUrl, destination }) {
  const [images, setImages] = useState([]);

  // Reset images when destination changes to prevent showing the previous city's photos
  useEffect(() => {
    setImages([]);
  }, [destination]);

  useEffect(() => {
    if (imageUrl) {
      setImages(prev => {
        // Only add if it's different from the current top image
        if (prev[prev.length - 1] === imageUrl) return prev;
        return [...prev, imageUrl].slice(-2); // Keep only the last 2 images for crossfading
      });
    }
  }, [imageUrl]);

  if (!imageUrl && images.length === 0) {
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '64px', height: '64px', marginBottom: '16px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <p style={{ fontSize: '1.1rem' }}>No high-resolution photo available for<br/><b>{destination || "this location"}</b>.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', overflow: 'hidden' }}>
      {images.map((img, index) => (
        <div
          key={img}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${img}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: index, // Newest image stacks on top
            animation: index > 0 ? 'fadeIn 1.5s ease-in-out forwards' : 'none',
            transform: 'scale(1.02)'
          }}
        >
          {/* Subtle overlay to make UI readable */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8))' }} />
        </div>
      ))}
    </div>
  );
}
