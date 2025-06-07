import React from 'react';
import { EntryType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import './EntryTypeSelector.css';

interface EntryTypeSelectorProps {
  selectedType: EntryType;
  onTypeChange: (type: EntryType) => void;
}

const EntryTypeSelector: React.FC<EntryTypeSelectorProps> = ({
  selectedType,
  onTypeChange
}) => {
  const { t } = useLanguage();
  
  const entryTypes = [
    { 
      type: 'food' as EntryType, 
      label: t('forms.entryTypes.food.label'), 
      icon: '🍽️',
      description: t('forms.entryTypes.food.description')
    },
    { 
      type: 'health' as EntryType, 
      label: t('forms.entryTypes.health.label'), 
      icon: '💊',
      description: t('forms.entryTypes.health.description')
    },
    { 
      type: 'behavior' as EntryType, 
      label: t('forms.entryTypes.behavior.label'), 
      icon: '🎾',
      description: t('forms.entryTypes.behavior.description')
    },
    { 
      type: 'free' as EntryType, 
      label: t('forms.entryTypes.free.label'), 
      icon: '📝',
      description: t('forms.entryTypes.free.description')
    }
  ];
  return (
    <div className="entry-type-selector">
      <h3>{t('forms.selectEntryType')}</h3>
      <div className="type-options">
        {entryTypes.map(({ type, label, icon, description }) => (
          <button
            key={type}
            className={`type-option ${selectedType === type ? 'selected' : ''}`}
            onClick={() => onTypeChange(type)}
          >
            <div className="type-icon">{icon}</div>
            <div className="type-label">{label}</div>
            <div className="type-description">{description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EntryTypeSelector;