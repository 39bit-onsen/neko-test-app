import React from 'react';
import { DiaryEntry } from '../../types';
import { BasicStats } from '../../utils/analytics';

interface QuickStatsWidgetProps {
  entries: DiaryEntry[];
}

const QuickStatsWidget: React.FC<QuickStatsWidgetProps> = ({ entries }) => {
  const recentEntries = BasicStats.filterEntriesByDateRange(entries, 7);
  const stats = BasicStats.calculateBasicStats(entries);
  const recentStats = BasicStats.calculateBasicStats(recentEntries);

  const StatItem: React.FC<{
    icon: string;
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
    subtitle?: string;
  }> = ({ icon, label, value, trend, subtitle }) => (
    <div className="stat-item">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-header">
          <span className="stat-label">{label}</span>
          {trend && (
            <span className={`stat-trend ${trend}`}>
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
            </span>
          )}
        </div>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  const getRecordingStreak = (): number => {
    if (entries.length === 0) return 0;
    
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else if (diffDays === streak + 1) {
        // Allow for gaps of 1 day
        streak += 2;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const recordingStreak = getRecordingStreak();
  const weeklyChange = recentStats.totalEntries - (stats.totalEntries - recentStats.totalEntries);

  return (
    <div className="quick-stats-widget">
      <div className="widget-header">
        <h3>📊 クイック統計</h3>
        <span className="period-label">過去7日間</span>
      </div>
      
      <div className="stats-grid">
        <StatItem
          icon="📝"
          label="総記録数"
          value={stats.totalEntries}
          subtitle="全期間"
        />
        
        <StatItem
          icon="🗓️"
          label="今週の記録"
          value={recentStats.totalEntries}
          trend={weeklyChange > 0 ? 'up' : weeklyChange < 0 ? 'down' : 'stable'}
          subtitle="件"
        />
        
        <StatItem
          icon="🔥"
          label="記録継続"
          value={recordingStreak}
          subtitle="日連続"
        />
        
        <StatItem
          icon="📈"
          label="週平均"
          value={stats.weeklyAverage}
          subtitle="件/週"
        />
      </div>
      
      <div className="type-breakdown">
        <h4>記録タイプ別（今週）</h4>
        <div className="type-stats">
          <div className="type-stat">
            <span className="type-icon">🍽️</span>
            <span className="type-label">食事</span>
            <span className="type-count">{recentStats.typeDistribution.food || 0}</span>
          </div>
          <div className="type-stat">
            <span className="type-icon">💊</span>
            <span className="type-label">健康</span>
            <span className="type-count">{recentStats.typeDistribution.health || 0}</span>
          </div>
          <div className="type-stat">
            <span className="type-icon">🎾</span>
            <span className="type-label">行動</span>
            <span className="type-count">{recentStats.typeDistribution.behavior || 0}</span>
          </div>
          <div className="type-stat">
            <span className="type-icon">📝</span>
            <span className="type-label">自由</span>
            <span className="type-count">{recentStats.typeDistribution.free || 0}</span>
          </div>
        </div>
      </div>
      
      {recordingStreak >= 7 && (
        <div className="achievement">
          <span className="achievement-icon">🏆</span>
          <span className="achievement-text">
            {recordingStreak >= 30 ? '記録マスター！' :
             recordingStreak >= 14 ? '継続の力！' : '順調な記録！'}
          </span>
        </div>
      )}
    </div>
  );
};

export default QuickStatsWidget;