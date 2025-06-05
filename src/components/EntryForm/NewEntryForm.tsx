import React, { useState, useEffect } from 'react';
import { DiaryEntry, EntryType, EntryData, Mood, FoodData, HealthData, BehaviorData, FreeData } from '../../types';
import { storageManager } from '../../utils/storage';
import EntryTypeSelector from './EntryTypeSelector';
import FoodForm from './FoodForm';
import HealthForm from './HealthForm';
import BehaviorForm from './BehaviorForm';
import FreeForm from './FreeForm';
import './EntryForm.css';

interface NewEntryFormProps {
  onSave: (entry: DiaryEntry) => void;
  onCancel: () => void;
}

const NewEntryForm: React.FC<NewEntryFormProps> = ({ onSave, onCancel }) => {
  const [entryType, setEntryType] = useState<EntryType>('free');
  const [mood, setMood] = useState<Mood>('😸');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryData, setEntryData] = useState<Partial<EntryData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moods: Mood[] = ['😸', '😻', '😿', '😾', '🙀', '😺', '😹', '😼'];

  useEffect(() => {
    setEntryData({});
  }, [entryType]);

  const handleTypeChange = (type: EntryType) => {
    setEntryType(type);
  };

  const handleDataChange = (data: Partial<EntryData>) => {
    setEntryData(data);
  };

  const validateEntry = (): boolean => {
    switch (entryType) {
      case 'food':
        const foodData = entryData as Partial<FoodData>;
        return !!(foodData.foodType && foodData.appetite);
      case 'health':
        const healthData = entryData as Partial<HealthData>;
        return !!(healthData.weight || healthData.temperature || (healthData.symptoms && healthData.symptoms.length > 0));
      case 'behavior':
        const behaviorData = entryData as Partial<BehaviorData>;
        return !!behaviorData.activityLevel;
      case 'free':
        const freeData = entryData as Partial<FreeData>;
        return !!(freeData.title && freeData.content);
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateEntry()) {
      alert('必須項目を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const entry: DiaryEntry = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: entryType,
        date: new Date(date),
        data: entryData as EntryData,
        media: [],
        mood,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await storageManager.saveEntry(entry);
      onSave(entry);
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormContent = () => {
    switch (entryType) {
      case 'food':
        return (
          <FoodForm
            data={entryData as Partial<FoodData>}
            onChange={handleDataChange}
          />
        );
      case 'health':
        return (
          <HealthForm
            data={entryData as Partial<HealthData>}
            onChange={handleDataChange}
          />
        );
      case 'behavior':
        return (
          <BehaviorForm
            data={entryData as Partial<BehaviorData>}
            onChange={handleDataChange}
          />
        );
      case 'free':
        return (
          <FreeForm
            data={entryData as Partial<FreeData>}
            onChange={handleDataChange}
          />
        );
      default:
        return null;
    }
  };

  const getFormTitle = () => {
    switch (entryType) {
      case 'food':
        return '🍽️ 食事記録';
      case 'health':
        return '💊 健康記録';
      case 'behavior':
        return '🎾 行動記録';
      case 'free':
        return '📝 自由記録';
      default:
        return '新しい記録';
    }
  };

  return (
    <div className="entry-form">
      <div className="form-header">
        <h2>{getFormTitle()}</h2>
        <div className="header-controls">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <EntryTypeSelector
        selectedType={entryType}
        onTypeChange={handleTypeChange}
      />

      {renderFormContent()}

      <div className="form-group">
        <label>今日の猫の気分</label>
        <div className="mood-selector">
          <div className="mood-options">
            {moods.map(moodOption => (
              <button
                key={moodOption}
                type="button"
                className={`mood-btn ${mood === moodOption ? 'selected' : ''}`}
                onClick={() => setMood(moodOption)}
              >
                {moodOption}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          className="save-btn"
          onClick={handleSubmit}
          disabled={isSubmitting || !validateEntry()}
        >
          {isSubmitting ? '保存中...' : '保存'}
        </button>
        <button
          className="cancel-btn"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          キャンセル
        </button>
      </div>
    </div>
  );
};

export default NewEntryForm;