import React from 'react';
import { DiaryEntry } from '../../types';
import { BehaviorAnalyzer } from '../../utils/behaviorAnalyzer';
import './BehaviorAnalysis.css';

interface BehaviorAnalysisProps {
  entries: DiaryEntry[];
}

const BehaviorAnalysis: React.FC<BehaviorAnalysisProps> = ({ entries }) => {
  const sleepAnalysis = BehaviorAnalyzer.analyzeSleepPatterns(entries);
  const playAnalysis = BehaviorAnalyzer.analyzePlayPatterns(entries);
  const locationAnalysis = BehaviorAnalyzer.analyzeLocationPatterns(entries);
  const timeAnalysis = BehaviorAnalyzer.analyzeActivityTimePatterns(entries);
  const insights = BehaviorAnalyzer.generateBehaviorInsights(entries);

  const formatSleepQuality = (quality: any): string => {
    if (quality.consistency >= 80) return '非常に良い';
    if (quality.consistency >= 60) return '良い';
    if (quality.consistency >= 40) return '普通';
    if (quality.consistency >= 20) return 'やや心配';
    return '要注意';
  };

  const formatPlayEngagement = (engagement: number): string => {
    if (engagement >= 80) return '非常に活発';
    if (engagement >= 60) return '活発';
    if (engagement >= 40) return '普通';
    if (engagement >= 20) return 'やや不活発';
    return '要注意';
  };

  const getTopLocation = () => {
    if (locationAnalysis.favoriteLocations.length === 0) return 'データなし';
    const topLocation = locationAnalysis.favoriteLocations[0];
    return `${topLocation.location} (${topLocation.percentage}%)`;
  };

  const getMostActiveTime = () => {
    if (timeAnalysis.peakActivityHours.length === 0) return 'データなし';
    return `${timeAnalysis.peakActivityHours[0]}時台`;
  };

  return (
    <div className="behavior-analysis">
      <h2>行動パターン分析</h2>
      
      <div className="analysis-grid">
        <div className="analysis-card sleep-analysis">
          <h3>睡眠分析</h3>
          <div className="metric-row">
            <span className="metric-label">平均睡眠時間:</span>
            <span className="metric-value">{sleepAnalysis.averageSleepHours.toFixed(1)}時間</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">睡眠品質:</span>
            <span className="metric-value quality-score">
              {formatSleepQuality(sleepAnalysis.sleepQuality)}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-label">睡眠パターン:</span>
            <span className="metric-value">{sleepAnalysis.sleepQuality.duration}</span>
          </div>
        </div>

        <div className="analysis-card play-analysis">
          <h3>遊び分析</h3>
          <div className="metric-row">
            <span className="metric-label">平均遊び時間:</span>
            <span className="metric-value">{playAnalysis.averagePlayTime.toFixed(1)}時間</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">活動度:</span>
            <span className="metric-value engagement-score">
              {formatPlayEngagement(playAnalysis.playQuality.engagement)}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-label">遊び頻度:</span>
            <span className="metric-value">
              {playAnalysis.playQuality.frequency}
            </span>
          </div>
        </div>

        <div className="analysis-card location-analysis">
          <h3>場所分析</h3>
          <div className="metric-row">
            <span className="metric-label">お気に入りの場所:</span>
            <span className="metric-value">{getTopLocation()}</span>
          </div>
          <div className="location-list">
            {locationAnalysis.favoriteLocations.slice(0, 3).map((loc, index) => (
              <div key={index} className="location-item">
                <span className="location-name">{loc.location}</span>
                <div className="location-bar">
                  <div 
                    className="location-fill" 
                    style={{ width: `${loc.percentage}%` }}
                  ></div>
                </div>
                <span className="location-percentage">{loc.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-card time-analysis">
          <h3>時間帯分析</h3>
          <div className="metric-row">
            <span className="metric-label">最も活発な時間:</span>
            <span className="metric-value">{getMostActiveTime()}</span>
          </div>
          <div className="time-chart">
            {Object.entries(timeAnalysis.activityDistribution).map(([period, value]) => (
              <div key={period} className="time-bar">
                <span className="time-label">{period}</span>
                <div className="time-bar-container">
                  <div 
                    className="time-bar-fill" 
                    style={{ 
                      height: `${Math.max(value * 5, 5)}px`,
                      backgroundColor: value > 60 ? '#4CAF50' : value > 30 ? '#FFC107' : '#E0E0E0'
                    }}
                  ></div>
                </div>
                <span className="time-count">{value.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="behavior-insights">
        <h3>行動インサイト</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>全体評価</h4>
            <div className="overall-score">
              <div className="score-circle">
                <span className="score-number">{insights.overallAssessment.behaviorHealth}</span>
              </div>
              <span className="score-status">
                {insights.overallAssessment.behaviorHealth === 'excellent' ? '非常に良い' :
                 insights.overallAssessment.behaviorHealth === 'good' ? '良い' :
                 insights.overallAssessment.behaviorHealth === 'concerning' ? '注意' : '要改善'}
              </span>
            </div>
          </div>

          <div className="insight-card recommendations">
            <h4>おすすめアクション</h4>
            <ul className="recommendation-list">
              {insights.recommendations.map((rec, index) => (
                <li key={index} className="recommendation-item">{rec}</li>
              ))}
            </ul>
          </div>

          <div className="insight-card alerts">
            <h4>注意事項</h4>
            {insights.alerts.length > 0 ? (
              <ul className="alert-list">
                {insights.alerts.map((alert, index) => (
                  <li key={index} className="alert-item">{alert.message}</li>
                ))}
              </ul>
            ) : (
              <p className="no-alerts">特に注意事項はありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorAnalysis;