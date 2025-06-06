import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
      onClick={toggleDarkMode}
      title={isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
    >
      <div className="theme-toggle-icon">
        {isDarkMode ? (
          <span className="sun-icon">☀️</span>
        ) : (
          <span className="moon-icon">🌙</span>
        )}
      </div>
      <span className="theme-toggle-text">
        {isDarkMode ? 'ライト' : 'ダーク'}
      </span>
    </button>
  );
};

export default ThemeToggle;