import React from 'react';
import { EntryType } from '../../types';
import './EntryTypeSelector.css';

interface EntryTypeSelectorProps {
  selectedType: EntryType;
  onTypeChange: (type: EntryType) => void;
}

const entryTypes = [
  { 
    type: 'food' as EntryType, 
    label: '食事記録', 
    icon: '🍽️',
    description: 'フードの種類、量、食べ具合'
  },
  { 
    type: 'health' as EntryType, 
    label: '健康記録', 
    icon: '💊',
    description: '体重、症状、薬、病院'
  },
  { 
    type: 'behavior' as EntryType, 
    label: '行動記録', 
    icon: '🎾',
    description: '活動量、睡眠、遊び、行動'
  },
  { 
    type: 'free' as EntryType, 
    label: '自由記録', 
    icon: '📝',
    description: '日記、思い出、エピソード'
  }
];

const EntryTypeSelector: React.FC<EntryTypeSelectorProps> = ({
  selectedType,
  onTypeChange
}) => {
  return (
    <div className="entry-type-selector">
      <h3>記録の種類を選んでください</h3>
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