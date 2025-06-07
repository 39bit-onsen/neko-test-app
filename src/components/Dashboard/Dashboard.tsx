import React, { useState, useEffect } from 'react';
import { DiaryEntry } from '../../types';
import { HealthScoreCalculator, HealthScore, HealthAlert } from '../../utils/healthScore';
import { BasicStats } from '../../utils/analytics';
import { useLanguage } from '../../contexts/LanguageContext';
import HealthScoreWidget from './HealthScoreWidget';
import AlertsWidget from './AlertsWidget';
import QuickStatsWidget from './QuickStatsWidget';
import RecentTrendsWidget from './RecentTrendsWidget';
import './Dashboard.css';

interface DashboardProps {
  entries: DiaryEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ entries }) => {
  const { t, currentLanguage } = useLanguage();
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    calculateHealthMetrics();
  }, [entries]);

  const calculateHealthMetrics = () => {
    setIsLoading(true);
    
    try {
      if (entries.length === 0) {
        setHealthScore(null);
        setAlerts([]);
        setIsLoading(false);
        return;
      }

      // Calculate health score
      const score = HealthScoreCalculator.calculateOverallScore(entries);
      setHealthScore(score);

      // Generate alerts
      const generatedAlerts = HealthScoreCalculator.generateHealthAlerts(entries, score);
      setAlerts(generatedAlerts);

    } catch (error) {
      console.error('Error calculating health metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>{t('dashboard.analyzingData')}</p>
        </div>
      </div>
    );
  }

  if (!healthScore || entries.length === 0) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>🏥 {t('dashboard.title')}</h2>
        </div>
        <div className="no-data-dashboard">
          <div className="no-data-icon">📊</div>
          <h3>{t('dashboard.insufficientData')}</h3>
          <p>{t('dashboard.needMoreRecords')}</p>
          <div className="data-requirements">
            <h4>{t('dashboard.recommendedRecords')}:</h4>
            <ul>
              <li>🍽️ {t('dashboard.recommendedFood')}</li>
              <li>💊 {t('dashboard.recommendedHealth')}</li>
              <li>🎾 {t('dashboard.recommendedBehavior')}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🏥 {t('dashboard.title')}</h2>
        <div className="last-updated">
          {t('dashboard.lastUpdated')}: {healthScore.lastUpdated.toLocaleString(currentLanguage === 'zh' ? 'zh-CN' : currentLanguage === 'ko' ? 'ko-KR' : currentLanguage === 'af' ? 'en-ZA' : currentLanguage === 'en' ? 'en-US' : 'ja-JP')}
        </div>
      </div>

      {alerts.length > 0 && (
        <AlertsWidget 
          alerts={alerts} 
          onDismiss={dismissAlert}
        />
      )}

      <div className="dashboard-grid">
        <div className="widget-row main-score">
          <HealthScoreWidget healthScore={healthScore} />
        </div>
        
        <div className="widget-row secondary">
          <QuickStatsWidget entries={entries} />
          <RecentTrendsWidget entries={entries} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;