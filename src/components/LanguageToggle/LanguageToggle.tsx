import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './LanguageToggle.css';

const LanguageToggle: React.FC = () => {
  const { currentLanguage, changeLanguage, supportedLanguages, getCurrentLanguage } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = getCurrentLanguage();

  // ドロップダウン外のクリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    changeLanguage(languageCode);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="language-toggle" ref={dropdownRef}>
      <button
        className="language-button"
        onClick={toggleDropdown}
        aria-label="Select language"
        aria-expanded={isDropdownOpen}
        aria-haspopup="listbox"
      >
        <span className="flag">{currentLang.flag}</span>
        <span className="language-name">{currentLang.nativeName}</span>
        <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
          ▼
        </span>
      </button>

      {isDropdownOpen && (
        <div className="language-dropdown" role="listbox">
          {supportedLanguages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${language.code === currentLanguage ? 'active' : ''}`}
              onClick={() => handleLanguageSelect(language.code)}
              role="option"
              aria-selected={language.code === currentLanguage}
            >
              <span className="flag">{language.flag}</span>
              <span className="language-info">
                <span className="native-name">{language.nativeName}</span>
                <span className="english-name">{language.name}</span>
              </span>
              {language.code === currentLanguage && (
                <span className="check-mark">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;