import React, { useState } from 'react';
import { FreeData } from '../../types';

interface FreeFormProps {
  data: Partial<FreeData>;
  onChange: (data: Partial<FreeData>) => void;
}

const FreeForm: React.FC<FreeFormProps> = ({ data, onChange }) => {
  const [newTag, setNewTag] = useState('');

  const commonTags = [
    '可愛い瞬間',
    '面白い行動',
    '初めての体験',
    '記念日',
    'お気に入り',
    '成長記録',
    '失敗談',
    '感動',
    '発見',
    '変化',
    '思い出',
    '特別な日'
  ];

  const addTag = (tag: string) => {
    const currentTags = data.tags || [];
    if (!currentTags.includes(tag)) {
      onChange({
        ...data,
        tags: [...currentTags, tag]
      });
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = data.tags || [];
    onChange({
      ...data,
      tags: currentTags.filter(t => t !== tag)
    });
  };

  const addCustomTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <div className="free-form">
      <div className="form-group">
        <label>タイトル *</label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="今日の出来事のタイトルを入力してください"
          required
        />
      </div>

      <div className="form-group">
        <label>内容 *</label>
        <textarea
          value={data.content || ''}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          placeholder="今日の猫の様子や出来事を詳しく書いてください..."
          rows={8}
          required
        />
      </div>

      <div className="form-group">
        <label>タグ</label>
        <div className="tags-section">
          <div className="common-tags">
            {commonTags.map(tag => (
              <button
                key={tag}
                type="button"
                className={`tag-btn ${(data.tags || []).includes(tag) ? 'selected' : ''}`}
                onClick={() => 
                  (data.tags || []).includes(tag) 
                    ? removeTag(tag) 
                    : addTag(tag)
                }
              >
                #{tag}
              </button>
            ))}
          </div>
          <div className="custom-tag-input">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="オリジナルタグを追加"
              onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
            />
            <button type="button" onClick={addCustomTag}>追加</button>
          </div>
          {data.tags && data.tags.length > 0 && (
            <div className="selected-tags">
              <strong>選択されたタグ:</strong>
              <div className="tag-list">
                {data.tags.map(tag => (
                  <span key={tag} className="tag-item">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)}>×</button>
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
          placeholder="追加で記録しておきたいことがあれば..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default FreeForm;