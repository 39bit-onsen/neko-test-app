import React, { useState, useEffect, useRef } from 'react';
import { DiaryEntry, EntryType, EntryData, Mood, FoodData, HealthData, BehaviorData, FreeData, MediaAttachment } from '../../types';
import { storageManager } from '../../utils/storage';
import { draftStorage, DraftData } from '../../utils/draftStorage';
import { useMultiCat } from '../../contexts/MultiCatContext';
import EntryTypeSelector from './EntryTypeSelector';
import FoodForm from './FoodForm';
import HealthForm from './HealthForm';
import BehaviorForm from './BehaviorForm';
import FreeForm from './FreeForm';
import DraftManager from '../DraftManager/DraftManager';
import MediaUpload from '../MediaUpload/MediaUpload';
import './EntryForm.css';

interface NewEntryFormProps {
  onSave: (entry: DiaryEntry) => void;
  onCancel: () => void;
  initialDraft?: DraftData;
}

const NewEntryForm: React.FC<NewEntryFormProps> = ({ onSave, onCancel, initialDraft }) => {
  const { activeCatId, activeCat } = useMultiCat();
  const [entryType, setEntryType] = useState<EntryType>(initialDraft?.type || 'free');
  const [mood, setMood] = useState<Mood>((initialDraft?.mood as Mood) || '😸');
  const [date, setDate] = useState(initialDraft?.date || new Date().toISOString().split('T')[0]);
  const [entryData, setEntryData] = useState<Partial<EntryData>>(initialDraft?.data || {});
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftManagerOpen, setIsDraftManagerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const formId = useRef(`form_${Date.now()}`);

  const moods: Mood[] = ['😸', '😻', '😿', '😾', '🙀', '😺', '😹', '😼'];

  useEffect(() => {
    if (!initialDraft) {
      setEntryData({});
    }
  }, [entryType, initialDraft]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      if (Object.keys(entryData).length > 0) {
        draftStorage.autoSave(formId.current, entryType, entryData, mood, date);
      }
    }, 2000);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [entryType, entryData, mood, date]);

  // Load auto-save on mount
  useEffect(() => {
    if (!initialDraft) {
      const autoSaved = draftStorage.loadAutoSave(formId.current);
      if (autoSaved) {
        setEntryType(autoSaved.type);
        setEntryData(autoSaved.data);
        setMood(autoSaved.mood as Mood);
        setDate(autoSaved.date);
      }
    }
  }, [initialDraft]);

  const handleTypeChange = (type: EntryType) => {
    setEntryType(type);
  };

  const handleDataChange = (data: Partial<EntryData>) => {
    setEntryData(data);
    setError(null);
  };

  const handleSaveDraft = () => {
    const draftId = draftStorage.saveDraft(entryType, entryData, mood, date);
    alert('下書きを保存しました');
  };

  const handleLoadDraft = (draft: DraftData) => {
    setEntryType(draft.type);
    setEntryData(draft.data);
    setMood(draft.mood as Mood);
    setDate(draft.date);
    setIsDraftManagerOpen(false);
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
    if (!activeCatId) {
      setError('猫を選択してください');
      return;
    }

    if (!validateEntry()) {
      setError('必須項目を入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const entry: DiaryEntry = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        catId: activeCatId || '',
        type: entryType,
        date: new Date(date),
        data: entryData as EntryData,
        media: media,
        mood,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await storageManager.saveEntry(entry);
      
      // Clear auto-save after successful save
      draftStorage.clearAutoSave(formId.current);
      
      onSave(entry);
    } catch (error) {
      console.error('Error saving entry:', error);
      setError('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Keep auto-save when cancelling
    onCancel();
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
    <>
      <div className="entry-form">
        <div className="form-header">
          <h2>{getFormTitle()}</h2>
          <div className="header-controls">
            <button
              type="button"
              className="draft-btn"
              onClick={() => setIsDraftManagerOpen(true)}
              disabled={!draftStorage.hasDrafts()}
            >
              下書き
            </button>
            <button
              type="button"
              className="save-draft-btn"
              onClick={handleSaveDraft}
              disabled={Object.keys(entryData).length === 0}
            >
              保存
            </button>
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
            {isSubmitting ? '保存中...' : '保存'}
          </button>
          <button
            className="cancel-btn"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </button>
        </div>
      </div>

      <DraftManager
        isOpen={isDraftManagerOpen}
        onClose={() => setIsDraftManagerOpen(false)}
        onLoadDraft={handleLoadDraft}
      />
    </>
  );
};

export default NewEntryForm;