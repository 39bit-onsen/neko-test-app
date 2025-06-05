import React, { useState } from 'react';
import { FoodData } from '../../types';

interface FoodFormProps {
  data: Partial<FoodData>;
  onChange: (data: Partial<FoodData>) => void;
}

const FoodForm: React.FC<FoodFormProps> = ({ data, onChange }) => {
  const [customFoodType, setCustomFoodType] = useState('');

  const commonFoodTypes = [
    'ドライフード',
    'ウェットフード',
    'おやつ',
    'ちゅーる',
    '手作りごはん',
    'カスタム'
  ];

  const appetiteOptions = [
    { value: 'excellent', label: 'とても良い', emoji: '😋' },
    { value: 'good', label: '良い', emoji: '😊' },
    { value: 'fair', label: '普通', emoji: '😐' },
    { value: 'poor', label: '悪い', emoji: '😞' },
    { value: 'none', label: '食べない', emoji: '😿' }
  ];

  const handleFoodTypeChange = (type: string) => {
    if (type === 'カスタム') {
      onChange({ ...data, foodType: customFoodType });
    } else {
      onChange({ ...data, foodType: type });
      setCustomFoodType('');
    }
  };

  return (
    <div className="food-form">
      <div className="form-row">
        <div className="form-group">
          <label>時間</label>
          <input
            type="time"
            value={data.time || ''}
            onChange={(e) => onChange({ ...data, time: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>食べ具合</label>
          <div className="appetite-options">
            {appetiteOptions.map(option => (
              <button
                key={option.value}
                type="button"
                className={`appetite-btn ${data.appetite === option.value ? 'selected' : ''}`}
                onClick={() => onChange({ ...data, appetite: option.value as any })}
              >
                <span className="appetite-emoji">{option.emoji}</span>
                <span className="appetite-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>フードの種類</label>
          <div className="food-type-options">
            {commonFoodTypes.map(type => (
              <button
                key={type}
                type="button"
                className={`food-type-btn ${data.foodType === type || (type === 'カスタム' && !commonFoodTypes.slice(0, -1).includes(data.foodType || '')) ? 'selected' : ''}`}
                onClick={() => handleFoodTypeChange(type)}
              >
                {type}
              </button>
            ))}
          </div>
          {(data.foodType === 'カスタム' || !commonFoodTypes.slice(0, -1).includes(data.foodType || '')) && (
            <input
              type="text"
              placeholder="フードの種類を入力"
              value={data.foodType && !commonFoodTypes.slice(0, -1).includes(data.foodType) ? data.foodType : customFoodType}
              onChange={(e) => {
                setCustomFoodType(e.target.value);
                onChange({ ...data, foodType: e.target.value });
              }}
              className="custom-food-input"
            />
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>量</label>
          <div className="amount-input">
            <input
              type="number"
              min="0"
              step="0.1"
              value={data.amount || ''}
              onChange={(e) => onChange({ ...data, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
            <select
              value={data.amountUnit || 'g'}
              onChange={(e) => onChange({ ...data, amountUnit: e.target.value as any })}
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="pieces">個</option>
            </select>
          </div>
        </div>
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={data.finished || false}
              onChange={(e) => onChange({ ...data, finished: e.target.checked })}
            />
            <span className="checkmark"></span>
            完食した
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>メモ</label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          placeholder="食事に関する特記事項があれば記入してください..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default FoodForm;