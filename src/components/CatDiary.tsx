import React, { useState, useEffect } from 'react';
import { DiaryEntry, Reminder, Alert } from '../types';
import { storageManager } from '../utils/storage';
import { useMultiCat } from '../contexts/MultiCatContext';
import NewEntryForm from './EntryForm/NewEntryForm';
import EditEntryForm from './EntryForm/EditEntryForm';
import EntryList from './EntryList/EntryList';
import Analytics from './Analytics/Analytics';
import AdvancedAnalytics from './AdvancedAnalytics/AdvancedAnalytics';
import BehaviorAnalysis from './Behavior/BehaviorAnalysis';
import CatComparison from './CatComparison/CatComparison';
import CatProfileManager from './CatProfile/CatProfileManager';
import VetSharingPanel from './Social/VetSharingPanel';
import FamilyManager from './Social/FamilyManager';
import NotificationCenter from './PWA/NotificationCenter';
import ReportGenerator from './Reports/ReportGenerator';
import Dashboard from './Dashboard/Dashboard';
import ConfirmDialog from './ConfirmDialog/ConfirmDialog';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import CatSelector from './CatSelector/CatSelector';
import './CatDiary.css';

type ViewMode = 
  | 'entries' 
  | 'analytics' 
  | 'dashboard'
  | 'advanced-analytics'
  | 'behavior-analysis'
  | 'cat-comparison'
  | 'cat-profile'
  | 'vet-sharing'
  | 'family-manager'
  | 'notifications'
  | 'reminders'
  | 'reports';

const CatDiary: React.FC = () => {
  const { activeCat, activeCatId, isLoading: catsLoading } = useMultiCat();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showVetSharing, setShowVetSharing] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

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
    setSelectedEntry(entry);
    setShowVetSharing(true);
  };

  const handleVetSharingClose = () => {
    setShowVetSharing(false);
    setSelectedEntry(null);
  };

  // ナビゲーションメニューの定義
  const navigationMenus = [
    {
      category: '基本機能',
      items: [
        { id: 'dashboard' as ViewMode, label: '🏠 ダッシュボード', description: '健康状態の総合表示' },
        { id: 'entries' as ViewMode, label: '📝 記録一覧', description: '日記エントリーの管理' },
        { id: 'analytics' as ViewMode, label: '📊 基本分析', description: '統計・グラフ表示' },
      ]
    },
    {
      category: '多頭飼い管理',
      items: [
        { id: 'cat-profile' as ViewMode, label: '🐱 猫プロファイル', description: '猫の基本情報管理' },
        { id: 'cat-comparison' as ViewMode, label: '⚖️ 猫間比較', description: '複数猫の比較分析' },
      ]
    },
    {
      category: '高度分析',
      items: [
        { id: 'advanced-analytics' as ViewMode, label: '🔮 AI予測分析', description: 'AI による健康予測' },
        { id: 'behavior-analysis' as ViewMode, label: '🎾 行動分析', description: '行動パターン詳細分析' },
      ]
    },
    {
      category: 'ソーシャル・共有',
      items: [
        { id: 'vet-sharing' as ViewMode, label: '🏥 獣医師連携', description: '獣医師との記録共有' },
        { id: 'family-manager' as ViewMode, label: '👥 家族管理', description: '家族メンバー招待・管理' },
      ]
    },
    {
      category: 'ツール・設定',
      items: [
        { id: 'reminders' as ViewMode, label: '⏰ リマインダー', description: '健康管理リマインダー' },
        { id: 'notifications' as ViewMode, label: '🔔 通知センター', description: 'PWA通知・アラート管理' },
        { id: 'reports' as ViewMode, label: '📄 レポート生成', description: 'PDF・CSV出力' },
      ]
    }
  ];

  const getCurrentViewTitle = () => {
    for (const menu of navigationMenus) {
      const item = menu.items.find(item => item.id === viewMode);
      if (item) return item.label;
    }
    return '🏠 ダッシュボード';
  };

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'dashboard':
        return <Dashboard entries={entries} />;
      
      case 'entries':
        return (
          <EntryList
            entries={entries}
            onEntryClick={handleEntryClick}
            onEntryEdit={setEditingEntry}
            onEntryDelete={setDeletingEntry}
          />
        );
      
      case 'analytics':
        return <Analytics entries={entries} />;
      
      case 'advanced-analytics':
        return <AdvancedAnalytics />;
      
      case 'behavior-analysis':
        return <BehaviorAnalysis entries={entries} />;
      
      case 'cat-comparison':
        return <CatComparison />;
      
      case 'cat-profile':
        return <CatProfileManager />;
      
      case 'vet-sharing':
        return (
          <div className="vet-sharing-container">
            <h3>獣医師連携</h3>
            <p>記録をクリックして獣医師と共有できます。</p>
            <EntryList
              entries={entries}
              onEntryClick={handleEntryClick}
              onEntryEdit={setEditingEntry}
              onEntryDelete={setDeletingEntry}
            />
          </div>
        );
      
      case 'family-manager':
        return <FamilyManager />;
      
      case 'notifications':
        return (
          <NotificationCenter
            reminders={reminders}
            alerts={alerts}
            onUpdateReminders={setReminders}
            onUpdateAlerts={setAlerts}
          />
        );
      
      case 'reminders':
        return (
          <div className="reminders-wrapper">
            <h3>⏰ リマインダー管理</h3>
            <p>リマインダー機能は開発中です。近日中に実装予定です。</p>
          </div>
        );
      
      case 'reports':
        return <ReportGenerator entries={entries} />;
      
      default:
        return <Dashboard entries={entries} />;
    }
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
        <div className="header-top">
          <h1>🐱 猫日記 🐱</h1>
          <div className="header-controls">
            <ThemeToggle />
          </div>
        </div>

        {/* 猫選択コンポーネント */}
        <CatSelector />
        
        {activeCat ? (
          <div className="main-navigation">
            <div className="current-view">
              <h2>{getCurrentViewTitle()}</h2>
              <div className="view-stats">
                <span className="total-entries">{entries.length}件の記録</span>
                {viewMode === 'entries' && (
                  <button 
                    className="add-entry-btn"
                    onClick={() => setIsAddingEntry(true)}
                  >
                    + 新しい記録
                  </button>
                )}
              </div>
            </div>
            
            <nav className="navigation-menu">
              {navigationMenus.map((menu) => (
                <div key={menu.category} className="nav-category">
                  <h3 className="category-title">{menu.category}</h3>
                  <div className="nav-items">
                    {menu.items.map((item) => (
                      <button
                        key={item.id}
                        className={`nav-item ${viewMode === item.id ? 'active' : ''}`}
                        onClick={() => setViewMode(item.id)}
                        title={item.description}
                      >
                        <span className="nav-label">{item.label}</span>
                        <span className="nav-description">{item.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        ) : (
          <div className="no-cat-selected">
            <div className="no-cat-content">
              <span className="no-cat-icon">🐱</span>
              <h3>猫を選択または登録してください</h3>
              <p>多頭飼い対応の猫日記で、愛猫の健康と成長を記録しましょう</p>
            </div>
          </div>
        )}
      </header>

      {activeCat && (
        <main className="main-content">
          {isAddingEntry && (
            <div className="modal-overlay">
              <NewEntryForm
                onSave={handleAddEntry}
                onCancel={() => setIsAddingEntry(false)}
              />
            </div>
          )}

          {editingEntry && (
            <div className="modal-overlay">
              <EditEntryForm
                entry={editingEntry}
                onSave={handleEditEntry}
                onCancel={() => setEditingEntry(null)}
              />
            </div>
          )}

          {showVetSharing && selectedEntry && (
            <VetSharingPanel
              entry={selectedEntry}
              onClose={handleVetSharingClose}
            />
          )}

          <div className="content-area">
            {renderCurrentView()}
          </div>
        </main>
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