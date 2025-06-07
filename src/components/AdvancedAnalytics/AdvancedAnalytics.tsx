import React, { useState, useEffect } from 'react';
import { DiaryEntry } from '../../types';
import { useMultiCat } from '../../contexts/MultiCatContext';
import { storageManager } from '../../utils/storage';
import { AIPredictionEngine, HealthPrediction, BehaviorPrediction, WeightPrediction } from '../../utils/aiPrediction';
import { WeatherAnalyzer, WeatherImpactAnalysis, WeatherPrediction } from '../../utils/weatherAnalysis';
import PredictionCard from './PredictionCard';
import TrendChart from './TrendChart';
import WeatherImpactView from './WeatherImpactView';
import './AdvancedAnalytics.css';

const AdvancedAnalytics: React.FC = () => {
  const { activeCat } = useMultiCat();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'predictions' | 'trends' | 'weather'>('predictions');
  
  // Predictions
  const [healthPrediction, setHealthPrediction] = useState<HealthPrediction | null>(null);
  const [behaviorPrediction, setBehaviorPrediction] = useState<BehaviorPrediction | null>(null);
  const [weightPrediction, setWeightPrediction] = useState<WeightPrediction | null>(null);
  
  // Weather analysis
  const [weatherImpact, setWeatherImpact] = useState<WeatherImpactAnalysis | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<WeatherPrediction | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (activeCat) {
      loadAnalyticsData();
    }
  }, [activeCat]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation not available:', error);
          // Use default location (Tokyo)
          setLocation({ lat: 35.6762, lon: 139.6503 });
        }
      );
    } else {
      setLocation({ lat: 35.6762, lon: 139.6503 });
    }
  }, []);

  const loadAnalyticsData = async () => {
    if (!activeCat) return;

    setIsLoading(true);
    try {
      const catEntries = await storageManager.getEntriesByCat(activeCat.id);
      setEntries(catEntries);

      // Generate AI predictions
      const healthPred = AIPredictionEngine.generateHealthPrediction(catEntries);
      const behaviorPred = AIPredictionEngine.generateBehaviorPrediction(catEntries);
      const weightPred = AIPredictionEngine.generateWeightPrediction(catEntries);

      setHealthPrediction(healthPred);
      setBehaviorPrediction(behaviorPred);
      setWeightPrediction(weightPred);

      // Generate weather analysis if location is available
      if (location) {
        try {
          const weatherImpactAnalysis = await WeatherAnalyzer.analyzeWeatherImpact(catEntries, location);
          const weatherForecastData = await WeatherAnalyzer.generateWeatherForecast(catEntries, location);
          
          setWeatherImpact(weatherImpactAnalysis);
          setWeatherForecast(weatherForecastData);
        } catch (error) {
          console.error('Weather analysis failed:', error);
        }
      }

    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeCat) {
    return (
      <div className="advanced-analytics no-cat">
        <div className="no-cat-content">
          <span className="icon">🤖</span>
          <h3>猫が選択されていません</h3>
          <p>AI分析を表示するには、猫を選択してください</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="advanced-analytics loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <h3>AI分析を実行中...</h3>
          <p>データを分析して予測を生成しています</p>
        </div>
      </div>
    );
  }

  const hasInsufficientData = entries.length < 10;

  return (
    <div className="advanced-analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h2>🤖 AI分析・予測</h2>
          <p>{activeCat.name}の高度なデータ分析と予測</p>
        </div>

        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictions')}
          >
            🔮 AI予測
          </button>
          <button
            className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            📈 トレンド分析
          </button>
          <button
            className={`tab-btn ${activeTab === 'weather' ? 'active' : ''}`}
            onClick={() => setActiveTab('weather')}
          >
            🌤️ 気象分析
          </button>
        </div>
      </div>

      {hasInsufficientData && (
        <div className="insufficient-data-warning">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <div className="warning-text">
              <h4>データが不足しています</h4>
              <p>より正確なAI分析には最低10件の記録が必要です。現在: {entries.length}件</p>
            </div>
          </div>
        </div>
      )}

      <div className="analytics-content">
        {activeTab === 'predictions' && (
          <div className="predictions-view">
            <div className="predictions-grid">
              {healthPrediction && (
                <PredictionCard
                  type="health"
                  title="健康予測"
                  icon="🏥"
                  prediction={healthPrediction}
                  confidence={hasInsufficientData ? 30 : 75}
                />
              )}

              {behaviorPrediction && (
                <PredictionCard
                  type="behavior"
                  title="行動予測"
                  icon="🎾"
                  prediction={behaviorPrediction}
                  confidence={hasInsufficientData ? 25 : 70}
                />
              )}

              {weightPrediction && (
                <PredictionCard
                  type="weight"
                  title="体重予測"
                  icon="⚖️"
                  prediction={weightPrediction}
                  confidence={hasInsufficientData ? 35 : 80}
                />
              )}
            </div>

            <div className="ai-insights">
              <h3>AI分析インサイト</h3>
              <div className="insights-list">
                {generateAIInsights(healthPrediction, behaviorPrediction, weightPrediction).map((insight, index) => (
                  <div key={index} className="insight-item">
                    <span className="insight-icon">💡</span>
                    <span className="insight-text">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="trends-view">
            <TrendChart entries={entries} />
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="weather-view">
            {location ? (
              <WeatherImpactView
                weatherImpact={weatherImpact}
                weatherForecast={weatherForecast}
                location={location}
              />
            ) : (
              <div className="location-loading">
                <p>位置情報を取得中...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const generateAIInsights = (
  health: HealthPrediction | null,
  behavior: BehaviorPrediction | null,
  weight: WeightPrediction | null
): string[] => {
  const insights: string[] = [];

  if (health) {
    if (health.riskLevel === 'low') {
      insights.push('健康状態は良好です。現在のケアを継続してください。');
    } else if (health.riskLevel === 'medium') {
      insights.push('健康状態に軽度の注意が必要です。定期的な観察を行ってください。');
    } else if (health.riskLevel === 'high') {
      insights.push('健康状態に注意が必要です。獣医師への相談を検討してください。');
    }

    if (health.timeToNextVetVisit <= 30) {
      insights.push(`獣医師の診察をお勧めします（推奨: ${health.timeToNextVetVisit}日以内）`);
    }
  }

  if (behavior) {
    if (behavior.moodTrend === 'improving') {
      insights.push('行動パターンが改善傾向にあります。');
    } else if (behavior.moodTrend === 'declining') {
      insights.push('行動パターンに変化が見られます。環境やストレス要因を確認してください。');
    }

    if (behavior.activityForecast < 40) {
      insights.push('活動レベルが低下する可能性があります。遊びの時間を増やしてみてください。');
    } else if (behavior.activityForecast > 80) {
      insights.push('高い活動レベルが予想されます。十分な運動機会を提供してください。');
    }
  }

  if (weight) {
    if (weight.timeToTarget > 0 && weight.timeToTarget <= 90) {
      insights.push(`理想体重に向けて順調です。約${Math.round(weight.timeToTarget)}日で目標に到達予定です。`);
    }

    if (weight.riskFactors.length > 0) {
      insights.push('体重管理に注意が必要です。食事量や運動量を見直してください。');
    }
  }

  if (insights.length === 0) {
    insights.push('現在のところ特別な注意事項はありません。継続的な記録をお勧めします。');
  }

  return insights;
};

export default AdvancedAnalytics;