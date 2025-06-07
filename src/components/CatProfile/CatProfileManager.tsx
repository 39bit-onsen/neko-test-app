import React, { useState } from 'react';
import { CatProfile } from '../../types';
import { useMultiCat } from '../../contexts/MultiCatContext';
import CatProfileForm from './CatProfileForm';
import CatProfileCard from './CatProfileCard';
import './CatProfileManager.css';

const CatProfileManager: React.FC = () => {
  const { 
    cats, 
    activeCat, 
    isLoading, 
    error, 
    addCat, 
    updateCat, 
    deleteCat, 
    setActiveCat 
  } = useMultiCat();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCat, setEditingCat] = useState<CatProfile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleAddCat = async (catData: Omit<CatProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addCat(catData);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add cat:', error);
    }
  };

  const handleUpdateCat = async (catData: Omit<CatProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingCat) return;
    
    try {
      await updateCat(editingCat.id, catData);
      setEditingCat(null);
    } catch (error) {
      console.error('Failed to update cat:', error);
    }
  };

  const handleDeleteCat = async (catId: string) => {
    if (window.confirm('この猫のプロフィールを削除しますか？関連する記録もすべて削除されます。')) {
      try {
        await deleteCat(catId);
      } catch (error) {
        console.error('Failed to delete cat:', error);
      }
    }
  };

  const handleSetActive = (catId: string) => {
    setActiveCat(catId);
  };

  if (isLoading) {
    return (
      <div className="cat-profile-manager loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>猫のプロフィールを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cat-profile-manager error">
        <div className="error-message">
          <h3>エラーが発生しました</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cat-profile-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>🐱 猫プロフィール管理</h2>
          <p>複数の猫のプロフィールを管理し、記録を分けて管理できます</p>
        </div>
        
        <div className="header-controls">
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="グリッド表示"
            >
              ⊞
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="リスト表示"
            >
              ≡
            </button>
          </div>
          
          <button 
            className="add-cat-btn"
            onClick={() => setShowAddForm(true)}
          >
            + 新しい猫を追加
          </button>
        </div>
      </div>

      {cats.length === 0 ? (
        <div className="no-cats">
          <div className="no-cats-content">
            <div className="no-cats-icon">🐱</div>
            <h3>まだ猫が登録されていません</h3>
            <p>最初の猫のプロフィールを作成して日記を始めましょう！</p>
            <button 
              className="get-started-btn"
              onClick={() => setShowAddForm(true)}
            >
              最初の猫を登録する
            </button>
          </div>
        </div>
      ) : (
        <div className={`cats-container ${viewMode}`}>
          {cats.map(cat => (
            <CatProfileCard
              key={cat.id}
              cat={cat}
              isActive={activeCat?.id === cat.id}
              onSetActive={handleSetActive}
              onEdit={() => setEditingCat(cat)}
              onDelete={() => handleDeleteCat(cat.id)}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>新しい猫を追加</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            <CatProfileForm
              onSave={handleAddCat}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {editingCat && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCat.name}のプロフィール編集</h3>
              <button 
                className="close-btn"
                onClick={() => setEditingCat(null)}
              >
                ✕
              </button>
            </div>
            <CatProfileForm
              initialData={editingCat}
              onSave={handleUpdateCat}
              onCancel={() => setEditingCat(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CatProfileManager;