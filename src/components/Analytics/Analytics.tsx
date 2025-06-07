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
import { AIPredictionEngine, HealthPrediction, BehaviorPrediction, WeightPrediction } from '../../utils/aiPrediction';
import { WeatherAnalyzer, WeatherImpactAnalysis } from '../../utils/weatherAnalysis';
import Dashboard from '../Dashboard/Dashboard';
import NutritionAnalysis from '../Nutrition/NutritionAnalysis';
import BehaviorAnalysis from '../Behavior/BehaviorAnalysis';
import AdvancedAnalytics from '../AdvancedAnalytics/AdvancedAnalytics';
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
type AnalyticsMode = 'dashboard' | 'nutrition' | 'behavior' | 'charts' | 'ai-analytics' | 'insights';

const Analytics: React.FC<AnalyticsProps> = ({ entries }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1month');
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [mode, setMode] = useState<AnalyticsMode>('dashboard');
  
  // AI Predictions
  const [healthPrediction, setHealthPrediction] = useState<HealthPrediction | null>(null);
  const [behaviorPrediction, setBehaviorPrediction] = useState<BehaviorPrediction | null>(null);
  const [weightPrediction, setWeightPrediction] = useState<WeightPrediction | null>(null);
  const [weatherImpact, setWeatherImpact] = useState<WeatherImpactAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const performAIAnalysis = async () => {
    if (filteredEntries.length < 5) {
      return; // Need minimum data for AI analysis
    }
    
    setIsAnalyzing(true);
    try {
      // Health prediction
      const health = AIPredictionEngine.generateHealthPrediction(filteredEntries);
      setHealthPrediction(health);
      
      // Behavior prediction
      const behavior = AIPredictionEngine.generateBehaviorPrediction(filteredEntries);
      setBehaviorPrediction(behavior);
      
      // Weight prediction
      const weight = AIPredictionEngine.generateWeightPrediction(filteredEntries);
      setWeightPrediction(weight);
      
      // Weather impact analysis (if available)
      try {
        // Default location (Tokyo) for weather analysis
        const defaultLocation = { lat: 35.6762, lon: 139.6503 };
        const weather = await WeatherAnalyzer.analyzeWeatherImpact(filteredEntries, defaultLocation);
        setWeatherImpact(weather);
      } catch (weatherError) {
        console.log('Weather analysis not available:', weatherError);
      }
      
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (mode === 'ai-analytics' && filteredEntries.length > 0) {
      performAIAnalysis();
    }
  }, [mode, filteredEntries]);

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
        
        <div className="analytics-controls">
          <div className="mode-selector">
            <button 
              className={`mode-btn ${mode === 'dashboard' ? 'active' : ''}`}
              onClick={() => setMode('dashboard')}
            >
              🏥 ダッシュボード
            </button>
            <button 
              className={`mode-btn ${mode === 'nutrition' ? 'active' : ''}`}
              onClick={() => setMode('nutrition')}
            >
              🍽️ 食事分析
            </button>
            <button 
              className={`mode-btn ${mode === 'behavior' ? 'active' : ''}`}
              onClick={() => setMode('behavior')}
            >
              🎾 行動分析
            </button>
            <button 
              className={`mode-btn ${mode === 'charts' ? 'active' : ''}`}
              onClick={() => setMode('charts')}
            >
              📈 詳細グラフ
            </button>
            <button 
              className={`mode-btn ${mode === 'ai-analytics' ? 'active' : ''}`}
              onClick={() => setMode('ai-analytics')}
            >
              🤖 AI分析
            </button>
            <button 
              className={`mode-btn ${mode === 'insights' ? 'active' : ''}`}
              onClick={() => setMode('insights')}
            >
              💡 インサイト
            </button>
          </div>
          
          {(mode === 'charts' || mode === 'ai-analytics' || mode === 'insights') && (
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
              {mode === 'ai-analytics' && (
                <button 
                  className="refresh-btn"
                  onClick={performAIAnalysis}
                  disabled={isAnalyzing || filteredEntries.length < 5}
                >
                  {isAnalyzing ? '分析中...' : '🔄 再分析'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {mode === 'dashboard' ? (
        <Dashboard entries={entries} />
      ) : mode === 'nutrition' ? (
        <NutritionAnalysis entries={entries} />
      ) : mode === 'behavior' ? (
        <BehaviorAnalysis entries={entries} />
      ) : mode === 'ai-analytics' ? (
        <div className="ai-analytics-section">
          {isAnalyzing ? (
            <div className="analyzing-state">
              <div className="loading-spinner"></div>
              <p>AI分析を実行中...</p>
              <small>データパターンを解析しています</small>
            </div>
          ) : filteredEntries.length < 5 ? (
            <div className="insufficient-data">
              <h3>🤖 AI分析</h3>
              <p>AI分析には最低5件の記録が必要です。</p>
              <p>もう少し記録を追加してからお試しください。</p>
              <div className="data-progress">
                <span>現在の記録数: {filteredEntries.length}/5</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(filteredEntries.length / 5 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="predictions-grid">
              {healthPrediction && (
                <div className="prediction-card health-prediction">
                  <h3>🏥 健康予測</h3>
                  <div className="prediction-content">
                    <div className="risk-level">
                      <span className={`risk-indicator ${healthPrediction.riskLevel}`}>
                        {healthPrediction.riskLevel === 'low' ? '低リスク' : 
                         healthPrediction.riskLevel === 'medium' ? '中リスク' : 
                         healthPrediction.riskLevel === 'high' ? '高リスク' : '緊急'}
                      </span>
                      <span className="confidence">確率: {Math.round(healthPrediction.probability)}%</span>
                    </div>
                    <div className="health-info">
                      <div className="metric">
                        <span className="label">次回診察推奨:</span>
                        <span className="value">{healthPrediction.timeToNextVetVisit}日後</span>
                      </div>
                      {healthPrediction.potentialIssues.length > 0 && (
                        <div className="potential-issues">
                          <h5>注意すべき症状:</h5>
                          <ul>
                            {healthPrediction.potentialIssues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {healthPrediction.recommendations.length > 0 && (
                      <div className="recommendations">
                        <h4>推奨事項:</h4>
                        <ul>
                          {healthPrediction.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {behaviorPrediction && (
                <div className="prediction-card behavior-prediction">
                  <h3>🎾 行動予測</h3>
                  <div className="prediction-content">
                    <div className="behavior-metrics">
                      <div className="metric">
                        <span className="label">活動レベル予測:</span>
                        <span className="value">{behaviorPrediction.activityForecast}%</span>
                      </div>
                      <div className="metric">
                        <span className="label">気分傾向:</span>
                        <span className="value">{
                          behaviorPrediction.moodTrend === 'improving' ? '改善' :
                          behaviorPrediction.moodTrend === 'stable' ? '安定' : '低下'
                        }</span>
                      </div>
                    </div>
                    <div className="behavior-factors">
                      {behaviorPrediction.stressIndicators.length > 0 && (
                        <div className="factor-group">
                          <h5>ストレス要因:</h5>
                          <ul>
                            {behaviorPrediction.stressIndicators.map((factor, index) => (
                              <li key={index}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {behaviorPrediction.socialNeeds.length > 0 && (
                        <div className="factor-group">
                          <h5>社会的ニーズ:</h5>
                          <ul>
                            {behaviorPrediction.socialNeeds.map((need, index) => (
                              <li key={index}>{need}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {behaviorPrediction.recommendations.length > 0 && (
                      <div className="recommendations">
                        <h4>推奨事項:</h4>
                        <ul>
                          {behaviorPrediction.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {weightPrediction && (
                <div className="prediction-card weight-prediction">
                  <h3>📏 体重予測</h3>
                  <div className="prediction-content">
                    <div className="weight-info">
                      <div className="metric">
                        <span className="label">目標体重:</span>
                        <span className="value">{weightPrediction.targetWeight.toFixed(1)}kg</span>
                      </div>
                      <div className="metric">
                        <span className="label">達成予定:</span>
                        <span className="value">{weightPrediction.timeToTarget}日後</span>
                      </div>
                      <div className="metric">
                        <span className="label">体重傾向:</span>
                        <span className="value">{
                          weightPrediction.weightTrend.trend === 'improving' ? '改善' :
                          weightPrediction.weightTrend.trend === 'stable' ? '安定' :
                          weightPrediction.weightTrend.trend === 'declining' ? '低下' : '不明'
                        }</span>
                      </div>
                    </div>
                    {weightPrediction.dietRecommendations.length > 0 && (
                      <div className="diet-recommendations">
                        <h5>食事推奨:</h5>
                        <ul>
                          {weightPrediction.dietRecommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {weightPrediction.riskFactors.length > 0 && (
                      <div className="risk-factors">
                        <h5>リスク要因:</h5>
                        <ul>
                          {weightPrediction.riskFactors.map((factor, index) => (
                            <li key={index}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {weightPrediction.recommendations.length > 0 && (
                      <div className="recommendations">
                        <h4>推奨事項:</h4>
                        <ul>
                          {weightPrediction.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {weatherImpact && (
                <div className="prediction-card weather-prediction">
                  <h3>🌤️ 天候影響分析</h3>
                  <div className="prediction-content">
                    <div className="weather-metrics">
                      <div className="metric">
                        <span className="label">気温相関:</span>
                        <span className="value">{Math.round(weatherImpact.temperatureCorrelation.activityLevel * 100)}%</span>
                      </div>
                      <div className="metric">
                        <span className="label">湿度影響:</span>
                        <span className="value">{weatherImpact.humidityEffects.preferredRange.min}-{weatherImpact.humidityEffects.preferredRange.max}%</span>
                      </div>
                    </div>
                    {weatherImpact.recommendations.length > 0 && (
                      <div className="recommendations">
                        <h4>推奨事項:</h4>
                        <ul>
                          {weatherImpact.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : mode === 'insights' ? (
        <AdvancedAnalytics />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default Analytics;