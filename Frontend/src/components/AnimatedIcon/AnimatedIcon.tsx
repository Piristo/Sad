import React from 'react';

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
            />
          ))}
        </g>
        <style jsx>{`
          .animated-sun {
            color: #FFD700;
            animation: rotate 20s linear infinite;
          }
          .sun-core {
            animation: pulse 2s ease-in-out infinite;
          }
          .sun-ray {
            animation: ray-pulse 3s ease-in-out infinite;
            animation-delay: calc(var(--i) * 0.1s);
          }
          .sun-rays {
            --i: 0;
          }
          .sun-rays line:nth-child(1) { --i: 0; }
          .sun-rays line:nth-child(2) { --i: 1; }
          .sun-rays line:nth-child(3) { --i: 2; }
          .sun-rays line:nth-child(4) { --i: 3; }
          .sun-rays line:nth-child(5) { --i: 4; }
          .sun-rays line:nth-child(6) { --i: 5; }
          .sun-rays line:nth-child(7) { --i: 6; }
          .sun-rays line:nth-child(8) { --i: 7; }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
          
          @keyframes ray-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}</style>
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
        <style jsx>{`
          .animated-cloud {
            color: #87CEEB;
            animation: float 3s ease-in-out infinite;
          }
          .cloud-body {
            animation: cloud-morph 4s ease-in-out infinite;
          }
          .particle {
            animation: particle-float 2s ease-in-out infinite;
            opacity: 0;
          }
          .particle:nth-child(1) { animation-delay: 0s; }
          .particle:nth-child(2) { animation-delay: 0.7s; }
          .particle:nth-child(3) { animation-delay: 1.4s; }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
          
          @keyframes cloud-morph {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes particle-float {
            0% { opacity: 0; transform: translateY(0px); }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; transform: translateY(-10px); }
          }
        `}</style>
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
            />
          ))}
        </g>
        <style jsx>{`
          .animated-rain {
            color: #4682B4;
            animation: rain-shake 0.5s ease-in-out infinite;
          }
          .rain-drop {
            animation: rain-fall 1s linear infinite;
            animation-delay: calc(var(--i) * 0.2s);
          }
          .rain-drops line:nth-child(1) { --i: 0; }
          .rain-drops line:nth-child(2) { --i: 1; }
          .rain-drops line:nth-child(3) { --i: 2; }
          .rain-drops line:nth-child(4) { --i: 3; }
          .rain-drops line:nth-child(5) { --i: 4; }
          
          @keyframes rain-shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-1px); }
            75% { transform: translateX(1px); }
          }
          
          @keyframes rain-fall {
            0% { opacity: 1; transform: translateY(-5px); }
            100% { opacity: 0; transform: translateY(10px); }
          }
        `}</style>
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
        <style jsx>{`
          .animated-plant {
            color: #4CAF50;
            animation: plant-sway 4s ease-in-out infinite;
          }
          .plant-leaf {
            animation: leaf-glow 3s ease-in-out infinite;
          }
          .plant-stem {
            animation: stem-flex 4s ease-in-out infinite;
          }
          .particle {
            animation: particle-sparkle 2s ease-in-out infinite;
            opacity: 0;
          }
          .particle:nth-child(1) { animation-delay: 0s; }
          .particle:nth-child(2) { animation-delay: 1s; }
          .particle:nth-child(3) { animation-delay: 2s; }
          
          @keyframes plant-sway {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-2deg); }
            75% { transform: rotate(2deg); }
          }
          
          @keyframes leaf-glow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          
          @keyframes stem-flex {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.02); }
          }
          
          @keyframes particle-sparkle {
            0% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0); }
          }
        `}</style>
      </svg>
    ),
    water: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animated-water">
        <path d="M12 2C12 2 6 8 6 12C6 16 12 22 12 22C12 22 18 16 18 12C18 8 12 2 12 2Z" fill="currentColor" className="water-drop"/>
        <g className="water-waves">
          <path d="M8 12C8 12 9 11 10 12C11 13 12 12 13 12C14 12 15 13 16 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="wave"/>
          <path d="M7 14C7 14 8 13 9 14C10 15 11 14 12 14C13 14 14 15 15 14C16 14 17 13 18 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="wave"/>
        </g>
        <style jsx>{`
          .animated-water {
            color: #00BCD4;
            animation: water-bounce 2s ease-in-out infinite;
          }
          .water-drop {
            animation: drop-shimmer 3s ease-in-out infinite;
          }
          .wave {
            animation: wave-motion 2s ease-in-out infinite;
          }
          .wave:nth-child(1) { animation-delay: 0s; }
          .wave:nth-child(2) { animation-delay: 0.5s; }
          
          @keyframes water-bounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-2px); }
          }
          
          @keyframes drop-shimmer {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.9; }
          }
          
          @keyframes wave-motion {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(2px); }
          }
        `}</style>
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
            />
          ))}
        </g>
        <style jsx>{`
          .animated-success {
            color: #4CAF50;
            animation: success-burst 0.6s ease-out;
          }
          .success-circle {
            animation: circle-pop 0.5s ease-out;
          }
          .success-check {
            animation: check-draw 0.4s ease-out 0.2s both;
          }
          .particle {
            animation: particle-burst 0.8s ease-out;
            animation-delay: calc(var(--i) * 0.05s);
            opacity: 0;
          }
          .success-particles circle:nth-child(1) { --i: 0; }
          .success-particles circle:nth-child(2) { --i: 1; }
          .success-particles circle:nth-child(3) { --i: 2; }
          .success-particles circle:nth-child(4) { --i: 3; }
          .success-particles circle:nth-child(5) { --i: 4; }
          .success-particles circle:nth-child(6) { --i: 5; }
          .success-particles circle:nth-child(7) { --i: 6; }
          .success-particles circle:nth-child(8) { --i: 7; }
          
          @keyframes success-burst {
            0% { transform: scale(0); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          @keyframes circle-pop {
            0% { transform: scale(0); }
            100% { transform: scale(1); }
          }
          
          @keyframes check-draw {
            0% { stroke-dasharray: 0 20; }
            100% { stroke-dasharray: 20 20; }
          }
          
          @keyframes particle-burst {
            0% { opacity: 1; transform: translate(0, 0) scale(1); }
            100% { opacity: 0; transform: translate(calc(var(--i) * 3px - 12px), -20px) scale(0); }
          }
        `}</style>
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
        <style jsx>{`
          .animated-leaf {
            color: #66BB6A;
            animation: leaf-rustle 3s ease-in-out infinite;
          }
          .leaf-body {
            animation: leaf-glow 2s ease-in-out infinite;
          }
          .leaf-vein {
            animation: vein-pulse 4s ease-in-out infinite;
          }
          .sparkle {
            animation: sparkle-twinkle 1.5s ease-in-out infinite;
            opacity: 0;
          }
          .sparkle:nth-child(1) { animation-delay: 0s; }
          .sparkle:nth-child(2) { animation-delay: 0.5s; }
          .sparkle:nth-child(3) { animation-delay: 1s; }
          
          @keyframes leaf-rustle {
            0%, 100% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(-1deg) scale(1.02); }
            75% { transform: rotate(1deg) scale(0.98); }
          }
          
          @keyframes leaf-glow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.9; }
          }
          
          @keyframes vein-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          
          @keyframes sparkle-twinkle {
            0% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0); }
          }
        `}</style>
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
        <style jsx>{`
          .animated-flower {
            color: #E91E63;
            animation: flower-bloom 4s ease-in-out infinite;
          }
          .petal {
            animation: petal-wave 3s ease-in-out infinite;
            animation-delay: calc(var(--i) * 0.1s);
            transform-origin: 12px 12px;
          }
          .flower-petals ellipse:nth-child(1) { --i: 0; }
          .flower-petals ellipse:nth-child(2) { --i: 1; }
          .flower-petals ellipse:nth-child(3) { --i: 2; }
          .flower-petals ellipse:nth-child(4) { --i: 3; }
          .flower-petals ellipse:nth-child(5) { --i: 4; }
          .flower-petals ellipse:nth-child(6) { --i: 5; }
          .flower-petals ellipse:nth-child(7) { --i: 6; }
          .flower-petals ellipse:nth-child(8) { --i: 7; }
          .flower-center {
            animation: center-glow 2s ease-in-out infinite;
          }
          .flower-stem {
            animation: stem-sway 4s ease-in-out infinite;
          }
          .particle {
            animation: particle-float 2s ease-in-out infinite;
            opacity: 0;
          }
          .particle:nth-child(1) { animation-delay: 0s; }
          .particle:nth-child(2) { animation-delay: 0.7s; }
          .particle:nth-child(3) { animation-delay: 1.4s; }
          
          @keyframes flower-bloom {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.05) rotate(5deg); }
          }
          
          @keyframes petal-wave {
            0%, 100% { transform: rotate(calc(var(--i) * 45deg)) scale(1); }
            50% { transform: rotate(calc(var(--i) * 45deg)) scale(1.1); }
          }
          
          @keyframes center-glow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          
          @keyframes stem-sway {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-2deg); }
            75% { transform: rotate(2deg); }
          }
          
          @keyframes particle-float {
            0% { opacity: 0; transform: translateY(0px); }
            50% { opacity: 1; transform: translateY(-5px); }
            100% { opacity: 0; transform: translateY(-10px); }
          }
        `}</style>
      </svg>
    )
  };

  return (
    <div className={`animated-icon ${className}`} style={{ width: size, height: size }}>
      {icons[name]}
    </div>
  );
};