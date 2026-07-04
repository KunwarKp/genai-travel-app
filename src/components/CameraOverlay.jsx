import React, { useRef, useEffect, useState } from 'react';

/**
 * CameraOverlay - Captures live webcam feed to simulate AR background.
 * Automatically falls back to a dark background if the camera is denied.
 * 
 * @returns {JSX.Element} The video background component
 */
export default function CameraOverlay() {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        // Request the environment-facing camera (rear camera on mobile)
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied or unavailable", err);
        setError("Camera unavailable. Using fallback background.");
      }
    };

    startCamera();

    return () => {
      // Cleanup tracks on unmount to save battery and release camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div 
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -2, backgroundColor: '#0a0a0f' }}
      role="presentation"
    >
      {!error ? (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          aria-label="Live AR Camera Background"
        />
      ) : (
        <div 
          style={{ width: '100%', height: '100%', backgroundImage: 'url(https://images.unsplash.com/photo-1596423735880-5f2a689b903e?q=80&w=2070)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4 }}
          aria-label="Fallback Destination Background"
        />
      )}
    </div>
  );
}
