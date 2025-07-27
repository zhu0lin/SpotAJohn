import React from 'react';
import '../styles/components/LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'blue', 
  className = '',
  text = '',
  fullScreen = false 
}) => {
  // Build CSS classes
  const spinnerClasses = [
    'loading-spinner',
    `loading-spinner--${size}`,
    color !== 'blue' ? `loading-spinner--${color}` : '',
    className
  ].filter(Boolean).join(' ');

  const spinner = (
    <div 
      className={spinnerClasses}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="loading-spinner-overlay">
        <div className="loading-spinner-modal">
          {spinner}
          {text && <p className="loading-spinner-modal-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-spinner-container">
      {spinner}
      {text && <span className="loading-spinner-text">{text}</span>}
    </div>
  );
};

export default LoadingSpinner; 