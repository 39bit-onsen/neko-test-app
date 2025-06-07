import React from 'react';
import { CatProfile } from '../../types';

interface CatProfileCardProps {
  cat: CatProfile;
  isActive: boolean;
  onSetActive: (catId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  viewMode: 'grid' | 'list';
}

const CatProfileCard: React.FC<CatProfileCardProps> = ({
  cat,
  isActive,
  onSetActive,
  onEdit,
  onDelete,
  viewMode
}) => {
  const calculateAge = (birthDate?: Date) => {
    if (!birthDate) return null;
    
    const today = new Date();
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                   (today.getMonth() - birthDate.getMonth());
    
    if (months < 12) {
      return `${months}ヶ月`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 ? `${years}歳${remainingMonths}ヶ月` : `${years}歳`;
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('ja-JP');
  };

  return (
    <div className={`cat-profile-card ${viewMode} ${isActive ? 'active' : ''} ${!cat.isActive ? 'inactive' : ''}`}>
      <div className="card-content">
        <div className="cat-photo">
          {cat.profilePhoto ? (
            <img src={cat.profilePhoto} alt={cat.name} />
          ) : (
            <div className="default-photo">
              <span className="photo-icon">🐱</span>
            </div>
          )}
          {isActive && <div className="active-badge">選択中</div>}
          {!cat.isActive && <div className="inactive-badge">非アクティブ</div>}
        </div>

        <div className="cat-info">
          <div className="cat-header">
            <h3 className="cat-name">{cat.name}</h3>
            <div className="cat-actions">
              {!isActive && cat.isActive && (
                <button 
                  className="select-btn"
                  onClick={() => onSetActive(cat.id)}
                  title="この猫を選択"
                >
                  選択
                </button>
              )}
              <button 
                className="edit-btn"
                onClick={onEdit}
                title="編集"
              >
                ✏️
              </button>
              <button 
                className="delete-btn"
                onClick={onDelete}
                title="削除"
              >
                🗑️
              </button>
            </div>
          </div>

          <div className="cat-details">
            {cat.breed && (
              <div className="detail-item">
                <span className="label">品種:</span>
                <span className="value">{cat.breed}</span>
              </div>
            )}
            
            {cat.birthDate && (
              <div className="detail-item">
                <span className="label">年齢:</span>
                <span className="value">{calculateAge(cat.birthDate)}</span>
              </div>
            )}

            <div className="detail-item">
              <span className="label">性別:</span>
              <span className="value">
                {cat.gender === 'male' ? 'オス' : 'メス'}
                {cat.neutered && ' (去勢/避妊済み)'}
              </span>
            </div>

            {cat.weight && (
              <div className="detail-item">
                <span className="label">体重:</span>
                <span className="value">{cat.weight}kg</span>
              </div>
            )}

            {cat.color && (
              <div className="detail-item">
                <span className="label">毛色:</span>
                <span className="value">{cat.color}</span>
              </div>
            )}

            {viewMode === 'list' && (
              <>
                {cat.adoptionDate && (
                  <div className="detail-item">
                    <span className="label">お迎え日:</span>
                    <span className="value">{formatDate(cat.adoptionDate)}</span>
                  </div>
                )}

                {cat.microchipId && (
                  <div className="detail-item">
                    <span className="label">マイクロチップ:</span>
                    <span className="value">{cat.microchipId}</span>
                  </div>
                )}

                {cat.medicalNotes && (
                  <div className="detail-item medical-notes">
                    <span className="label">医療メモ:</span>
                    <span className="value">{cat.medicalNotes}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="cat-meta">
            <div className="meta-item">
              <span className="meta-label">登録日:</span>
              <span className="meta-value">{formatDate(cat.createdAt)}</span>
            </div>
            {cat.updatedAt.getTime() !== cat.createdAt.getTime() && (
              <div className="meta-item">
                <span className="meta-label">更新日:</span>
                <span className="meta-value">{formatDate(cat.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatProfileCard;