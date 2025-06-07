import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DiaryEntry, HealthData, BehaviorData } from '../../types';
import { AIPredictionEngine } from '../../utils/aiPrediction';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendChartProps {
  entries: DiaryEntry[];
}

const TrendChart: React.FC<TrendChartProps> = ({ entries }) => {
  const trendData = useMemo(() => {
    if (entries.length < 3) return null;

    // Extract weight data
    const weightData = entries
      .filter(entry => entry.type === 'health')
      .map(entry => ({
        date: new Date(entry.date),
        value: (entry.data as HealthData).weight || 0
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Extract activity data
    const activityData = entries
      .filter(entry => entry.type === 'behavior')
      .map(entry => ({
        date: new Date(entry.date),
        value: mapActivityToNumber((entry.data as BehaviorData).activityLevel)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Generate trend analysis
    const weightTrend = weightData.length >= 3 ? 
      AIPredictionEngine.generateTrendAnalysis(weightData) : null;
    const activityTrend = activityData.length >= 3 ? 
      AIPredictionEngine.generateTrendAnalysis(activityData) : null;

    return {
      weight: { data: weightData, trend: weightTrend },
      activity: { data: activityData, trend: activityTrend }
    };
  }, [entries]);

  if (!trendData) {
    return (
      <div className="trend-chart no-data">
        <div className="no-data-content">
          <span className="icon">📈</span>
          <h3>トレンド分析に十分なデータがありません</h3>
          <p>最低3件の記録が必要です</p>
        </div>
      </div>
    );
  }

  const generateChartData = (
    data: { date: Date; value: number }[],
    label: string,
    color: string,
    trend: any
  ) => {
    const labels = data.map(item => item.date.toLocaleDateString('ja-JP'));
    const values = data.map(item => item.value);

    // Generate trend line
    let trendLine: number[] = [];
    if (trend && trend.prediction) {
      const startValue = values[0];
      const slope = trend.prediction.expectedChange;
      trendLine = values.map((_, index) => startValue + slope * index);
    }

    return {
      labels,
      datasets: [
        {
          label,
          data: values,
          borderColor: color,
          backgroundColor: color + '20',
          fill: false,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
        ...(trendLine.length > 0 ? [{
          label: `${label} (予測トレンド)`,
          data: trendLine,
          borderColor: color + '80',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          tension: 0.1,
        }] : [])
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '日付'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: '値'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="trend-chart">
      <div className="chart-header">
        <h3>トレンド分析</h3>
        <p>AI予測による健康・行動パターンの分析</p>
      </div>

      <div className="charts-container">
        {trendData.weight.data.length >= 3 && (
          <div className="chart-section">
            <div className="chart-title">
              <h4>体重トレンド</h4>
              {trendData.weight.trend && (
                <div className="trend-summary">
                  <span className={`trend-indicator ${trendData.weight.trend.trend}`}>
                    {getTrendIcon(trendData.weight.trend.trend)}
                    {getTrendLabel(trendData.weight.trend.trend)}
                  </span>
                  <span className="trend-strength">
                    信頼度: {trendData.weight.trend.strength}%
                  </span>
                </div>
              )}
            </div>
            <div className="chart-wrapper">
              <Line
                data={generateChartData(
                  trendData.weight.data,
                  '体重 (kg)',
                  '#2196F3',
                  trendData.weight.trend
                )}
                options={chartOptions}
              />
            </div>
            {trendData.weight.trend && (
              <div className="trend-insights">
                <div className="insight-item">
                  <span className="insight-label">期間:</span>
                  <span>{trendData.weight.trend.duration}日間</span>
                </div>
                <div className="insight-item">
                  <span className="insight-label">予測:</span>
                  <span>
                    {trendData.weight.trend.prediction.direction === 'up' ? '増加傾向' :
                     trendData.weight.trend.prediction.direction === 'down' ? '減少傾向' : '安定'}
                    ({trendData.weight.trend.prediction.confidence}%の信頼度)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {trendData.activity.data.length >= 3 && (
          <div className="chart-section">
            <div className="chart-title">
              <h4>活動レベルトレンド</h4>
              {trendData.activity.trend && (
                <div className="trend-summary">
                  <span className={`trend-indicator ${trendData.activity.trend.trend}`}>
                    {getTrendIcon(trendData.activity.trend.trend)}
                    {getTrendLabel(trendData.activity.trend.trend)}
                  </span>
                  <span className="trend-strength">
                    信頼度: {trendData.activity.trend.strength}%
                  </span>
                </div>
              )}
            </div>
            <div className="chart-wrapper">
              <Line
                data={generateChartData(
                  trendData.activity.data,
                  '活動レベル',
                  '#4CAF50',
                  trendData.activity.trend
                )}
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      min: 1,
                      max: 5,
                      ticks: {
                        callback: function(value) {
                          const labels = ['', '低活動', '穏やか', '普通', '活発', '非常に活発'];
                          return labels[value as number] || value;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
            {trendData.activity.trend && (
              <div className="trend-insights">
                <div className="insight-item">
                  <span className="insight-label">期間:</span>
                  <span>{trendData.activity.trend.duration}日間</span>
                </div>
                <div className="insight-item">
                  <span className="insight-label">予測:</span>
                  <span>
                    {trendData.activity.trend.prediction.direction === 'up' ? '活動量増加' :
                     trendData.activity.trend.prediction.direction === 'down' ? '活動量減少' : '安定'}
                    ({trendData.activity.trend.prediction.confidence}%の信頼度)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {trendData.weight.trend && trendData.activity.trend && (
          <div className="correlation-analysis">
            <h4>相関分析</h4>
            <div className="correlation-insights">
              <div className="insight-item">
                <span className="insight-icon">🔗</span>
                <span>体重と活動レベルの相関を分析中...</span>
              </div>
              {generateCorrelationInsights(
                trendData.weight.trend,
                trendData.activity.trend
              ).map((insight, index) => (
                <div key={index} className="insight-item">
                  <span className="insight-icon">💡</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const mapActivityToNumber = (level: string): number => {
  const mapping: Record<string, number> = {
    'very_active': 5,
    'active': 4,
    'normal': 3,
    'calm': 2,
    'lethargic': 1
  };
  return mapping[level] || 3;
};

const getTrendIcon = (trend: string): string => {
  switch (trend) {
    case 'improving': return '📈';
    case 'declining': return '📉';
    case 'stable': return '➡️';
    default: return '❓';
  }
};

const getTrendLabel = (trend: string): string => {
  switch (trend) {
    case 'improving': return '改善中';
    case 'declining': return '悪化中';
    case 'stable': return '安定';
    default: return '不明';
  }
};

const generateCorrelationInsights = (weightTrend: any, activityTrend: any): string[] => {
  const insights: string[] = [];

  if (weightTrend.trend === 'improving' && activityTrend.trend === 'improving') {
    insights.push('体重と活動レベルが両方改善しています。理想的な状態です。');
  } else if (weightTrend.trend === 'declining' && activityTrend.trend === 'declining') {
    insights.push('体重と活動レベルが両方低下しています。健康管理を見直しましょう。');
  } else if (weightTrend.trend === 'improving' && activityTrend.trend === 'declining') {
    insights.push('体重は改善していますが活動レベルが低下しています。適度な運動を促しましょう。');
  } else if (weightTrend.trend === 'declining' && activityTrend.trend === 'improving') {
    insights.push('活動レベルは向上していますが体重が減少しています。栄養摂取を確認しましょう。');
  }

  // Analyze trend strength correlation
  const strengthDiff = Math.abs(weightTrend.strength - activityTrend.strength);
  if (strengthDiff > 30) {
    insights.push('体重と活動レベルのトレンド強度に差があります。一方により注意を向けましょう。');
  }

  return insights;
};

export default TrendChart;