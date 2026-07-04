import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Volume2, VolumeX, MapPin } from 'lucide-react';
import GlassPanel from './GlassPanel';
import { playAudio, stopAudio } from '../utils/speechApi';
import ReactMarkdown from 'react-markdown';

// Custom List Item Component that acts as an intersection observer
function PlaceCard({ node, onFocusPlace, children, ...props }) {
  const cardRef = useRef(null);
  const [placeName, setPlaceName] = useState(null);

  useEffect(() => {
    // Extract the place name from the child nodes if there's a link
    let extractedName = null;
    React.Children.forEach(children, child => {
      if (child && child.props && child.props.href && child.props.href.includes('google.com/maps')) {
        extractedName = child.props.children?.[0];
      }
    });

    if (extractedName && typeof extractedName === 'string') {
      setPlaceName(extractedName);
    }
  }, [children]);

  useEffect(() => {
    if (!placeName || !cardRef.current || !onFocusPlace) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onFocusPlace(placeName);
        }
      },
      { threshold: 0.8 } // Trigger when 80% of the card is visible
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [placeName, onFocusPlace]);

  return (
    <li ref={cardRef} {...props} style={{ 
      marginBottom: '16px', 
      padding: '16px', 
      background: 'rgba(255, 255, 255, 0.05)', 
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.1)',
      listStyle: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      transition: 'transform 0.3s ease, background 0.3s ease',
      backdropFilter: 'blur(10px)'
    }}>
      {children}
    </li>
  );
}

/**
 * StoryGuide - Displays the AI-generated story and handles audio playback.
 * 
 * @param {Object} props
 * @param {string} props.destination - The name of the location
 * @param {string} props.story - Markdown formatted story
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.error - Error message if any
 * @param {Function} props.onDeepDive - Callback for deep dive links
 * @param {Function} props.onFocusPlace - Callback when a place is hovered
 * @param {Object} props.language - Language object with ttsCode
 * @returns {JSX.Element}
 */
export default function StoryGuide({ destination, story, isLoading, error, onDeepDive, onFocusPlace, language }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const contentRef = useRef(null);

  // Extract raw text for audio playback (stripping markdown)
  const rawText = story ? story.replace(/[#*`]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') : '';

  // Automatically stop audio if the story changes
  useEffect(() => {
    stopAudio();
    setIsPlaying(false);
  }, [story]);

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      if (story) {
        const ttsCode = language?.ttsCode || 'en-US';
        playAudio(rawText, ttsCode, () => setIsPlaying(false));
        setIsPlaying(true);
      }
    }
  };

  if (!destination) {
    return null; // Empty state handled by parent
  }

  return (
    <GlassPanel 
      style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '55vh', overflowY: 'auto' }}
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
        <MapPin size={24} color="var(--accent-primary)" />
        <h2 className="story-heading" style={{ margin: 0 }}>Discover {destination}</h2>
      </div>

      <div style={{ flexShrink: 0, minHeight: '100px' }}>
        {isLoading && (
          <div className="skeleton-loader" aria-label="Loading story" role="status">
            <div className="skeleton-line" style={{ width: '90%' }}></div>
            <div className="skeleton-line" style={{ width: '85%' }}></div>
            <div className="skeleton-line" style={{ width: '95%' }}></div>
            <div className="skeleton-line" style={{ width: '60%' }}></div>
          </div>
        )}
        
        {error && (
          <p style={{ color: 'var(--accent-secondary)' }} role="alert">{error}</p>
        )}

        {!isLoading && !error && story && (
          <div className="story-text markdown-content" style={{ lineHeight: '1.6', fontSize: '1.05rem' }}>
            <ReactMarkdown
              components={{
                a: ({node, ...props}) => {
                  const href = props.href || '';
                  const text = props.children?.[0] || '';
                  const isDeepDive = href.startsWith('story://') || href.includes('deep-dive') || (typeof text === 'string' && text.toLowerCase().includes('hear'));
                  
                  if (isDeepDive) {
                    let topic = href;
                    if (href.startsWith('story://')) topic = href.replace('story://', '');
                    else if (href.includes('deep-dive-')) topic = href.split('deep-dive-')[1];
                    else topic = text; // fallback to link text
                    
                    topic = decodeURIComponent(topic.replace(/\+/g, ' '));
                    
                    return (
                      <button 
                        onClick={(e) => { e.preventDefault(); if (onDeepDive) onDeepDive(topic); }}
                        className="glass-button"
                        style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--accent-primary)', color: '#000', border: 'none', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', cursor: 'pointer', marginLeft: '8px', fontWeight: 'bold', textDecoration: 'none' }}
                      >
                        ✨ Hear Full Story
                      </button>
                    );
                  }
                  return <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline', fontWeight: '600' }} />
                },
                p: ({node, ...props}) => <p {...props} style={{ marginBottom: '12px' }} />,
                ul: ({node, ...props}) => <ul {...props} style={{ paddingLeft: '0', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }} />,
                ol: ({node, ...props}) => <ol {...props} style={{ paddingLeft: '0', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }} />,
                li: ({node, children, ...props}) => <PlaceCard onFocusPlace={onFocusPlace} node={node} children={children} {...props} />
              }}
            >
              {story}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {!isLoading && !error && story && (
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', marginTop: '16px', paddingBottom: '8px' }}>
          <button 
            className={`glass-button ${isPlaying ? 'playing-indicator' : ''}`}
            onClick={toggleAudio}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1rem' }}
            aria-label={isPlaying ? "Stop audio guide" : "Listen to audio guide"}
          >
            {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
            {isPlaying ? 'Stop Listening' : 'Listen to Guide'}
          </button>
        </div>
      )}
    </GlassPanel>
  );
}

StoryGuide.propTypes = {
  destination: PropTypes.string,
  story: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string
};
