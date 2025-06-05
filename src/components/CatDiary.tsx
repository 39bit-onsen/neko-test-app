import React, { useState, useEffect } from 'react';
import { DiaryEntry } from '../types';
import { storageManager } from '../utils/storage';
import NewEntryForm from './EntryForm/NewEntryForm';
import EntryList from './EntryList/EntryList';
import './CatDiary.css';

const CatDiary: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
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

      <EntryList
        entries={entries}
        onEntryClick={handleEntryClick}
      />
    </div>
  );
};

export default CatDiary;