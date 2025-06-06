import React, { useState, useEffect } from 'react';
import { DiaryEntry, EntryType, EntryData, Mood, FoodData, HealthData, BehaviorData, FreeData, MediaAttachment } from '../../types';
import { storageManager } from '../../utils/storage';
import EntryTypeSelector from './EntryTypeSelector';
import FoodForm from './FoodForm';
import HealthForm from './HealthForm';
import BehaviorForm from './BehaviorForm';
import FreeForm from './FreeForm';
import MediaUpload from '../MediaUpload/MediaUpload';
import './EntryForm.css';

interface EditEntryFormProps {
  entry: DiaryEntry;
  onSave: (entry: DiaryEntry) => void;
  onCancel: () => void;
}

const EditEntryForm: React.FC<EditEntryFormProps> = ({ entry, onSave, onCancel }) => {
  const [entryType, setEntryType] = useState<EntryType>(entry.type);
  const [mood, setMood] = useState<Mood>(entry.mood);
  const [date, setDate] = useState(entry.date.toISOString().split('T')[0]);
  const [entryData, setEntryData] = useState<Partial<EntryData>>(entry.data);
  const [media, setMedia] = useState<MediaAttachment[]>(entry.media || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moods: Mood[] = ['😸', '😻', '😿', '😾', '🙀', '😺', '😹', '😼'];

  useEffect(() => {
    if (entryType !== entry.type) {
      setEntryData({});
    }
  }, [entryType, entry.type]);

  const handleTypeChange = (type: EntryType) => {
    setEntryType(type);
  };

  const handleDataChange = (data: Partial<EntryData>) => {
    setEntryData(data);
    setError(null);
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
      setError('必須項目を入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedEntry: DiaryEntry = {
        ...entry,
        type: entryType,
        date: new Date(date),
        data: entryData as EntryData,
        media: media,
        mood,
        updatedAt: new Date()
      };

      await storageManager.updateEntry(updatedEntry);
      onSave(updatedEntry);
    } catch (error) {
      console.error('Error updating entry:', error);
      setError('保存に失敗しました。もう一度お試しください。');
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
        return '🍽️ 食事記録の編集';
      case 'health':
        return '💊 健康記録の編集';
      case 'behavior':
        return '🎾 行動記録の編集';
      case 'free':
        return '📝 自由記録の編集';
      default:
        return '記録の編集';
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

      <MediaUpload
        media={media}
        onChange={setMedia}
        maxFiles={5}
      />

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="form-actions">
        <button
          className="save-btn"
          onClick={handleSubmit}
          disabled={isSubmitting || !validateEntry()}
        >
          {isSubmitting ? '更新中...' : '更新'}
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

export default EditEntryForm;