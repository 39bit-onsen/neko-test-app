import React, { useState, useEffect } from 'react';
import { DiaryEntry } from '../../types';
import { NutritionAnalyzer, MealPattern, ConsumptionStats, TimeDistribution, NutritionInsights } from '../../utils/nutritionAnalyzer';
import MealHeatmap from './MealHeatmap';
import ConsumptionChart from './ConsumptionChart';
import MealIntervalsChart from './MealIntervalsChart';
import NutritionInsightsWidget from './NutritionInsightsWidget';
import './NutritionAnalysis.css';

interface NutritionAnalysisProps {
  entries: DiaryEntry[];
}

const NutritionAnalysis: React.FC<NutritionAnalysisProps> = ({ entries }) => {
  const [mealPattern, setMealPattern] = useState<MealPattern | null>(null);
  const [consumptionStats, setConsumptionStats] = useState<ConsumptionStats | null>(null);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution | null>(null);
  const [insights, setInsights] = useState<NutritionInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyzeNutrition();
  }, [entries]);

  const analyzeNutrition = () => {
    setIsLoading(true);
    
    try {
      const foodEntries = entries.filter(entry => entry.type === 'food');
      
      if (foodEntries.length === 0) {
        setMealPattern(null);
        setConsumptionStats(null);
        setTimeDistribution(null);
        setInsights(null);
        setIsLoading(false);
        return;
      }

      // Analyze different aspects of nutrition
      const patterns = NutritionAnalyzer.analyzeMealPatterns(entries);
      const consumption = NutritionAnalyzer.calculateConsumptionRate(entries);
      const timeDistrib = NutritionAnalyzer.getMealTimeDistribution(entries);
      const nutritionInsights = NutritionAnalyzer.generateNutritionInsights(entries);

      setMealPattern(patterns);
      setConsumptionStats(consumption);
      setTimeDistribution(timeDistrib);
      setInsights(nutritionInsights);

    } catch (error) {
      console.error('Error analyzing nutrition:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="nutrition-analysis">
        <div className="nutrition-loading">
          <div className="loading-spinner"></div>
          <p>食事データを分析中...</p>
        </div>
      </div>
    );
  }

  if (!mealPattern || !consumptionStats || !timeDistribution || !insights) {
    return (
      <div className="nutrition-analysis">
        <div className="nutrition-header">
          <h2>🍽️ 食事分析・栄養管理</h2>
        </div>
        <div className="no-nutrition-data">
          <div className="no-data-icon">🍽️</div>
          <h3>食事記録が不足しています</h3>
          <p>食事分析を行うには、食事記録が必要です。</p>
          <div className="nutrition-requirements">
            <h4>分析に必要な記録:</h4>
            <ul>
              <li>🍽️ 食事時間と食事の種類</li>
              <li>📏 食事量（グラム・ミリリットル・個数）</li>
              <li>😋 食欲レベル（5段階評価）</li>
              <li>✅ 完食状況</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nutrition-analysis">
      <div className="nutrition-header">
        <h2>🍽️ 食事分析・栄養管理</h2>
      </div>

      {/* Insights Widget */}
      <NutritionInsightsWidget insights={insights} />

      {/* Analysis Grid */}
      <div className="nutrition-grid">
        {/* Meal Heatmap */}
        <div className="nutrition-widget">
          <h3>⏰ 食事時間パターン</h3>
          <MealHeatmap mealPattern={mealPattern} />
        </div>

        {/* Consumption Analysis */}
        <div className="nutrition-widget">
          <h3>📊 食事完食率・食欲分析</h3>
          <ConsumptionChart consumptionStats={consumptionStats} />
        </div>

        {/* Meal Intervals */}
        <div className="nutrition-widget">
          <h3>⏱️ 食事間隔分析</h3>
          <MealIntervalsChart timeDistribution={timeDistribution} />
        </div>

        {/* Food Type Preferences */}
        <div className="nutrition-widget">
          <h3>🥘 食事タイプ別好み</h3>
          <div className="food-preferences">
            {Object.entries(consumptionStats.foodTypePreferences)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([foodType, count]) => (
                <div key={foodType} className="food-preference-item">
                  <span className="food-type">{foodType}</span>
                  <div className="preference-bar">
                    <div 
                      className="preference-fill"
                      style={{ 
                        width: `${(count / Math.max(...Object.values(consumptionStats.foodTypePreferences))) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="preference-count">{count}回</span>
                </div>
              ))}
          </div>
        </div>

        {/* Average Amounts */}
        <div className="nutrition-widget">
          <h3>📏 平均摂取量</h3>
          <div className="amount-stats">
            <div className="amount-item">
              <span className="amount-icon">🍽️</span>
              <div className="amount-details">
                <span className="amount-label">1回あたり</span>
                <span className="amount-value">
                  {consumptionStats.averageAmount.perMeal.toFixed(1)} {consumptionStats.averageAmount.unit}
                </span>
              </div>
            </div>
            <div className="amount-item">
              <span className="amount-icon">📅</span>
              <div className="amount-details">
                <span className="amount-label">1日あたり</span>
                <span className="amount-value">
                  {consumptionStats.averageAmount.perDay.toFixed(1)} {consumptionStats.averageAmount.unit}
                </span>
              </div>
            </div>
            <div className="amount-item">
              <span className="amount-icon">🍽️</span>
              <div className="amount-details">
                <span className="amount-label">食事回数/日</span>
                <span className="amount-value">
                  {mealPattern.averageMealsPerDay.toFixed(1)} 回
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Pattern */}
        <div className="nutrition-widget">
          <h3>📅 曜日別食事パターン</h3>
          <div className="weekly-pattern">
            {Object.entries(timeDistribution.weeklyPattern).map(([day, count]) => {
              const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
              const maxCount = Math.max(...Object.values(timeDistribution.weeklyPattern));
              return (
                <div key={day} className="weekly-day">
                  <span className="day-name">{dayNames[parseInt(day)]}</span>
                  <div className="day-bar">
                    <div 
                      className="day-fill"
                      style={{ height: `${(count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="day-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionAnalysis;