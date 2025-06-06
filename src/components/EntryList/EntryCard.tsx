import React from 'react';
import { DiaryEntry, FoodData, HealthData, BehaviorData, FreeData } from '../../types';
import MediaPreview from './MediaPreview';
import './EntryCard.css';

interface EntryCardProps {
  entry: DiaryEntry;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onClick, onEdit, onDelete }) => {
  const getEntryTypeInfo = () => {
    switch (entry.type) {
      case 'food':
        return { icon: '🍽️', label: '食事記録', color: '#ff9800' };
      case 'health':
        return { icon: '💊', label: '健康記録', color: '#f44336' };
      case 'behavior':
        return { icon: '🎾', label: '行動記録', color: '#2196f3' };
      case 'free':
        return { icon: '📝', label: '自由記録', color: '#4caf50' };
      default:
        return { icon: '📝', label: '記録', color: '#666' };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPreview = () => {
    switch (entry.type) {
      case 'food':
        const foodData = entry.data as FoodData;
        return (
          <div className="entry-preview food-preview">
            <div className="preview-item">
              <span className="preview-label">フード:</span>
              <span className="preview-value">{foodData.foodType}</span>
            </div>
            {foodData.amount && (
              <div className="preview-item">
                <span className="preview-label">量:</span>
                <span className="preview-value">{foodData.amount}{foodData.amountUnit}</span>
              </div>
            )}
            <div className="preview-item">
              <span className="preview-label">食欲:</span>
              <span className="preview-value appetite-indicator">
                {getAppetiteEmoji(foodData.appetite)} {getAppetiteLabel(foodData.appetite)}
              </span>
            </div>
            {foodData.time && (
              <div className="preview-item">
                <span className="preview-label">時間:</span>
                <span className="preview-value">{foodData.time}</span>
              </div>
            )}
          </div>
        );

      case 'health':
        const healthData = entry.data as HealthData;
        return (
          <div className="entry-preview health-preview">
            {healthData.weight && (
              <div className="preview-item">
                <span className="preview-label">体重:</span>
                <span className="preview-value">{healthData.weight}kg</span>
              </div>
            )}
            {healthData.temperature && (
              <div className="preview-item">
                <span className="preview-label">体温:</span>
                <span className="preview-value">{healthData.temperature}℃</span>
              </div>
            )}
            {healthData.symptoms && healthData.symptoms.length > 0 && (
              <div className="preview-item">
                <span className="preview-label">症状:</span>
                <span className="preview-value">{healthData.symptoms.slice(0, 2).join(', ')}</span>
                {healthData.symptoms.length > 2 && <span className="more-indicator">他{healthData.symptoms.length - 2}件</span>}
              </div>
            )}
            {healthData.vetVisit && (
              <div className="preview-item">
                <span className="vet-visit-badge">🏥 病院受診</span>
              </div>
            )}
          </div>
        );

      case 'behavior':
        const behaviorData = entry.data as BehaviorData;
        return (
          <div className="entry-preview behavior-preview">
            <div className="preview-item">
              <span className="preview-label">活動:</span>
              <span className="preview-value activity-indicator">
                {getActivityEmoji(behaviorData.activityLevel)} {getActivityLabel(behaviorData.activityLevel)}
              </span>
            </div>
            {behaviorData.sleepHours && (
              <div className="preview-item">
                <span className="preview-label">睡眠:</span>
                <span className="preview-value">{behaviorData.sleepHours}時間</span>
              </div>
            )}
            {behaviorData.specialBehaviors && behaviorData.specialBehaviors.length > 0 && (
              <div className="preview-item">
                <span className="preview-label">特別な行動:</span>
                <span className="preview-value">{behaviorData.specialBehaviors.slice(0, 2).join(', ')}</span>
                {behaviorData.specialBehaviors.length > 2 && <span className="more-indicator">他{behaviorData.specialBehaviors.length - 2}件</span>}
              </div>
            )}
          </div>
        );

      case 'free':
        const freeData = entry.data as FreeData;
        return (
          <div className="entry-preview free-preview">
            <h4 className="entry-title">{freeData.title}</h4>
            <p className="entry-content-preview">
              {freeData.content.length > 100 
                ? `${freeData.content.substring(0, 100)}...` 
                : freeData.content}
            </p>
            {freeData.tags && freeData.tags.length > 0 && (
              <div className="tags-preview">
                {freeData.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="tag-preview">#{tag}</span>
                ))}
                {freeData.tags.length > 3 && <span className="more-tags">+{freeData.tags.length - 3}</span>}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getAppetiteEmoji = (appetite: string) => {
    switch (appetite) {
      case 'excellent': return '😋';
      case 'good': return '😊';
      case 'fair': return '😐';
      case 'poor': return '😞';
      case 'none': return '😿';
      default: return '😐';
    }
  };

  const getAppetiteLabel = (appetite: string) => {
    switch (appetite) {
      case 'excellent': return 'とても良い';
      case 'good': return '良い';
      case 'fair': return '普通';
      case 'poor': return '悪い';
      case 'none': return '食べない';
      default: return '普通';
    }
  };

  const getActivityEmoji = (level: string) => {
    switch (level) {
      case 'very_active': return '🏃‍♂️';
      case 'active': return '🚶‍♂️';
      case 'normal': return '😊';
      case 'calm': return '😌';
      case 'lethargic': return '😴';
      default: return '😊';
    }
  };

  const getActivityLabel = (level: string) => {
    switch (level) {
      case 'very_active': return 'とても活発';
      case 'active': return '活発';
      case 'normal': return '普通';
      case 'calm': return '落ち着いている';
      case 'lethargic': return '元気がない';
      default: return '普通';
    }
  };

  const typeInfo = getEntryTypeInfo();

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.target instanceof Element && e.target.closest('.entry-actions')) {
      return;
    }
    onClick?.();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div className="entry-card" onClick={handleCardClick}>
      <div className="entry-header">
        <div className="entry-type-badge" style={{ backgroundColor: typeInfo.color }}>
          <span className="entry-icon">{typeInfo.icon}</span>
          <span className="entry-type-label">{typeInfo.label}</span>
        </div>
        <div className="entry-header-right">
          <div className="entry-mood">{entry.mood}</div>
          {(onEdit || onDelete) && (
            <div className="entry-actions">
              {onEdit && (
                <button
                  className="entry-action-btn edit-btn"
                  onClick={handleEditClick}
                  title="編集"
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button
                  className="entry-action-btn delete-btn"
                  onClick={handleDeleteClick}
                  title="削除"
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="entry-date-time">
        <div className="entry-date">{formatDate(entry.date)}</div>
        <div className="entry-time">{formatTime(entry.createdAt)}</div>
      </div>

      {renderPreview()}

      {entry.data.notes && (
        <div className="entry-notes">
          <p>{entry.data.notes.length > 50 
            ? `${entry.data.notes.substring(0, 50)}...` 
            : entry.data.notes}
          </p>
        </div>
      )}

      <MediaPreview media={entry.media} />
    </div>
  );
};

export default EntryCard;