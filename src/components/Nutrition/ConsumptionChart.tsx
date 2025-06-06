import React from 'react';
import { ConsumptionStats } from '../../utils/nutritionAnalyzer';

interface ConsumptionChartProps {
  consumptionStats: ConsumptionStats;
}

const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ consumptionStats }) => {
  const { overallCompletionRate, appetiteDistribution, wastageRate } = consumptionStats;

  const getCompletionColor = (rate: number): string => {
    if (rate >= 80) return '#4CAF50'; // Green
    if (rate >= 60) return '#FFC107'; // Yellow
    if (rate >= 40) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getCompletionLabel = (rate: number): string => {
    if (rate >= 90) return '優秀';
    if (rate >= 80) return '良好';
    if (rate >= 70) return 'まずまず';
    if (rate >= 60) return '要改善';
    return '心配';
  };

  const appetiteLabels: { [key: string]: string } = {
    'excellent': '優秀',
    'good': '良好',
    'fair': '普通',
    'poor': '心配',
    'none': '食べない'
  };

  const appetiteColors: { [key: string]: string } = {
    'excellent': '#4CAF50',
    'good': '#8BC34A',
    'fair': '#FFC107',
    'poor': '#FF9800',
    'none': '#F44336'
  };

  const totalAppetiteRecords = Object.values(appetiteDistribution).reduce((sum, count) => sum + count, 0);

  const CircularProgress: React.FC<{ 
    percentage: number; 
    size?: number; 
    strokeWidth?: number;
    color?: string;
  }> = ({ percentage, size = 120, strokeWidth = 12, color = '#4CAF50' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="circular-progress" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            stroke="#e6e6e6"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset: 0 }}
            r={radius}
            cx={size / 2}
            cy={size / 2}
            className="progress-circle"
          />
        </svg>
        <div className="progress-text">
          <span className="progress-percentage">{percentage.toFixed(1)}%</span>
          <span className="progress-label">完食率</span>
        </div>
      </div>
    );
  };

  return (
    <div className="consumption-chart">
      {/* Completion Rate */}
      <div className="completion-section">
        <div className="completion-main">
          <CircularProgress 
            percentage={overallCompletionRate} 
            color={getCompletionColor(overallCompletionRate)}
          />
          <div className="completion-details">
            <div className="completion-status">
              <span className="status-label">評価:</span>
              <span 
                className="status-value"
                style={{ color: getCompletionColor(overallCompletionRate) }}
              >
                {getCompletionLabel(overallCompletionRate)}
              </span>
            </div>
            <div className="wastage-info">
              <span className="wastage-label">食べ残し率:</span>
              <span className="wastage-value">{wastageRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Completion Rate Analysis */}
        <div className="completion-analysis">
          {overallCompletionRate >= 85 && (
            <div className="analysis-message positive">
              <span className="message-icon">👍</span>
              <span>とても良く食べています！健康的な食習慣です。</span>
            </div>
          )}
          {overallCompletionRate >= 70 && overallCompletionRate < 85 && (
            <div className="analysis-message neutral">
              <span className="message-icon">😊</span>
              <span>まずまずの完食率です。</span>
            </div>
          )}
          {overallCompletionRate < 70 && (
            <div className="analysis-message warning">
              <span className="message-icon">⚠️</span>
              <span>食べ残しが気になります。食事量や種類を見直してみましょう。</span>
            </div>
          )}
        </div>
      </div>

      {/* Appetite Distribution */}
      <div className="appetite-section">
        <h4>🍽️ 食欲レベル分布</h4>
        <div className="appetite-chart">
          {Object.entries(appetiteDistribution)
            .sort(([a], [b]) => {
              const order = ['excellent', 'good', 'fair', 'poor', 'none'];
              return order.indexOf(a) - order.indexOf(b);
            })
            .map(([appetite, count]) => {
              const percentage = totalAppetiteRecords > 0 ? (count / totalAppetiteRecords) * 100 : 0;
              return (
                <div key={appetite} className="appetite-item">
                  <div className="appetite-header">
                    <span className="appetite-label">{appetiteLabels[appetite]}</span>
                    <span className="appetite-percentage">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="appetite-bar">
                    <div 
                      className="appetite-fill"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: appetiteColors[appetite]
                      }}
                    ></div>
                  </div>
                  <span className="appetite-count">{count}回</span>
                </div>
              );
            })}
        </div>

        {/* Appetite Analysis */}
        <div className="appetite-analysis">
          {(() => {
            const excellentGoodRate = ((appetiteDistribution.excellent || 0) + (appetiteDistribution.good || 0)) / totalAppetiteRecords;
            const poorNoneRate = ((appetiteDistribution.poor || 0) + (appetiteDistribution.none || 0)) / totalAppetiteRecords;

            if (excellentGoodRate >= 0.7) {
              return (
                <div className="appetite-message positive">
                  <span className="message-icon">😸</span>
                  <span>食欲旺盛で健康的です！</span>
                </div>
              );
            } else if (poorNoneRate >= 0.3) {
              return (
                <div className="appetite-message warning">
                  <span className="message-icon">😿</span>
                  <span>食欲不振が気になります。獣医師に相談することをお勧めします。</span>
                </div>
              );
            } else {
              return (
                <div className="appetite-message neutral">
                  <span className="message-icon">😐</span>
                  <span>食欲は安定しています。</span>
                </div>
              );
            }
          })()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-icon">📊</span>
          <div className="stat-content">
            <span className="stat-label">総食事記録</span>
            <span className="stat-value">{totalAppetiteRecords}回</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">✅</span>
          <div className="stat-content">
            <span className="stat-label">完食回数</span>
            <span className="stat-value">
              {Math.round((overallCompletionRate / 100) * totalAppetiteRecords)}回
            </span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🍽️</span>
          <div className="stat-content">
            <span className="stat-label">食べ残し</span>
            <span className="stat-value">
              {Math.round((wastageRate / 100) * totalAppetiteRecords)}回
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionChart;