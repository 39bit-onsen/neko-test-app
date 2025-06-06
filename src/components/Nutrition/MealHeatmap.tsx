import React from 'react';
import { MealPattern } from '../../utils/nutritionAnalyzer';

interface MealHeatmapProps {
  mealPattern: MealPattern;
}

const MealHeatmap: React.FC<MealHeatmapProps> = ({ mealPattern }) => {
  const { hourlyDistribution, dailyAverages, peakMealTimes } = mealPattern;

  const getHeatmapColor = (count: number, maxCount: number): string => {
    if (count === 0) return '#f5f5f5';
    
    const intensity = count / maxCount;
    if (intensity > 0.8) return '#1a5a1a'; // Dark green
    if (intensity > 0.6) return '#2d7d2d'; // Medium-dark green
    if (intensity > 0.4) return '#4caf50'; // Medium green
    if (intensity > 0.2) return '#81c784'; // Light-medium green
    return '#c8e6c9'; // Light green
  };

  const maxCount = Math.max(...Object.values(hourlyDistribution));

  const timeLabels = [
    '0', '1', '2', '3', '4', '5',
    '6', '7', '8', '9', '10', '11',
    '12', '13', '14', '15', '16', '17',
    '18', '19', '20', '21', '22', '23'
  ];

  const mealPeriods = [
    { name: '朝食', start: 6, end: 10, color: '#FFD700', icon: '🌅' },
    { name: '昼食', start: 11, end: 15, color: '#FF8C00', icon: '☀️' },
    { name: '夕食', start: 16, end: 21, color: '#FF6347', icon: '🌇' },
    { name: '夜食', start: 22, end: 5, color: '#4169E1', icon: '🌙' }
  ];

  const isInPeriod = (hour: number, start: number, end: number): boolean => {
    if (start <= end) {
      return hour >= start && hour <= end;
    } else {
      return hour >= start || hour <= end;
    }
  };

  return (
    <div className="meal-heatmap">
      {/* Time period overview */}
      <div className="meal-periods">
        {mealPeriods.map(period => (
          <div key={period.name} className="meal-period">
            <span className="period-icon">{period.icon}</span>
            <div className="period-info">
              <span className="period-name">{period.name}</span>
              <span className="period-average">
                {period.name === '朝食' && `${dailyAverages.breakfast.toFixed(1)}回/日`}
                {period.name === '昼食' && `${dailyAverages.lunch.toFixed(1)}回/日`}
                {period.name === '夕食' && `${dailyAverages.dinner.toFixed(1)}回/日`}
                {period.name === '夜食' && `${dailyAverages.night.toFixed(1)}回/日`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Hourly heatmap */}
      <div className="heatmap-container">
        <div className="heatmap-grid">
          {timeLabels.map((label, index) => {
            const hour = index;
            const count = hourlyDistribution[hour] || 0;
            const isPeak = peakMealTimes.includes(`${hour}:00`);
            
            // Determine which meal period this hour belongs to
            const currentPeriod = mealPeriods.find(period => 
              isInPeriod(hour, period.start, period.end)
            );

            return (
              <div key={hour} className="heatmap-cell">
                <div className="hour-label">{label}</div>
                <div 
                  className={`heat-cell ${isPeak ? 'peak' : ''}`}
                  style={{ 
                    backgroundColor: getHeatmapColor(count, maxCount),
                    borderColor: currentPeriod?.color || '#ddd'
                  }}
                  title={`${label}:00 - ${count}回の食事`}
                >
                  {count > 0 && (
                    <span className="cell-count">{count}</span>
                  )}
                  {isPeak && <span className="peak-indicator">★</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <div className="legend-item">
            <span className="legend-label">食事回数:</span>
            <div className="legend-gradient">
              <div className="gradient-bar">
                <div className="gradient-low" style={{ backgroundColor: '#c8e6c9' }}></div>
                <div className="gradient-high" style={{ backgroundColor: '#1a5a1a' }}></div>
              </div>
              <div className="gradient-labels">
                <span>少</span>
                <span>多</span>
              </div>
            </div>
          </div>
          <div className="legend-item">
            <span className="peak-star">★</span>
            <span>ピーク時間（よく食事する時間）</span>
          </div>
        </div>
      </div>

      {/* Peak times summary */}
      {peakMealTimes.length > 0 && (
        <div className="peak-times-summary">
          <h4>📈 よく食事をする時間</h4>
          <div className="peak-times">
            {peakMealTimes.map(time => (
              <span key={time} className="peak-time">
                {time}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Daily averages summary */}
      <div className="daily-summary">
        <div className="summary-item">
          <span className="summary-label">1日平均食事回数:</span>
          <span className="summary-value">{mealPattern.averageMealsPerDay.toFixed(1)}回</span>
        </div>
      </div>
    </div>
  );
};

export default MealHeatmap;