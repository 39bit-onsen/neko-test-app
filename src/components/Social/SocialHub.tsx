import React, { useState } from 'react';
import VetSharingPanel from './VetSharingPanel';
import FamilyManager from './FamilyManager';
import { DiaryEntry } from '../../types';
import './SocialHub.css';

interface SocialHubProps {
  entries: DiaryEntry[];
}

type SocialTab = 'overview' | 'vet-sharing' | 'family-manager';

const SocialHub: React.FC<SocialHubProps> = ({ entries }) => {
  const [activeTab, setActiveTab] = useState<SocialTab>('overview');
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showVetPanel, setShowVetPanel] = useState(false);

  const handleShareWithVet = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setShowVetPanel(true);
  };

  const renderOverview = () => (
    <div className="social-overview">
      <div className="overview-header">
        <h2>🤝 ソーシャル機能</h2>
        <p>獣医師や家族と連携して、愛猫の健康管理を共有しましょう</p>
      </div>

      <div className="social-features">
        <div className="feature-card vet-feature">
          <div className="feature-icon">🏥</div>
          <div className="feature-content">
            <h3>獣医師連携</h3>
            <p>記録を獣医師と共有し、専門的なアドバイスを受けられます</p>
            <ul>
              <li>記録の共有</li>
              <li>相談の作成</li>
              <li>コメント機能</li>
              <li>緊急相談対応</li>
            </ul>
            <button
              className="feature-btn"
              onClick={() => setActiveTab('vet-sharing')}
            >
              獣医師連携を開始
            </button>
          </div>
        </div>

        <div className="feature-card family-feature">
          <div className="feature-icon">👥</div>
          <div className="feature-content">
            <h3>家族管理</h3>
            <p>家族や友人を招待して、一緒に猫のケアを管理できます</p>
            <ul>
              <li>メンバー招待</li>
              <li>権限管理</li>
              <li>通知設定</li>
              <li>共有設定</li>
            </ul>
            <button
              className="feature-btn"
              onClick={() => setActiveTab('family-manager')}
            >
              家族管理を開始
            </button>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>📈 最近の共有活動</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">🏥</div>
            <div className="activity-content">
              <p><strong>Dr. 田中</strong>からコメントが投稿されました</p>
              <span className="activity-time">2時間前</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">👥</div>
            <div className="activity-content">
              <p><strong>山田花子</strong>が家族メンバーとして参加しました</p>
              <span className="activity-time">1日前</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">📤</div>
            <div className="activity-content">
              <p>健康記録を<strong>Dr. 田中</strong>と共有しました</p>
              <span className="activity-time">3日前</span>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>⚡ クイックアクション</h3>
        <div className="actions-grid">
          <button
            className="quick-action-btn"
            onClick={() => setActiveTab('vet-sharing')}
          >
            <span className="action-icon">🏥</span>
            <span className="action-label">獣医師と相談</span>
          </button>
          <button
            className="quick-action-btn"
            onClick={() => setActiveTab('family-manager')}
          >
            <span className="action-icon">👥</span>
            <span className="action-label">家族を招待</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">📤</span>
            <span className="action-label">記録をエクスポート</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">🔔</span>
            <span className="action-label">通知設定</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderVetSharing = () => (
    <div className="vet-sharing-section">
      <div className="section-header">
        <h2>🏥 獣医師連携</h2>
        <p>記録を選択して獣医師と共有・相談できます</p>
      </div>

      <div className="entries-for-sharing">
        <h3>記録一覧</h3>
        <div className="entries-grid">
          {entries.slice(0, 10).map(entry => (
            <div key={entry.id} className="share-entry-card">
              <div className="entry-header">
                <span className="entry-type">{getEntryTypeLabel(entry.type)}</span>
                <span className="entry-date">{formatDate(entry.date)}</span>
              </div>
              <div className="entry-summary">
                {renderEntryPreview(entry)}
              </div>
              <button
                className="share-btn"
                onClick={() => handleShareWithVet(entry)}
              >
                🏥 獣医師と共有
              </button>
            </div>
          ))}
        </div>
        {entries.length === 0 && (
          <div className="no-entries">
            <p>共有できる記録がありません。</p>
            <p>まず記録を追加してください。</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="social-hub">
      <div className="hub-navigation">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          🏠 概要
        </button>
        <button
          className={`tab-btn ${activeTab === 'vet-sharing' ? 'active' : ''}`}
          onClick={() => setActiveTab('vet-sharing')}
        >
          🏥 獣医師連携
        </button>
        <button
          className={`tab-btn ${activeTab === 'family-manager' ? 'active' : ''}`}
          onClick={() => setActiveTab('family-manager')}
        >
          👥 家族管理
        </button>
      </div>

      <div className="hub-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'vet-sharing' && renderVetSharing()}
        {activeTab === 'family-manager' && <FamilyManager />}
      </div>

      {showVetPanel && selectedEntry && (
        <div className="modal-overlay">
          <VetSharingPanel
            entry={selectedEntry}
            onClose={() => {
              setShowVetPanel(false);
              setSelectedEntry(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

const getEntryTypeLabel = (type: string): string => {
  const labels = {
    food: '🍽️ 食事',
    health: '🏥 健康',
    behavior: '🎾 行動',
    free: '📝 自由記録'
  };
  return labels[type as keyof typeof labels] || type;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const renderEntryPreview = (entry: DiaryEntry): React.ReactNode => {
  switch (entry.type) {
    case 'health':
      const healthData = entry.data as any;
      return (
        <div className="health-preview">
          {healthData.weight && <span>体重: {healthData.weight}kg</span>}
          {healthData.temperature && <span>体温: {healthData.temperature}°C</span>}
          {healthData.symptoms.length > 0 && (
            <span>症状: {healthData.symptoms.slice(0, 2).join(', ')}</span>
          )}
        </div>
      );
    case 'food':
      const foodData = entry.data as any;
      return (
        <div className="food-preview">
          <span>{foodData.foodType}</span>
          <span>食欲: {foodData.appetite}</span>
        </div>
      );
    case 'behavior':
      const behaviorData = entry.data as any;
      return (
        <div className="behavior-preview">
          <span>活動: {behaviorData.activityLevel}</span>
          {behaviorData.sleepHours && <span>睡眠: {behaviorData.sleepHours}h</span>}
        </div>
      );
    default:
      const freeData = entry.data as any;
      return (
        <div className="free-preview">
          <span>{freeData.title}</span>
        </div>
      );
  }
};

export default SocialHub;