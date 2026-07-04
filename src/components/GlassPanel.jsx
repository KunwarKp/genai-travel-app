import React from 'react';
import PropTypes from 'prop-types';

/**
 * GlassPanel - Reusable UI container implementing our Glassmorphism design system.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Panel content
 * @param {string} props.className - Optional additional classes
 * @param {Object} props.style - Optional inline styles
 * @returns {JSX.Element}
 */
export default function GlassPanel({ children, className = '', style = {} }) {
  return (
    <div 
      className={`glass-panel ${className}`} 
      style={{ padding: '24px', ...style }}
    >
      {children}
    </div>
  );
}

GlassPanel.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object
};
