import React, { useState, useEffect } from 'react';
import { draftStorage, DraftData } from '../../utils/draftStorage';
import { DiaryEntry, EntryType } from '../../types';
import './DraftManager.css';

interface DraftManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft: (draft: DraftData) => void;
}

const DraftManager: React.FC<DraftManagerProps> = ({ isOpen, onClose, onLoadDraft }) => {
  const [drafts, setDrafts] = useState<DraftData[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadDrafts();
    }
  }, [isOpen]);

  const loadDrafts = () => {
    const allDrafts = draftStorage.getAllDrafts();
    setDrafts(allDrafts);
  };

  const handleDeleteDraft = (draftId: string) => {
    draftStorage.deleteDraft(draftId);
    loadDrafts();
  };

  const handleLoadDraft = (draft: DraftData) => {
    onLoadDraft(draft);
    onClose();
  };

  const getTypeLabel = (type: EntryType) => {
    switch (type) {
      case 'food': return '🍽️ 食事記録';
      case 'health': return '💊 健康記録';
      case 'behavior': return '🎾 行動記録';
      case 'free': return '📝 自由記録';
      default: return '記録';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDraftPreview = (draft: DraftData): string => {
    switch (draft.type) {
      case 'food':
        const foodData = draft.data as any;
        return foodData.foodType || '未入力';
      case 'health':
        const healthData = draft.data as any;
        return healthData.symptoms?.join(', ') || '未入力';
      case 'behavior':
        const behaviorData = draft.data as any;
        return behaviorData.activityLevel || '未入力';
      case 'free':
        const freeData = draft.data as any;
        return freeData.title || freeData.content?.substring(0, 30) || '未入力';
      default:
        return '未入力';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="draft-manager-backdrop" onClick={onClose}>
      <div className="draft-manager" onClick={(e) => e.stopPropagation()}>
        <div className="draft-manager-header">
          <h2>下書き一覧</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="draft-manager-content">
          {drafts.length === 0 ? (
            <div className="no-drafts">
              <p>保存された下書きがありません</p>
            </div>
          ) : (
            <div className="drafts-list">
              {drafts.map(draft => (
                <div key={draft.id} className="draft-item">
                  <div className="draft-info">
                    <div className="draft-type">{getTypeLabel(draft.type)}</div>
                    <div className="draft-preview">{getDraftPreview(draft)}</div>
                    <div className="draft-date">
                      保存: {formatDate(draft.savedAt)}
                    </div>
                  </div>
                  <div className="draft-actions">
                    <button
                      className="load-draft-btn"
                      onClick={() => handleLoadDraft(draft)}
                    >
                      読み込み
                    </button>
                    <button
                      className="delete-draft-btn"
                      onClick={() => handleDeleteDraft(draft.id)}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="draft-manager-footer">
          <button
            className="clear-all-btn"
            onClick={() => {
              draftStorage.clearAllDrafts();
              loadDrafts();
            }}
            disabled={drafts.length === 0}
          >
            全て削除
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftManager;