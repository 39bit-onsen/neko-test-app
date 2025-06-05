import React, { useState } from 'react';
import { BehaviorData } from '../../types';

interface BehaviorFormProps {
  data: Partial<BehaviorData>;
  onChange: (data: Partial<BehaviorData>) => void;
}

const BehaviorForm: React.FC<BehaviorFormProps> = ({ data, onChange }) => {
  const [newBehavior, setNewBehavior] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const activityLevels = [
    { value: 'very_active', label: 'とても活発', emoji: '🏃‍♂️' },
    { value: 'active', label: '活発', emoji: '🚶‍♂️' },
    { value: 'normal', label: '普通', emoji: '😊' },
    { value: 'calm', label: '落ち着いている', emoji: '😌' },
    { value: 'lethargic', label: '元気がない', emoji: '😴' }
  ];

  const commonBehaviors = [
    'よく鳴く',
    'いつもより甘える',
    '隠れている',
    'グルーミングが多い',
    'グルーミングが少ない',
    '爪とぎ',
    'マーキング',
    '噛む・引っかく',
    '毛玉を吐く',
    '獲物遊び',
    '窓を見つめる',
    'パトロール'
  ];

  const commonLocations = [
    'リビング',
    'キッチン',
    '寝室',
    'トイレ',
    '窓際',
    'ベッド',
    'ソファ',
    'キャットタワー',
    'クローゼット',
    'お風呂場',
    '玄関',
    'ベランダ'
  ];

  const addBehavior = (behavior: string) => {
    const currentBehaviors = data.specialBehaviors || [];
    if (!currentBehaviors.includes(behavior)) {
      onChange({
        ...data,
        specialBehaviors: [...currentBehaviors, behavior]
      });
    }
  };

  const removeBehavior = (behavior: string) => {
    const currentBehaviors = data.specialBehaviors || [];
    onChange({
      ...data,
      specialBehaviors: currentBehaviors.filter(b => b !== behavior)
    });
  };

  const addCustomBehavior = () => {
    if (newBehavior.trim()) {
      addBehavior(newBehavior.trim());
      setNewBehavior('');
    }
  };

  const addLocation = (location: string) => {
    const currentLocations = data.location || [];
    if (!currentLocations.includes(location)) {
      onChange({
        ...data,
        location: [...currentLocations, location]
      });
    }
  };

  const removeLocation = (location: string) => {
    const currentLocations = data.location || [];
    onChange({
      ...data,
      location: currentLocations.filter(l => l !== location)
    });
  };

  const addCustomLocation = () => {
    if (newLocation.trim()) {
      addLocation(newLocation.trim());
      setNewLocation('');
    }
  };

  return (
    <div className="behavior-form">
      <div className="form-group">
        <label>活動レベル</label>
        <div className="activity-options">
          {activityLevels.map(level => (
            <button
              key={level.value}
              type="button"
              className={`activity-btn ${data.activityLevel === level.value ? 'selected' : ''}`}
              onClick={() => onChange({ ...data, activityLevel: level.value as any })}
            >
              <span className="activity-emoji">{level.emoji}</span>
              <span className="activity-label">{level.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>睡眠時間 (時間)</label>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={data.sleepHours || ''}
            onChange={(e) => onChange({ ...data, sleepHours: parseFloat(e.target.value) || undefined })}
            placeholder="例: 12"
          />
        </div>
        <div className="form-group">
          <label>遊び時間 (分)</label>
          <input
            type="number"
            min="0"
            value={data.playTime || ''}
            onChange={(e) => onChange({ ...data, playTime: parseInt(e.target.value) || undefined })}
            placeholder="例: 30"
          />
        </div>
        <div className="form-group">
          <label>トイレ使用回数</label>
          <input
            type="number"
            min="0"
            value={data.litterBoxUses || ''}
            onChange={(e) => onChange({ ...data, litterBoxUses: parseInt(e.target.value) || undefined })}
            placeholder="例: 3"
          />
        </div>
      </div>

      <div className="form-group">
        <label>特別な行動</label>
        <div className="behaviors-section">
          <div className="common-behaviors">
            {commonBehaviors.map(behavior => (
              <button
                key={behavior}
                type="button"
                className={`behavior-btn ${(data.specialBehaviors || []).includes(behavior) ? 'selected' : ''}`}
                onClick={() => 
                  (data.specialBehaviors || []).includes(behavior) 
                    ? removeBehavior(behavior) 
                    : addBehavior(behavior)
                }
              >
                {behavior}
              </button>
            ))}
          </div>
          <div className="custom-behavior-input">
            <input
              type="text"
              value={newBehavior}
              onChange={(e) => setNewBehavior(e.target.value)}
              placeholder="その他の行動を追加"
              onKeyPress={(e) => e.key === 'Enter' && addCustomBehavior()}
            />
            <button type="button" onClick={addCustomBehavior}>追加</button>
          </div>
          {data.specialBehaviors && data.specialBehaviors.length > 0 && (
            <div className="selected-behaviors">
              <strong>記録された行動:</strong>
              <div className="behavior-tags">
                {data.specialBehaviors.map(behavior => (
                  <span key={behavior} className="behavior-tag">
                    {behavior}
                    <button type="button" onClick={() => removeBehavior(behavior)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>よくいる場所</label>
        <div className="locations-section">
          <div className="common-locations">
            {commonLocations.map(location => (
              <button
                key={location}
                type="button"
                className={`location-btn ${(data.location || []).includes(location) ? 'selected' : ''}`}
                onClick={() => 
                  (data.location || []).includes(location) 
                    ? removeLocation(location) 
                    : addLocation(location)
                }
              >
                {location}
              </button>
            ))}
          </div>
          <div className="custom-location-input">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="その他の場所を追加"
              onKeyPress={(e) => e.key === 'Enter' && addCustomLocation()}
            />
            <button type="button" onClick={addCustomLocation}>追加</button>
          </div>
          {data.location && data.location.length > 0 && (
            <div className="selected-locations">
              <strong>よくいる場所:</strong>
              <div className="location-tags">
                {data.location.map(location => (
                  <span key={location} className="location-tag">
                    {location}
                    <button type="button" onClick={() => removeLocation(location)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>その他のメモ</label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          placeholder="行動に関する特記事項があれば記入してください..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default BehaviorForm;