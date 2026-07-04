import React, { useState, useEffect } from 'react';

export default function PhotoGallery({ destination }) {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!destination) {
      setPhotos([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const fetchImages = async () => {
      try {
        let url = `https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&generator=images&titles=${encodeURIComponent(destination)}&gimlimit=10&format=json&origin=*`;
        let res = await fetch(url);
        let data = await res.json();
        let pages = data.query?.pages;

        if ((!pages || Object.keys(pages)[0] === '-1') && destination.includes(',')) {
          const fallbackQuery = destination.split(',').pop().trim();
          url = `https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&generator=images&titles=${encodeURIComponent(fallbackQuery)}&gimlimit=10&format=json&origin=*`;
          res = await fetch(url);
          data = await res.json();
          pages = data.query?.pages;
        }

        if (pages && Object.keys(pages)[0] !== '-1') {
          const images = Object.values(pages)
            .map(page => page.imageinfo?.[0]?.url)
            .filter(url => url && !url.endsWith('.svg') && !url.endsWith('.png') && !url.toLowerCase().includes('logo') && !url.toLowerCase().includes('icon'));
          setPhotos(images.slice(0, 6)); // Keep top 6
        } else {
          setPhotos([]);
        }
      } catch (err) {
        setPhotos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();

  }, [destination]);

  if (isLoading) return null;
  if (photos.length === 0) return null;

  return (
    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        Photos of {destination}
      </h3>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}>
        {photos.map((photo, i) => (
          <img 
            key={i} 
            src={photo} 
            alt={`View of ${destination}`}
            style={{ height: '140px', minWidth: '200px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}
