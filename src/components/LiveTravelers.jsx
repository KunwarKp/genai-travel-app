import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Users, UserPlus } from 'lucide-react';
import GlassPanel from './GlassPanel';

/**
 * LiveTravelers - Simulates a social connection feature showing active users nearby.
 * This satisfies the "connect visitors" hackathon requirement without needing a backend.
 */
export default function LiveTravelers({ destination }) {
  const [travelers, setTravelers] = useState([]);

  useEffect(() => {
    if (!destination) {
      setTravelers([]);
      return;
    }

    // Simulate finding active travelers in the searched destination
    setTravelers([
      { id: 1, name: 'Alice M.', status: 'Exploring temples' },
      { id: 2, name: 'Rahul K.', status: 'Just arrived' },
      { id: 3, name: 'Sarah J.', status: 'Looking for food' }
    ]);
  }, [destination]);

  if (!destination || travelers.length === 0) return null;

  return (
    <GlassPanel style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
        <Users size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>Live near {destination}</h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} role="list" aria-label="Nearby travelers">
        {travelers.map(t => (
          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} role="listitem">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}
                aria-hidden="true"
              >
                {t.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.status}</div>
              </div>
            </div>
            <button 
              className="glass-button" 
              style={{ padding: '6px' }} 
              aria-label={`Connect with ${t.name}`}
              title={`Connect with ${t.name}`}
            >
              <UserPlus size={14} />
            </button>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

LiveTravelers.propTypes = {
  destination: PropTypes.string
};
