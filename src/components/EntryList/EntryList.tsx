import React, { useState, useMemo } from 'react';
import { DiaryEntry, EntryType } from '../../types';
import EntryCard from './EntryCard';
import './EntryList.css';

interface EntryListProps {
  entries: DiaryEntry[];
  onEntryClick?: (entry: DiaryEntry) => void;
}

const EntryList: React.FC<EntryListProps> = ({ entries, onEntryClick }) => {
  const [filterType, setFilterType] = useState<EntryType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');
  const [searchQuery, setSearchQuery] = useState('');

  const filterOptions = [
    { value: 'all', label: 'すべて', icon: '📋' },
    { value: 'food', label: '食事', icon: '🍽️' },
    { value: 'health', label: '健康', icon: '💊' },
    { value: 'behavior', label: '行動', icon: '🎾' },
    { value: 'free', label: '自由記録', icon: '📝' }
  ];

  const sortOptions = [
    { value: 'date', label: '日付順' },
    { value: 'type', label: 'カテゴリー順' }
  ];

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entries;

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(entry => entry.type === filterType);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => {
        // Search in notes
        const notesMatch = entry.data.notes?.toLowerCase().includes(query);
        
        // Search in type-specific data
        let dataMatch = false;
        switch (entry.type) {
          case 'food':
            const foodData = entry.data as any;
            dataMatch = foodData.foodType?.toLowerCase().includes(query);
            break;
          case 'health':
            const healthData = entry.data as any;
            dataMatch = healthData.symptoms?.some((symptom: string) => 
              symptom.toLowerCase().includes(query)
            ) || healthData.vetNotes?.toLowerCase().includes(query);
            break;
          case 'behavior':
            const behaviorData = entry.data as any;
            dataMatch = behaviorData.specialBehaviors?.some((behavior: string) => 
              behavior.toLowerCase().includes(query)
            ) || behaviorData.location?.some((location: string) => 
              location.toLowerCase().includes(query)
            );
            break;
          case 'free':
            const freeData = entry.data as any;
            dataMatch = freeData.title?.toLowerCase().includes(query) ||
                       freeData.content?.toLowerCase().includes(query) ||
                       freeData.tags?.some((tag: string) => 
                         tag.toLowerCase().includes(query)
                       );
            break;
        }

        return notesMatch || dataMatch;
      });
    }

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === 'type') {
      filtered.sort((a, b) => {
        if (a.type === b.type) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        return a.type.localeCompare(b.type);
      });
    }

    return filtered;
  }, [entries, filterType, sortBy, searchQuery]);

  const getEntriesGroupedByDate = () => {
    const grouped: { [key: string]: DiaryEntry[] } = {};
    
    filteredAndSortedEntries.forEach(entry => {
      const dateKey = entry.date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });

    return grouped;
  };

  const getEntriesGroupedByType = () => {
    const grouped: { [key: string]: DiaryEntry[] } = {};
    
    filteredAndSortedEntries.forEach(entry => {
      const typeKey = entry.type;
      
      if (!grouped[typeKey]) {
        grouped[typeKey] = [];
      }
      grouped[typeKey].push(entry);
    });

    return grouped;
  };

  const getTypeLabel = (type: string) => {
    const option = filterOptions.find(opt => opt.value === type);
    return option ? `${option.icon} ${option.label}` : type;
  };

  const renderEntries = () => {
    if (filteredAndSortedEntries.length === 0) {
      return (
        <div className="no-entries">
          {searchQuery ? (
            <>
              <p>「{searchQuery}」に一致する記録が見つかりませんでした。</p>
              <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                検索をクリア
              </button>
            </>
          ) : (
            <p>
              {filterType === 'all' 
                ? 'まだ記録がありません。最初の記録を作成してみましょう！'
                : `${filterOptions.find(opt => opt.value === filterType)?.label}の記録がありません。`
              }
            </p>
          )}
        </div>
      );
    }

    if (sortBy === 'type') {
      const grouped = getEntriesGroupedByType();
      return (
        <div className="entries-grouped-by-type">
          {Object.entries(grouped).map(([type, typeEntries]) => (
            <div key={type} className="type-group">
              <h3 className="type-group-header">{getTypeLabel(type)}</h3>
              <div className="type-group-entries">
                {typeEntries.map(entry => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onClick={() => onEntryClick?.(entry)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (sortBy === 'date') {
      const grouped = getEntriesGroupedByDate();
      return (
        <div className="entries-grouped-by-date">
          {Object.entries(grouped).map(([date, dateEntries]) => (
            <div key={date} className="date-group">
              <h3 className="date-group-header">{date}</h3>
              <div className="date-group-entries">
                {dateEntries.map(entry => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onClick={() => onEntryClick?.(entry)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="entries-list">
        {filteredAndSortedEntries.map(entry => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onClick={() => onEntryClick?.(entry)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="entry-list-container">
      <div className="list-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="記録を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="clear-search"
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>カテゴリー:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EntryType | 'all')}
              className="filter-select"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>並び順:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'type')}
              className="sort-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="entries-count">
          {filteredAndSortedEntries.length}件の記録
          {searchQuery && ` (検索: "${searchQuery}")`}
          {filterType !== 'all' && ` (${filterOptions.find(opt => opt.value === filterType)?.label})`}
        </div>
      </div>

      <div className="entries-container">
        {renderEntries()}
      </div>
    </div>
  );
};

export default EntryList;