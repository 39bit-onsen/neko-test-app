import React from 'react';
import { NutritionInsights } from '../../utils/nutritionAnalyzer';

interface NutritionInsightsWidgetProps {
  insights: NutritionInsights;
}

const NutritionInsightsWidget: React.FC<NutritionInsightsWidgetProps> = ({ insights }) => {
  const { weeklyTrends, recommendations, alerts } = insights;

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'improving':
      case 'increasing':
      case 'more_regular':
        return '📈';
      case 'declining':
      case 'decreasing':
      case 'less_regular':
        return '📉';
      default:
        return '➖';
    }
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'improving':
      case 'increasing':
      case 'more_regular':
        return '#4CAF50';
      case 'declining':
      case 'decreasing':
      case 'less_regular':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getTrendLabel = (category: string, trend: string): string => {
    const labels: { [key: string]: { [key: string]: string } } = {
      appetite: {
        improving: '改善中',
        stable: '安定',
        declining: '低下中'
      },
      consumption: {
        increasing: '増加中',
        stable: '安定',
        decreasing: '減少中'
      },
      regularity: {
        more_regular: '規則的に',
        stable: '安定',
        less_regular: '不規則に'
      }
    };
    return labels[category]?.[trend] || trend;
  };

  const getAlertIcon = (type: string): string => {
    return type === 'warning' ? '⚠️' : 'ℹ️';
  };

  const getAlertColor = (type: string): string => {
    return type === 'warning' ? '#FF9800' : '#2196F3';
  };

  return (
    <div className="nutrition-insights-widget">
      <div className="insights-header">
        <h3>🔍 栄養・食事の洞察</h3>
        <span className="insights-period">過去2週間の分析</span>
      </div>

      {/* Weekly Trends */}
      <div className="trends-section">
        <h4>📊 週間トレンド</h4>
        <div className="trends-grid">
          <div className="trend-item">
            <div className="trend-header">
              <span className="trend-icon">😋</span>
              <span className="trend-title">食欲</span>
            </div>
            <div className="trend-status">
              <span 
                className="trend-indicator"
                style={{ color: getTrendColor(weeklyTrends.appetite) }}
              >
                {getTrendIcon(weeklyTrends.appetite)}
              </span>
              <span 
                className="trend-label"
                style={{ color: getTrendColor(weeklyTrends.appetite) }}
              >
                {getTrendLabel('appetite', weeklyTrends.appetite)}
              </span>
            </div>
          </div>

          <div className="trend-item">
            <div className="trend-header">
              <span className="trend-icon">🍽️</span>
              <span className="trend-title">摂取量</span>
            </div>
            <div className="trend-status">
              <span 
                className="trend-indicator"
                style={{ color: getTrendColor(weeklyTrends.consumption) }}
              >
                {getTrendIcon(weeklyTrends.consumption)}
              </span>
              <span 
                className="trend-label"
                style={{ color: getTrendColor(weeklyTrends.consumption) }}
              >
                {getTrendLabel('consumption', weeklyTrends.consumption)}
              </span>
            </div>
          </div>

          <div className="trend-item">
            <div className="trend-header">
              <span className="trend-icon">⏰</span>
              <span className="trend-title">規則性</span>
            </div>
            <div className="trend-status">
              <span 
                className="trend-indicator"
                style={{ color: getTrendColor(weeklyTrends.regularity) }}
              >
                {getTrendIcon(weeklyTrends.regularity)}
              </span>
              <span 
                className="trend-label"
                style={{ color: getTrendColor(weeklyTrends.regularity) }}
              >
                {getTrendLabel('regularity', weeklyTrends.regularity)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h4>🔔 アラート</h4>
          <div className="alerts-list">
            {alerts.map((alert, index) => (
              <div 
                key={index}
                className={`alert-item ${alert.type}`}
                style={{ borderLeftColor: getAlertColor(alert.type) }}
              >
                <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                <span className="alert-message">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h4>💡 推奨事項</h4>
          <div className="recommendations-list">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <span className="recommendation-icon">💡</span>
                <span className="recommendation-text">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Summary */}
      <div className="summary-section">
        <div className="summary-card">
          <div className="summary-header">
            <span className="summary-icon">📋</span>
            <span className="summary-title">総合評価</span>
          </div>
          <div className="summary-content">
            {(() => {
              const positiveCount = [
                weeklyTrends.appetite === 'improving',
                weeklyTrends.consumption === 'increasing',
                weeklyTrends.regularity === 'more_regular'
              ].filter(Boolean).length;

              const negativeCount = [
                weeklyTrends.appetite === 'declining',
                weeklyTrends.consumption === 'decreasing', 
                weeklyTrends.regularity === 'less_regular'
              ].filter(Boolean).length;

              if (positiveCount >= 2) {
                return (
                  <div className="summary-message positive">
                    <span className="summary-emoji">😸</span>
                    <span>食事習慣が改善されています！この調子を維持しましょう。</span>
                  </div>
                );
              } else if (negativeCount >= 2) {
                return (
                  <div className="summary-message negative">
                    <span className="summary-emoji">😿</span>
                    <span>食事習慣に気になる変化があります。注意深く観察しましょう。</span>
                  </div>
                );
              } else {
                return (
                  <div className="summary-message neutral">
                    <span className="summary-emoji">😺</span>
                    <span>食事習慣は安定しています。引き続き記録を続けましょう。</span>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionInsightsWidget;