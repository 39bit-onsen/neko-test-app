import React, { useState } from 'react';
import './CatDiary.css';

interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  photos?: string[];
}

const CatDiary: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: '😸'
  });

  const handleAddEntry = () => {
    if (newEntry.title && newEntry.content) {
      const entry: DiaryEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('ja-JP'),
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood
      };
      setEntries([entry, ...entries]);
      setNewEntry({ title: '', content: '', mood: '😸' });
      setIsAddingEntry(false);
    }
  };

  const moods = ['😸', '😻', '😿', '😾', '🙀', '😺', '😹', '😼'];

  return (
    <div className="cat-diary">
      <header className="diary-header">
        <h1>🐱 猫日記 🐱</h1>
        <button 
          className="add-entry-btn"
          onClick={() => setIsAddingEntry(true)}
        >
          新しい日記を書く
        </button>
      </header>

      {isAddingEntry && (
        <div className="entry-form">
          <h2>新しい日記エントリー</h2>
          <input
            type="text"
            placeholder="タイトル"
            value={newEntry.title}
            onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
          />
          <textarea
            placeholder="今日の猫の様子を書いてください..."
            value={newEntry.content}
            onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
            rows={6}
          />
          <div className="mood-selector">
            <label>今日の猫の気分:</label>
            <div className="mood-options">
              {moods.map(mood => (
                <button
                  key={mood}
                  className={`mood-btn ${newEntry.mood === mood ? 'selected' : ''}`}
                  onClick={() => setNewEntry({...newEntry, mood})}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button onClick={handleAddEntry} className="save-btn">保存</button>
            <button onClick={() => setIsAddingEntry(false)} className="cancel-btn">キャンセル</button>
          </div>
        </div>
      )}

      <div className="entries-list">
        {entries.length === 0 ? (
          <div className="no-entries">
            <p>まだ日記がありません。最初の日記を書いてみましょう！</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="diary-entry">
              <div className="entry-header">
                <h3>{entry.title}</h3>
                <div className="entry-meta">
                  <span className="date">{entry.date}</span>
                  <span className="mood">{entry.mood}</span>
                </div>
              </div>
              <div className="entry-content">
                <p>{entry.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CatDiary;