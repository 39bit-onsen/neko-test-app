import React, { useState, useEffect } from 'react';
import { DiaryEntry } from '../types';
import { storageManager } from '../utils/storage';
import { useMultiCat } from '../contexts/MultiCatContext';
import NewEntryForm from './EntryForm/NewEntryForm';
import EditEntryForm from './EntryForm/EditEntryForm';
import EntryList from './EntryList/EntryList';
import Analytics from './Analytics/Analytics';
import ConfirmDialog from './ConfirmDialog/ConfirmDialog';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import CatSelector from './CatSelector/CatSelector';
import './CatDiary.css';

type ViewMode = 'entries' | 'analytics';

const CatDiary: React.FC = () => {
  const { activeCat, activeCatId, isLoading: catsLoading } = useMultiCat();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('entries');

  useEffect(() => {
    initializeStorage();
  }, []);

  useEffect(() => {
    if (activeCatId) {
      loadEntriesForActiveCat();
    } else {
      setEntries([]);
    }
  }, [activeCatId]);

  const initializeStorage = async () => {
    try {
      await storageManager.init();
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEntriesForActiveCat = async () => {
    if (!activeCatId) return;
    
    try {
      const catEntries = await storageManager.getEntriesByCat(activeCatId);
      setEntries(catEntries);
    } catch (error) {
      console.error('Failed to load entries for cat:', error);
      // フォールバック: 全エントリから該当する猫のものをフィルター
      const allEntries = await storageManager.getEntries();
      const filteredEntries = allEntries.filter(entry => entry.catId === activeCatId);
      setEntries(filteredEntries);
    }
  };

  const handleAddEntry = (entry: DiaryEntry) => {
    // 新しいエントリにはactiveCatIdを自動設定
    const entryWithCatId = { ...entry, catId: activeCatId || entry.catId };
    setEntries(prev => [entryWithCatId, ...prev]);
    setIsAddingEntry(false);
  };

  const handleEditEntry = (updatedEntry: DiaryEntry) => {
    setEntries(prev => prev.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
    setEditingEntry(null);
  };

  const handleDeleteEntry = async () => {
    if (!deletingEntry) return;

    try {
      await storageManager.deleteEntry(deletingEntry.id);
      setEntries(prev => prev.filter(entry => entry.id !== deletingEntry.id));
      setDeletingEntry(null);
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('削除に失敗しました。もう一度お試しください。');
    }
  };

  const handleEntryClick = (entry: DiaryEntry) => {
    console.log('Entry clicked:', entry);
  };

  if (isLoading || catsLoading) {
    return (
      <div className="cat-diary">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cat-diary">
      <header className="diary-header">
        <h1>🐱 猫日記 🐱</h1>
        <div className="header-stats">
          <span className="total-entries">{entries.length}件の記録</span>
          <ThemeToggle />
        </div>

        {/* 猫選択コンポーネント */}
        <CatSelector />
        
        {activeCat ? (
          <>
            <div className="view-mode-selector">
              <button 
                className={`mode-btn ${viewMode === 'entries' ? 'active' : ''}`}
                onClick={() => setViewMode('entries')}
              >
                📝 記録一覧
              </button>
              <button 
                className={`mode-btn ${viewMode === 'analytics' ? 'active' : ''}`}
                onClick={() => setViewMode('analytics')}
              >
                📊 統計・分析
              </button>
            </div>
            
            {viewMode === 'entries' && (
              <button 
                className="add-entry-btn"
                onClick={() => setIsAddingEntry(true)}
              >
                新しい記録を作成
              </button>
            )}
          </>
        ) : (
          <div className="no-cat-selected">
            <p>猫を選択または登録して記録を開始してください</p>
          </div>
        )}
      </header>

      {activeCat && (
        <>
          {isAddingEntry && (
            <NewEntryForm
              onSave={handleAddEntry}
              onCancel={() => setIsAddingEntry(false)}
            />
          )}

          {editingEntry && (
            <EditEntryForm
              entry={editingEntry}
              onSave={handleEditEntry}
              onCancel={() => setEditingEntry(null)}
            />
          )}

          {viewMode === 'entries' ? (
            <EntryList
              entries={entries}
              onEntryClick={handleEntryClick}
              onEntryEdit={setEditingEntry}
              onEntryDelete={setDeletingEntry}
            />
          ) : (
            <Analytics entries={entries} />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!deletingEntry}
        title="記録を削除"
        message={`「${deletingEntry?.type === 'free' ? (deletingEntry.data as any).title : `${deletingEntry?.type}記録`}」を削除しますか？この操作は取り消せません。`}
        confirmText="削除"
        cancelText="キャンセル"
        onConfirm={handleDeleteEntry}
        onCancel={() => setDeletingEntry(null)}
        type="danger"
      />
    </div>
  );
};

export default CatDiary;