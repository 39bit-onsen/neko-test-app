import React, { useState, useEffect } from 'react';
import { DiaryEntry, Reminder, Alert } from '../types';
import { storageManager } from '../utils/storage';
import { useMultiCat } from '../contexts/MultiCatContext';
import { useLanguage } from '../contexts/LanguageContext';
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
import SocialHub from './Social/SocialHub';
import NotificationCenter from './PWA/NotificationCenter';
import ReportGenerator from './Reports/ReportGenerator';
import Dashboard from './Dashboard/Dashboard';
import ConfirmDialog from './ConfirmDialog/ConfirmDialog';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import LanguageToggle from './LanguageToggle/LanguageToggle';
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
  | 'social-hub'
  | 'notifications'
  | 'reminders'
  | 'reports';

const CatDiary: React.FC = () => {
  const { activeCat, activeCatId, isLoading: catsLoading } = useMultiCat();
  const { t } = useLanguage();
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
      alert(t('errors.deleteFailed'));
    }
  };

  const handleEntryClick = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setShowVetSharing(true);
  };


  // ナビゲーションメニューの定義
  const navigationMenus = [
    {
      category: t('navigation.categories.basic'),
      items: [
        { id: 'dashboard' as ViewMode, label: `🏠 ${t('navigation.dashboard')}`, description: t('navigation.dashboardDesc') },
        { id: 'entries' as ViewMode, label: `📝 ${t('navigation.entries')}`, description: t('navigation.entriesDesc') },
        { id: 'analytics' as ViewMode, label: `📊 ${t('navigation.analytics')}`, description: t('navigation.analyticsDesc') },
      ]
    },
    {
      category: t('navigation.categories.multiCat'),
      items: [
        { id: 'cat-profile' as ViewMode, label: `🐱 ${t('navigation.catProfile')}`, description: t('navigation.catProfileDesc') },
        { id: 'cat-comparison' as ViewMode, label: `⚖️ ${t('navigation.catComparison')}`, description: t('navigation.catComparisonDesc') },
      ]
    },
    {
      category: t('navigation.categories.advanced'),
      items: [
        { id: 'advanced-analytics' as ViewMode, label: `🔮 ${t('navigation.aiAnalytics')}`, description: t('navigation.aiAnalyticsDesc') },
        { id: 'behavior-analysis' as ViewMode, label: `🎾 ${t('navigation.behaviorAnalysis')}`, description: t('navigation.behaviorAnalysisDesc') },
      ]
    },
    {
      category: t('navigation.categories.social'),
      items: [
        { id: 'social-hub' as ViewMode, label: `🤝 ${t('navigation.socialHub')}`, description: t('navigation.socialHubDesc') },
        { id: 'vet-sharing' as ViewMode, label: `🏥 ${t('navigation.vetSharing')}`, description: t('navigation.vetSharingDesc') },
        { id: 'family-manager' as ViewMode, label: `👥 ${t('navigation.familyManager')}`, description: t('navigation.familyManagerDesc') },
      ]
    },
    {
      category: t('navigation.categories.tools'),
      items: [
        { id: 'reminders' as ViewMode, label: `⏰ ${t('navigation.reminders')}`, description: t('navigation.remindersDesc') },
        { id: 'notifications' as ViewMode, label: `🔔 ${t('navigation.notifications')}`, description: t('navigation.notificationsDesc') },
        { id: 'reports' as ViewMode, label: `📄 ${t('navigation.reports')}`, description: t('navigation.reportsDesc') },
      ]
    }
  ];

  const getCurrentViewTitle = () => {
    for (const menu of navigationMenus) {
      const item = menu.items.find(item => item.id === viewMode);
      if (item) return item.label;
    }
    return `🏠 ${t('navigation.dashboard')}`;
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
            <div className="vet-sharing-header">
              <h3>🏥 {t('navigation.vetSharing')}</h3>
              <p>{t('vet.sharingDescription')}</p>
            </div>
            <EntryList
              entries={entries}
              onEntryClick={(entry) => {
                setSelectedEntry(entry);
                setShowVetSharing(true);
              }}
              onEntryEdit={setEditingEntry}
              onEntryDelete={setDeletingEntry}
            />
          </div>
        );
      
      case 'family-manager':
        return <FamilyManager />;
      
      case 'social-hub':
        return <SocialHub entries={entries} />;
      
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
            <h3>⏰ {t('navigation.reminders')}</h3>
            <p>{t('reminders.developmentMessage')}</p>
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
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cat-diary">
      <header className="diary-header">
        <div className="header-top">
          <h1>🐱 {t('app.title')} 🐱</h1>
          <div className="header-controls">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* 猫選択コンポーネント */}
        <div className="cat-selector-section">
          <CatSelector 
            showStats={true}
            onManageClick={() => setViewMode('cat-profile')}
          />
        </div>
        
        {activeCat ? (
          <div className="main-navigation">
            <div className="current-view">
              <h2>{getCurrentViewTitle()}</h2>
              <div className="view-stats">
                <span className="total-entries">{t('entries.totalCount', { count: entries.length })}</span>
                {viewMode === 'entries' && (
                  <button 
                    className="add-entry-btn"
                    onClick={() => setIsAddingEntry(true)}
                  >
                    + {t('entries.addNew')}
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
              <h3>{t('cats.selectOrRegister')}</h3>
              <p>{t('cats.multiCatDescription')}</p>
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
            <div className="modal-overlay">
              <VetSharingPanel
                entry={selectedEntry}
                onClose={() => setShowVetSharing(false)}
              />
            </div>
          )}

          <div className="content-area">
            {renderCurrentView()}
          </div>
        </main>
      )}

      <ConfirmDialog
        isOpen={!!deletingEntry}
        title={t('entries.deleteTitle')}
        message={`${t('entries.deleteMessage', { 
          title: deletingEntry?.type === 'free' ? (deletingEntry.data as any).title : t(`entries.types.${deletingEntry?.type}`) 
        })}`}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleDeleteEntry}
        onCancel={() => setDeletingEntry(null)}
        type="danger"
      />
    </div>
  );
};

export default CatDiary;