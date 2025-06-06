import React, { useState, useEffect } from 'react';
import { DiaryEntry } from '../types';
import { storageManager } from '../utils/storage';
import NewEntryForm from './EntryForm/NewEntryForm';
import EditEntryForm from './EntryForm/EditEntryForm';
import EntryList from './EntryList/EntryList';
import ConfirmDialog from './ConfirmDialog/ConfirmDialog';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import './CatDiary.css';

const CatDiary: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
  }, []);

  const initializeStorage = async () => {
    try {
      await storageManager.init();
      const savedEntries = await storageManager.getEntries();
      setEntries(savedEntries);
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEntry = (entry: DiaryEntry) => {
    setEntries(prev => [entry, ...prev]);
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

  if (isLoading) {
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
        <button 
          className="add-entry-btn"
          onClick={() => setIsAddingEntry(true)}
        >
          新しい記録を作成
        </button>
      </header>

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

      <EntryList
        entries={entries}
        onEntryClick={handleEntryClick}
        onEntryEdit={setEditingEntry}
        onEntryDelete={setDeletingEntry}
      />

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