import React from 'react';
import { TimeDistribution } from '../../utils/nutritionAnalyzer';

interface MealIntervalsChartProps {
  timeDistribution: TimeDistribution;
}

const MealIntervalsChart: React.FC<MealIntervalsChartProps> = ({ timeDistribution }) => {
  const { mealIntervals } = timeDistribution;

  const getIntervalColor = (interval: string): string => {
    switch (interval) {
      case '1-3時間': return '#FF6B6B'; // Red - Too frequent
      case '3-6時間': return '#4ECDC4'; // Teal - Good
      case '6-12時間': return '#45B7D1'; // Blue - Normal
      case '12時間以上': return '#FFA07A'; // Orange - Too long
      default: return '#666';
    }
  };

  const getIntervalRecommendation = (interval: string, count: number, total: number): string => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    switch (interval) {
      case '1-3時間':
        return percentage > 30 ? '食事間隔が短すぎる可能性があります' : '適度な間食程度です';
      case '3-6時間':
        return '理想的な食事間隔です';
      case '6-12時間':
        return '一般的な食事間隔です';
      case '12時間以上':
        return percentage > 20 ? '食事間隔が長すぎる可能性があります' : '時々の長い間隔は問題ありません';
      default:
        return '';
    }
  };

  const formatHours = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}分`;
    }
    return `${hours.toFixed(1)}時間`;
  };

  const getIntervalStatus = (avgInterval: number): { status: string; color: string; message: string } => {
    if (avgInterval < 3) {
      return {
        status: '頻繁',
        color: '#FF6B6B',
        message: '食事間隔が短めです。間食が多い可能性があります。'
      };
    } else if (avgInterval >= 3 && avgInterval <= 8) {
      return {
        status: '理想的',
        color: '#4CAF50',
        message: '適切な食事間隔を保っています。'
      };
    } else if (avgInterval > 8 && avgInterval <= 12) {
      return {
        status: '長め',
        color: '#FFC107',
        message: '食事間隔がやや長めです。'
      };
    } else {
      return {
        status: '心配',
        color: '#F44336',
        message: '食事間隔が長すぎます。食欲不振の可能性があります。'
      };
    }
  };

  const totalIntervals = Object.values(mealIntervals.distribution).reduce((sum, count) => sum + count, 0);
  const intervalStatus = getIntervalStatus(mealIntervals.average);

  return (
    <div className="meal-intervals-chart">
      {/* Interval Summary */}
      <div className="interval-summary">
        <div className="summary-card">
          <div className="summary-main">
            <span className="summary-icon">⏱️</span>
            <div className="summary-details">
              <span className="summary-value">{formatHours(mealIntervals.average)}</span>
              <span className="summary-label">平均間隔</span>
            </div>
            <div className="summary-status">
              <span 
                className="status-badge"
                style={{ backgroundColor: intervalStatus.color }}
              >
                {intervalStatus.status}
              </span>
            </div>
          </div>
          <p className="summary-message">{intervalStatus.message}</p>
        </div>
      </div>

      {/* Interval Distribution */}
      <div className="interval-distribution">
        <h4>📊 食事間隔の分布</h4>
        <div className="interval-chart">
          {Object.entries(mealIntervals.distribution).map(([interval, count]) => {
            const percentage = totalIntervals > 0 ? (count / totalIntervals) * 100 : 0;
            return (
              <div key={interval} className="interval-item">
                <div className="interval-header">
                  <span className="interval-label">{interval}</span>
                  <span className="interval-percentage">{percentage.toFixed(1)}%</span>
                </div>
                <div className="interval-bar">
                  <div 
                    className="interval-fill"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: getIntervalColor(interval)
                    }}
                  ></div>
                </div>
                <div className="interval-details">
                  <span className="interval-count">{count}回</span>
                  <span className="interval-recommendation">
                    {getIntervalRecommendation(interval, count, totalIntervals)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Min/Max Intervals */}
      <div className="interval-range">
        <div className="range-item">
          <span className="range-icon">⚡</span>
          <div className="range-content">
            <span className="range-label">最短間隔</span>
            <span className="range-value">{formatHours(mealIntervals.shortest)}</span>
          </div>
        </div>
        <div className="range-item">
          <span className="range-icon">🐌</span>
          <div className="range-content">
            <span className="range-label">最長間隔</span>
            <span className="range-value">{formatHours(mealIntervals.longest)}</span>
          </div>
        </div>
        <div className="range-item">
          <span className="range-icon">📈</span>
          <div className="range-content">
            <span className="range-label">記録された間隔</span>
            <span className="range-value">{totalIntervals}回</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="interval-recommendations">
        <h4>💡 推奨事項</h4>
        <div className="recommendations-list">
          {mealIntervals.average < 3 && (
            <div className="recommendation-item warning">
              <span className="rec-icon">⚠️</span>
              <span>食事間隔が短すぎます。おやつや間食を控えめにしましょう。</span>
            </div>
          )}
          {mealIntervals.average >= 3 && mealIntervals.average <= 8 && (
            <div className="recommendation-item positive">
              <span className="rec-icon">✅</span>
              <span>理想的な食事間隔を保っています。このペースを維持しましょう。</span>
            </div>
          )}
          {mealIntervals.average > 12 && (
            <div className="recommendation-item warning">
              <span className="rec-icon">🚨</span>
              <span>食事間隔が長すぎます。食欲不振の可能性があるため、獣医師に相談してください。</span>
            </div>
          )}
          
          {/* General recommendations */}
          <div className="recommendation-item info">
            <span className="rec-icon">💡</span>
            <span>成猫の理想的な食事間隔は4-6時間です。規則正しい食事時間を心がけましょう。</span>
          </div>
        </div>
      </div>

      {/* Meal Timing Tips */}
      <div className="timing-tips">
        <h4>🕐 食事タイミングのコツ</h4>
        <div className="tips-grid">
          <div className="tip-item">
            <span className="tip-icon">🌅</span>
            <div className="tip-content">
              <span className="tip-title">朝食</span>
              <span className="tip-text">7-9時頃が理想的</span>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🌇</span>
            <div className="tip-content">
              <span className="tip-title">夕食</span>
              <span className="tip-text">17-19時頃が理想的</span>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">⏰</span>
            <div className="tip-content">
              <span className="tip-title">規則性</span>
              <span className="tip-text">毎日同じ時間に</span>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🚫</span>
            <div className="tip-content">
              <span className="tip-title">夜食</span>
              <span className="tip-text">22時以降は控えめに</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealIntervalsChart;