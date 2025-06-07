import React, { useState } from 'react';
import { CatProfile } from '../../types';

interface CatProfileFormProps {
  initialData?: CatProfile;
  onSave: (data: Omit<CatProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const CatProfileForm: React.FC<CatProfileFormProps> = ({ 
  initialData, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    breed: initialData?.breed || '',
    birthDate: initialData?.birthDate?.toISOString().split('T')[0] || '',
    adoptionDate: initialData?.adoptionDate?.toISOString().split('T')[0] || '',
    gender: initialData?.gender || 'male' as 'male' | 'female',
    neutered: initialData?.neutered || false,
    weight: initialData?.weight || '',
    color: initialData?.color || '',
    microchipId: initialData?.microchipId || '',
    medicalNotes: initialData?.medicalNotes || '',
    emergencyContact: initialData?.emergencyContact || '',
    profilePhoto: initialData?.profilePhoto || '',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '名前は必須です';
    }
    
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthDate = '未来の日付は選択できません';
      }
    }
    
    if (formData.adoptionDate) {
      const adoptionDate = new Date(formData.adoptionDate);
      const today = new Date();
      if (adoptionDate > today) {
        newErrors.adoptionDate = '未来の日付は選択できません';
      }
    }
    
    if (formData.weight && (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0)) {
      newErrors.weight = '正しい体重を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const data: Omit<CatProfile, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name.trim(),
      breed: formData.breed.trim() || undefined,
      birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      adoptionDate: formData.adoptionDate ? new Date(formData.adoptionDate) : undefined,
      gender: formData.gender,
      neutered: formData.neutered,
      weight: formData.weight ? Number(formData.weight) : undefined,
      color: formData.color.trim() || undefined,
      microchipId: formData.microchipId.trim() || undefined,
      medicalNotes: formData.medicalNotes.trim() || undefined,
      emergencyContact: formData.emergencyContact.trim() || undefined,
      profilePhoto: formData.profilePhoto.trim() || undefined,
      isActive: formData.isActive
    };

    onSave(data);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateAge = () => {
    if (!formData.birthDate) return null;
    
    const birth = new Date(formData.birthDate);
    const today = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + 
                   (today.getMonth() - birth.getMonth());
    
    if (months < 12) {
      return `${months}ヶ月`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 ? `${years}歳${remainingMonths}ヶ月` : `${years}歳`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cat-profile-form">
      <div className="form-sections">
        <div className="form-section">
          <h4>基本情報</h4>
          
          <div className="form-group">
            <label>名前 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="猫の名前"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>品種</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => handleInputChange('breed', e.target.value)}
                placeholder="例: アメリカンショートヘア"
              />
            </div>

            <div className="form-group">
              <label>毛色</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="例: 三毛、白、黒"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>性別</label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value="male">オス</option>
                <option value="female">メス</option>
              </select>
            </div>

            <div className="form-group">
              <label>避妊/去勢</label>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="neutered"
                  checked={formData.neutered}
                  onChange={(e) => handleInputChange('neutered', e.target.checked)}
                />
                <label htmlFor="neutered">済み</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>体重 (kg)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              placeholder="例: 4.5"
              className={errors.weight ? 'error' : ''}
            />
            {errors.weight && <span className="error-text">{errors.weight}</span>}
          </div>
        </div>

        <div className="form-section">
          <h4>日付情報</h4>
          
          <div className="form-group">
            <label>生年月日</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              className={errors.birthDate ? 'error' : ''}
            />
            {formData.birthDate && (
              <div className="age-display">現在の年齢: {calculateAge()}</div>
            )}
            {errors.birthDate && <span className="error-text">{errors.birthDate}</span>}
          </div>

          <div className="form-group">
            <label>お迎え日</label>
            <input
              type="date"
              value={formData.adoptionDate}
              onChange={(e) => handleInputChange('adoptionDate', e.target.value)}
              className={errors.adoptionDate ? 'error' : ''}
            />
            {errors.adoptionDate && <span className="error-text">{errors.adoptionDate}</span>}
          </div>
        </div>

        <div className="form-section">
          <h4>医療・識別情報</h4>
          
          <div className="form-group">
            <label>マイクロチップID</label>
            <input
              type="text"
              value={formData.microchipId}
              onChange={(e) => handleInputChange('microchipId', e.target.value)}
              placeholder="15桁の番号"
            />
          </div>

          <div className="form-group">
            <label>医療メモ</label>
            <textarea
              value={formData.medicalNotes}
              onChange={(e) => handleInputChange('medicalNotes', e.target.value)}
              placeholder="アレルギー、慢性疾患、服用中の薬など"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>緊急連絡先</label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder="かかりつけ動物病院の電話番号など"
            />
          </div>
        </div>

        <div className="form-section">
          <h4>その他</h4>
          
          <div className="form-group">
            <label>プロフィール写真URL</label>
            <input
              type="url"
              value={formData.profilePhoto}
              onChange={(e) => handleInputChange('profilePhoto', e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
              />
              <label htmlFor="isActive">アクティブな猫として表示</label>
            </div>
            <small>非アクティブにすると、統計や分析から除外されます</small>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          キャンセル
        </button>
        <button type="submit" className="save-btn">
          {initialData ? '更新' : '追加'}
        </button>
      </div>
    </form>
  );
};

export default CatProfileForm;