import React from 'react';
import './AnimatedIcon.css';

interface AnimatedIconProps {
  name: 'sun' | 'cloud' | 'rain' | 'plant' | 'water' | 'success' | 'leaf' | 'flower';
  size?: number;
  className?: string;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({ 
  name, 
  size = 24, 
  className = '' 
}) => {
  const icons = {
    sun: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animated-sun">
        <circle cx="12" cy="12" r="5" fill="currentColor" className="sun-core"/>
        <g className="sun-rays">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line
              key={i}
              x1="12"
              y1="2"
              x2="12"
              y2="4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${angle} 12 12)`}
              className="sun-ray"
              style={{ '--i': i } as React.CSSProperties}
            />
          ))}
        </g>
      </svg>
    ),
    cloud: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animated-cloud">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="currentColor" className="cloud-body"/>
        <g className="cloud-particles">
          <circle cx="8" cy="16" r="1" fill="currentColor" className="particle"/>
          <circle cx="12" cy="18" r="1.5" fill="currentColor" className="particle"/>
          <circle cx="16" cy="16" r="1" fill="currentColor" className="particle"/>
        </g>
      </svg>
    ),
    rain: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animated-rain">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="currentColor" className="rain-cloud"/>
        <g className="rain-drops">
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={8 + i * 2}
              y1="16"
              x2={8 + i * 2}
              y2="20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="rain-drop"
              style={{ '--i': i } as React.CSSProperties}
            />
          ))}
        </g>
      </svg>
    ),
    plant: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animated-plant">
        <path d="M12 2C12 2 8 6 8 10C8 14 12 22 12 22C12 22 16 14 16 10C16 6 12 2 12 2Z" fill="currentColor" className="plant-leaf"/>
        <path d="M12 22L12 2" stroke="currentColor" strokeWidth="2" className="plant-stem"/>
        <g className="plant-particles">
          <circle cx="6" cy="8" r="0.5" fill="currentColor" className="particle"/>
          <circle cx="18" cy="12" r="0.5" fill="currentColor" className="particle"/>
          <circle cx="10" cy="16" r="0.5" fill="currentColor" className="particle"/>
        </g>
      </svg>
    ),
    water: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animated-water">
        <path d="M12 2C12 2 6 8 6 12C6 16 12 22 12 22C12 22 18 16 18 12C18 8 12 2 12 2Z" fill="currentColor" className="water-drop"/>
        <g className="water-waves">
          <path d="M8 12C8 12 9 11 10 12C11 13 12 12 13 12C14 12 15 13 16 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="wave"/>
          <path d="M7 14C7 14 8 13 9 14C10 15 11 14 12 14C13 14 14 15 15 14C16 14 17 13 18 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="wave"/>
        </g>
      </svg>
    ),
    success: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animated-success">
        <circle cx="12" cy="12" r="10" fill="currentColor" className="success-circle"/>
        <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="success-check"/>
        <g className="success-particles">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <circle
              key={i}
              cx="12"
              cy="2"
              r="1"
              fill="currentColor"
              transform={`rotate(${angle} 12 12)`}
              className="particle"
              style={{ '--i': i } as React.CSSProperties}
            />
          ))}
        </g>
      </svg>
    ),
    leaf: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animated-leaf">
        <path d="M12 2C12 2 8 6 8 10C8 14 12 22 12 22C12 22 16 14 16 10C16 6 12 2 12 2Z" fill="currentColor" className="leaf-body"/>
        <path d="M12 2V22" stroke="currentColor" strokeWidth="1" className="leaf-vein"/>
        <g className="leaf-sparkles">
          <circle cx="10" cy="8" r="0.5" fill="currentColor" className="sparkle"/>
          <circle cx="14" cy="12" r="0.5" fill="currentColor" className="sparkle"/>
          <circle cx="11" cy="16" r="0.5" fill="currentColor" className="sparkle"/>
        </g>
      </svg>
    ),
    flower: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animated-flower">
        <g className="flower-petals">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <ellipse
              key={i}
              cx="12"
              cy="8"
              rx="2"
              ry="4"
              fill="currentColor"
              transform={`rotate(${angle} 12 12)`}
              className="petal"
              style={{ '--i': i } as React.CSSProperties}
            />
          ))}
        </g>
        <circle cx="12" cy="12" r="2" fill="#FFD700" className="flower-center"/>
        <path d="M12 14L12 20" stroke="currentColor" strokeWidth="2" className="flower-stem"/>
        <g className="flower-particles">
          <circle cx="10" cy="6" r="0.5" fill="currentColor" className="particle"/>
          <circle cx="14" cy="10" r="0.5" fill="currentColor" className="particle"/>
          <circle cx="11" cy="15" r="0.5" fill="currentColor" className="particle"/>
        </g>
      </svg>
    )
  };

  return (
    <div className={`animated-icon ${className}`} style={{ width: size, height: size }}>
      {icons[name]}
    </div>
  );
};