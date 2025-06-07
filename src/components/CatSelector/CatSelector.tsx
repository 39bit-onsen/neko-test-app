import React, { useState, useRef, useEffect } from 'react';
import { useMultiCat } from '../../contexts/MultiCatContext';
import './CatSelector.css';

interface CatSelectorProps {
  compact?: boolean;
  showManageLink?: boolean;
  showStats?: boolean;
  onManageClick?: () => void;
}

const CatSelector: React.FC<CatSelectorProps> = ({ 
  compact = false, 
  showManageLink = true,
  showStats = false,
  onManageClick
}) => {
  const { 
    cats, 
    activeCat, 
    setActiveCat, 
    getActiveCats 
  } = useMultiCat();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCats = getActiveCats();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCatSelect = (catId: string) => {
    setActiveCat(catId);
    setIsOpen(false);
  };

  if (cats.length === 0) {
    return (
      <div className="cat-selector no-cats">
        <div className="no-cats-message">
          <span className="cat-icon">🐱</span>
          <span>猫が登録されていません</span>
        </div>
        {onManageClick && (
          <button 
            className="add-first-cat-btn"
            onClick={onManageClick}
          >
            + 最初の猫を登録
          </button>
        )}
      </div>
    );
  }

  if (cats.length === 1 && !showManageLink) {
    return (
      <div className="cat-selector single-cat">
        <div className="selected-cat">
          <div className="cat-avatar">
            {activeCat?.profilePhoto ? (
              <img src={activeCat.profilePhoto} alt={activeCat.name} />
            ) : (
              <span className="cat-icon">🐱</span>
            )}
          </div>
          <span className="cat-name">{activeCat?.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`cat-selector ${compact ? 'compact' : ''}`} ref={dropdownRef}>
      <button 
        className="selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="selected-cat">
          <div className="cat-avatar">
            {activeCat?.profilePhoto ? (
              <img src={activeCat.profilePhoto} alt={activeCat.name} />
            ) : (
              <span className="cat-icon">🐱</span>
            )}
          </div>
          {!compact && (
            <div className="cat-info">
              <span className="cat-name">{activeCat?.name || '猫を選択'}</span>
              {cats.length > 1 && (
                <span className="cat-count">{cats.length}匹中</span>
              )}
            </div>
          )}
        </div>
        <span className="dropdown-arrow">⌄</span>
      </button>

      {isOpen && (
        <div className="selector-dropdown">
          <div className="dropdown-header">
            <h4>猫を選択</h4>
            {activeCats.length > 1 && (
              <span className="active-count">{activeCats.length}匹がアクティブ</span>
            )}
          </div>

          <div className="cats-list">
            {activeCats.map(cat => (
              <button
                key={cat.id}
                className={`cat-option ${activeCat?.id === cat.id ? 'selected' : ''}`}
                onClick={() => handleCatSelect(cat.id)}
              >
                <div className="cat-avatar">
                  {cat.profilePhoto ? (
                    <img src={cat.profilePhoto} alt={cat.name} />
                  ) : (
                    <span className="cat-icon">🐱</span>
                  )}
                </div>
                <div className="cat-details">
                  <span className="cat-name">{cat.name}</span>
                  <div className="cat-meta">
                    {cat.breed && <span className="breed">{cat.breed}</span>}
                    {cat.birthDate && (
                      <span className="age">
                        {calculateAge(cat.birthDate)}
                      </span>
                    )}
                    {showStats && activeCat?.id === cat.id && (
                      <span className="cat-status">アクティブ</span>
                    )}
                  </div>
                </div>
                {activeCat?.id === cat.id && (
                  <span className="selected-indicator">✓</span>
                )}
              </button>
            ))}
          </div>

          {showManageLink && (
            <div className="dropdown-footer">
              <button 
                className="manage-link"
                onClick={() => {
                  setIsOpen(false);
                  if (onManageClick) {
                    onManageClick();
                  }
                }}
              >
                + 猫の管理
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const calculateAge = (birthDate: Date) => {
  const today = new Date();
  const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                 (today.getMonth() - birthDate.getMonth());
  
  if (months < 12) {
    return `${months}ヶ月`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}歳${remainingMonths}ヶ月` : `${years}歳`;
  }
};

export default CatSelector;