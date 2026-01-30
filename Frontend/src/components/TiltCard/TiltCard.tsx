import React, { useRef, useEffect } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({ 
  children, 
  className = '', 
  maxRotation = 15 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -maxRotation;
      const rotateY = ((x - centerX) / centerX) * maxRotation;
      
      card.style.setProperty('--rotateX', `${rotateX}deg`);
      card.style.setProperty('--rotateY', `${rotateY}deg`);
    };

    const handleMouseLeave = () => {
      card.style.setProperty('--rotateX', '0deg');
      card.style.setProperty('--rotateY', '0deg');
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      
      // Gamma: Left/Right tilt
      // Beta: Front/Back tilt (subtract 45deg for holding position)
      const rotateY = Math.min(Math.max(e.gamma / 2, -maxRotation), maxRotation);
      const rotateX = Math.min(Math.max((e.beta - 45) / 2, -maxRotation), maxRotation);
      
      requestAnimationFrame(() => {
        card.style.setProperty('--rotateX', `${-rotateX}deg`);
        card.style.setProperty('--rotateY', `${rotateY}deg`);
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    // Add gyroscope support for mobile
    if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [maxRotation]);

  return (
    <div 
      ref={cardRef} 
      className={`tilt-card ${className}`}
    >
      <div className="tilt-card-inner">
        {children}
      </div>
    </div>
  );
};