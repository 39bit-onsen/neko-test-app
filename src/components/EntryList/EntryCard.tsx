import React from 'react';
import { DiaryEntry, FoodData, HealthData, BehaviorData, FreeData } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import MediaPreview from './MediaPreview';
import './EntryCard.css';

interface EntryCardProps {
  entry: DiaryEntry;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onClick, onEdit, onDelete }) => {
  const { t, currentLanguage } = useLanguage();
  const getEntryTypeInfo = () => {
    switch (entry.type) {
      case 'food':
        return { icon: '🍽️', label: t('entries.types.food'), color: '#ff9800' };
      case 'health':
        return { icon: '💊', label: t('entries.types.health'), color: '#f44336' };
      case 'behavior':
        return { icon: '🎾', label: t('entries.types.behavior'), color: '#2196f3' };
      case 'free':
        return { icon: '📝', label: t('entries.types.free'), color: '#4caf50' };
      default:
        return { icon: '📝', label: t('entries.types.default'), color: '#666' };
    }
  };

  const formatDate = (date: Date) => {
    const locale = currentLanguage === 'zh' ? 'zh-CN' : 
                  currentLanguage === 'ko' ? 'ko-KR' :
                  currentLanguage === 'af' ? 'en-ZA' :
                  currentLanguage === 'en' ? 'en-US' : 'ja-JP';
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (date: Date) => {
    const locale = currentLanguage === 'zh' ? 'zh-CN' : 
                  currentLanguage === 'ko' ? 'ko-KR' :
                  currentLanguage === 'af' ? 'en-ZA' :
                  currentLanguage === 'en' ? 'en-US' : 'ja-JP';
    return date.toLocaleTimeString(locale, {
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
              <span className="preview-label">{t('entries.fields.food')}:</span>
              <span className="preview-value">{foodData.foodType}</span>
            </div>
            {foodData.amount && (
              <div className="preview-item">
                <span className="preview-label">{t('entries.fields.amount')}:</span>
                <span className="preview-value">{foodData.amount}{foodData.amountUnit}</span>
              </div>
            )}
            <div className="preview-item">
              <span className="preview-label">{t('entries.fields.appetite')}:</span>
              <span className="preview-value appetite-indicator">
                {getAppetiteEmoji(foodData.appetite)} {getAppetiteLabel(foodData.appetite)}
              </span>
            </div>
            {foodData.time && (
              <div className="preview-item">
                <span className="preview-label">{t('entries.fields.time')}:</span>
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
                <span className="preview-label">{t('entries.fields.weight')}:</span>
                <span className="preview-value">{healthData.weight}kg</span>
              </div>
            )}
            {healthData.temperature && (
              <div className="preview-item">
                <span className="preview-label">{t('entries.fields.temperature')}:</span>
                <span className="preview-value">{healthData.temperature}℃</span>
              </div>
            )}
            {healthData.symptoms && healthData.symptoms.length > 0 && (
              <div className="preview-item">
                <span className="preview-label">{t('entries.fields.symptoms')}:</span>
                <span className="preview-value">{healthData.symptoms.slice(0, 2).join(', ')}</span>
                {healthData.symptoms.length > 2 && <span className="more-indicator">{t('entries.moreItems', { count: healthData.symptoms.length - 2 })}</span>}
              </div>
            )}
            {healthData.vetVisit && (
              <div className="preview-item">
                <span className="vet-visit-badge">🏥 {t('entries.fields.vetVisit')}</span>
              </div>
            )}
          </div>
        );

      case 'behavior':
        const behaviorData = entry.data as BehaviorData;
        return (
          <div className="entry-preview behavior-preview">
            <div className="preview-item">
              <span className="preview-label">{t('entries.fields.activity')}:</span>
              <span className="preview-value activity-indicator">
                {getActivityEmoji(behaviorData.activityLevel)} {getActivityLabel(behaviorData.activityLevel)}
              </span>
            </div>
            {behaviorData.sleepHours && (
              <div className="preview-item">
                <span className="preview-label">{t('entries.fields.sleep')}:</span>
                <span className="preview-value">{behaviorData.sleepHours}時間</span>
              </div>
            )}
            {behaviorData.specialBehaviors && behaviorData.specialBehaviors.length > 0 && (
              <div className="preview-item">
                <span className="preview-label">{t('entries.fields.specialBehaviors')}:</span>
                <span className="preview-value">{behaviorData.specialBehaviors.slice(0, 2).join(', ')}</span>
                {behaviorData.specialBehaviors.length > 2 && <span className="more-indicator">{t('entries.moreItems', { count: behaviorData.specialBehaviors.length - 2 })}</span>}
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
      case 'excellent': return t('entries.appetite.excellent');
      case 'good': return t('entries.appetite.good');
      case 'fair': return t('entries.appetite.fair');
      case 'poor': return t('entries.appetite.poor');
      case 'none': return t('entries.appetite.none');
      default: return t('entries.appetite.fair');
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
      case 'very_active': return t('entries.activity.veryActive');
      case 'active': return t('entries.activity.active');
      case 'normal': return t('entries.activity.normal');
      case 'calm': return t('entries.activity.calm');
      case 'lethargic': return t('entries.activity.lethargic');
      default: return t('entries.activity.normal');
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
                  title={t('common.edit')}
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button
                  className="entry-action-btn delete-btn"
                  onClick={handleDeleteClick}
                  title={t('common.delete')}
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