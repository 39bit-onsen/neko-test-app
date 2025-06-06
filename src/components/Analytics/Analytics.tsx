import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { DiaryEntry } from '../../types';
import { BasicStats } from '../../utils/analytics';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsProps {
  entries: DiaryEntry[];
}

type TimeRange = '1week' | '1month' | '3months' | 'all';

const Analytics: React.FC<AnalyticsProps> = ({ entries }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1month');
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    let filtered = entries;
    
    switch (timeRange) {
      case '1week':
        filtered = BasicStats.filterEntriesByDateRange(entries, 7);
        break;
      case '1month':
        filtered = BasicStats.filterEntriesByDateRange(entries, 30);
        break;
      case '3months':
        filtered = BasicStats.filterEntriesByDateRange(entries, 90);
        break;
      case 'all':
      default:
        filtered = entries;
        break;
    }
    
    setFilteredEntries(filtered);
  }, [entries, timeRange]);

  const weightTrend = BasicStats.calculateWeightTrend(filteredEntries);
  const appetiteTrend = BasicStats.calculateAppetiteTrend(filteredEntries);
  const activityTrend = BasicStats.calculateActivityTrend(filteredEntries);
  const symptomFrequency = BasicStats.getSymptomFrequencyChart(filteredEntries);
  const basicStats = BasicStats.calculateBasicStats(filteredEntries);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const getTimeRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case '1week': return '1週間';
      case '1month': return '1ヶ月';
      case '3months': return '3ヶ月';
      case 'all': return 'すべて';
    }
  };

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h2>📊 統計・分析</h2>
        <div className="time-range-selector">
          <label>期間:</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          >
            <option value="1week">1週間</option>
            <option value="1month">1ヶ月</option>
            <option value="3months">3ヶ月</option>
            <option value="all">すべて</option>
          </select>
        </div>
      </div>

      <div className="analytics-summary">
        <div className="summary-card">
          <h3>記録サマリー</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">総記録数:</span>
              <span className="value">{basicStats.totalEntries}件</span>
            </div>
            <div className="summary-item">
              <span className="label">週平均:</span>
              <span className="value">{basicStats.weeklyAverage}件/週</span>
            </div>
            <div className="summary-item">
              <span className="label">期間:</span>
              <span className="value">{getTimeRangeLabel(timeRange)}</span>
            </div>
          </div>
          
          <div className="type-distribution">
            <h4>記録タイプ別</h4>
            <div className="type-grid">
              <div className="type-item">
                <span>🍽️ 食事: {basicStats.typeDistribution.food || 0}件</span>
              </div>
              <div className="type-item">
                <span>💊 健康: {basicStats.typeDistribution.health || 0}件</span>
              </div>
              <div className="type-item">
                <span>🎾 行動: {basicStats.typeDistribution.behavior || 0}件</span>
              </div>
              <div className="type-item">
                <span>📝 自由: {basicStats.typeDistribution.free || 0}件</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {weightTrend.labels.length > 0 && (
          <div className="chart-container">
            <h3>📏 体重変化</h3>
            <Line data={weightTrend} options={chartOptions} />
          </div>
        )}

        {appetiteTrend.labels.length > 0 && (
          <div className="chart-container">
            <h3>🍽️ 食欲レベル推移</h3>
            <Line data={appetiteTrend} options={chartOptions} />
          </div>
        )}

        {activityTrend.labels.length > 0 && (
          <div className="chart-container">
            <h3>🎾 活動レベル推移</h3>
            <Line data={activityTrend} options={chartOptions} />
          </div>
        )}

        {symptomFrequency.labels.length > 0 && (
          <div className="chart-container">
            <h3>🏥 症状出現頻度</h3>
            <Bar data={symptomFrequency} options={chartOptions} />
          </div>
        )}
      </div>

      {filteredEntries.length === 0 && (
        <div className="no-data">
          <p>選択した期間にデータがありません。</p>
          <p>記録を追加して統計を確認しましょう！</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;