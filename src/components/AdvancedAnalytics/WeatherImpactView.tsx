import React from 'react';
import { WeatherImpactAnalysis, WeatherPrediction } from '../../utils/weatherAnalysis';

interface WeatherImpactViewProps {
  weatherImpact: WeatherImpactAnalysis | null;
  weatherForecast: WeatherPrediction | null;
  location: { lat: number; lon: number };
}

const WeatherImpactView: React.FC<WeatherImpactViewProps> = ({
  weatherImpact,
  weatherForecast,
  location
}) => {
  if (!weatherImpact && !weatherForecast) {
    return (
      <div className="weather-impact-view loading">
        <div className="loading-content">
          <div className="weather-spinner">🌤️</div>
          <h3>気象データを分析中...</h3>
          <p>位置情報: {location.lat.toFixed(2)}, {location.lon.toFixed(2)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-impact-view">
      <div className="weather-header">
        <h3>🌤️ 気象データ分析</h3>
        <p>天候と猫の行動パターンの相関分析</p>
      </div>

      <div className="weather-analysis-grid">
        {weatherImpact && (
          <>
            <div className="analysis-card temperature-analysis">
              <h4>🌡️ 温度の影響</h4>
              <div className="correlation-metrics">
                <div className="metric">
                  <span className="metric-label">活動レベル:</span>
                  <span className={`correlation-value ${getCorrelationClass(weatherImpact.temperatureCorrelation.activityLevel)}`}>
                    {formatCorrelation(weatherImpact.temperatureCorrelation.activityLevel)}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">食欲:</span>
                  <span className={`correlation-value ${getCorrelationClass(weatherImpact.temperatureCorrelation.appetite)}`}>
                    {formatCorrelation(weatherImpact.temperatureCorrelation.appetite)}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">気分:</span>
                  <span className={`correlation-value ${getCorrelationClass(weatherImpact.temperatureCorrelation.mood)}`}>
                    {formatCorrelation(weatherImpact.temperatureCorrelation.mood)}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">睡眠:</span>
                  <span className={`correlation-value ${getCorrelationClass(weatherImpact.temperatureCorrelation.sleep)}`}>
                    {formatCorrelation(weatherImpact.temperatureCorrelation.sleep)}
                  </span>
                </div>
              </div>
            </div>

            <div className="analysis-card humidity-analysis">
              <h4>💧 湿度の影響</h4>
              <div className="humidity-preferences">
                <div className="preferred-range">
                  <span className="range-label">好適湿度範囲:</span>
                  <span className="range-value">
                    {weatherImpact.humidityEffects.preferredRange.min.toFixed(0)}% - 
                    {weatherImpact.humidityEffects.preferredRange.max.toFixed(0)}%
                  </span>
                </div>
                {weatherImpact.humidityEffects.behaviorChanges.length > 0 && (
                  <div className="behavior-changes">
                    <span className="changes-label">行動変化:</span>
                    <ul className="changes-list">
                      {weatherImpact.humidityEffects.behaviorChanges.map((change, index) => (
                        <li key={index}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="analysis-card pressure-analysis">
              <h4>🌪️ 気圧の影響</h4>
              <div className="pressure-effects">
                <div className="correlation">
                  <span className="correlation-label">相関係数:</span>
                  <span className={`correlation-value ${getCorrelationClass(weatherImpact.pressureEffects.correlation)}`}>
                    {formatCorrelation(weatherImpact.pressureEffects.correlation)}
                  </span>
                </div>
                {weatherImpact.pressureEffects.symptoms.length > 0 && (
                  <div className="symptoms">
                    <span className="symptoms-label">関連症状:</span>
                    <ul className="symptoms-list">
                      {weatherImpact.pressureEffects.symptoms.map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="analysis-card seasonal-analysis">
              <h4>🍂 季節パターン</h4>
              <div className="seasonal-patterns">
                {weatherImpact.seasonalPatterns.map((pattern, index) => (
                  <div key={index} className="season-pattern">
                    <h5>{getSeasonLabel(pattern.season)} {getSeasonIcon(pattern.season)}</h5>
                    <div className="season-metrics">
                      <div className="metric">
                        <span className="metric-label">平均活動度:</span>
                        <span className="metric-value">{pattern.avgActivity.toFixed(1)}</span>
                      </div>
                      {pattern.commonBehaviors.length > 0 && (
                        <div className="behaviors">
                          <span className="behaviors-label">よく見られる行動:</span>
                          <div className="behaviors-tags">
                            {pattern.commonBehaviors.map((behavior, idx) => (
                              <span key={idx} className="behavior-tag">{behavior}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {pattern.healthTrends.length > 0 && (
                        <div className="health-trends">
                          <span className="trends-label">健康傾向:</span>
                          <div className="trends-tags">
                            {pattern.healthTrends.map((trend, idx) => (
                              <span key={idx} className="trend-tag">{trend}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {weatherForecast && (
          <>
            <div className="forecast-card weather-forecast">
              <h4>🔮 7日間天気予報</h4>
              <div className="weather-forecast-list">
                {weatherForecast.upcomingConditions.slice(0, 7).map((weather, index) => (
                  <div key={index} className="weather-day">
                    <div className="day-info">
                      <span className="day-label">
                        {index === 0 ? '今日' : 
                         index === 1 ? '明日' : 
                         `${index}日後`}
                      </span>
                      <span className="day-date">
                        {weather.date.toLocaleDateString('ja-JP', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="weather-info">
                      <span className="weather-icon">
                        {getWeatherIcon(weather.condition)}
                      </span>
                      <span className="temperature">
                        {weather.temperature.toFixed(0)}°C
                      </span>
                      <span className="humidity">
                        {weather.humidity.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="forecast-card behavior-forecast">
              <h4>🎾 行動予測</h4>
              <div className="behavior-predictions">
                <div className="prediction-item">
                  <span className="prediction-label">活動レベル:</span>
                  <span className={`prediction-value ${weatherForecast.behaviorForecast.activityLevel}`}>
                    {getActivityLevelLabel(weatherForecast.behaviorForecast.activityLevel)}
                  </span>
                </div>
                <div className="prediction-item">
                  <span className="prediction-label">気分予測:</span>
                  <span className={`prediction-value ${weatherForecast.behaviorForecast.moodPrediction}`}>
                    {getMoodPredictionLabel(weatherForecast.behaviorForecast.moodPrediction)}
                  </span>
                </div>
                {weatherForecast.behaviorForecast.healthRisks.length > 0 && (
                  <div className="health-risks">
                    <span className="risks-label">健康リスク:</span>
                    <ul className="risks-list">
                      {weatherForecast.behaviorForecast.healthRisks.map((risk, index) => (
                        <li key={index} className="risk-item">{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {(weatherImpact?.recommendations || weatherForecast?.recommendations) && (
          <div className="recommendations-card">
            <h4>💡 気象対応推奨事項</h4>
            <div className="recommendations-list">
              {[
                ...(weatherImpact?.recommendations || []),
                ...(weatherForecast?.recommendations || [])
              ].map((recommendation, index) => (
                <div key={index} className="recommendation-item">
                  <span className="recommendation-icon">🔸</span>
                  <span className="recommendation-text">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getCorrelationClass = (correlation: number): string => {
  if (Math.abs(correlation) >= 0.7) return 'strong';
  if (Math.abs(correlation) >= 0.3) return 'moderate';
  return 'weak';
};

const formatCorrelation = (correlation: number): string => {
  if (correlation > 0.7) return '強い正の相関';
  if (correlation > 0.3) return '中程度の正の相関';
  if (correlation > 0.1) return '弱い正の相関';
  if (correlation < -0.7) return '強い負の相関';
  if (correlation < -0.3) return '中程度の負の相関';
  if (correlation < -0.1) return '弱い負の相関';
  return '相関なし';
};

const getSeasonLabel = (season: string): string => {
  const labels: Record<string, string> = {
    spring: '春',
    summer: '夏',
    fall: '秋',
    winter: '冬'
  };
  return labels[season] || season;
};

const getSeasonIcon = (season: string): string => {
  const icons: Record<string, string> = {
    spring: '🌸',
    summer: '☀️',
    fall: '🍁',
    winter: '❄️'
  };
  return icons[season] || '🌤️';
};

const getWeatherIcon = (condition: string): string => {
  const icons: Record<string, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    snowy: '❄️',
    stormy: '⛈️'
  };
  return icons[condition] || '🌤️';
};

const getActivityLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    low: '低め',
    normal: '通常',
    high: '高め'
  };
  return labels[level] || level;
};

const getMoodPredictionLabel = (mood: string): string => {
  const labels: Record<string, string> = {
    calm: '穏やか',
    normal: '通常',
    active: '活発',
    restless: '落ち着きなし'
  };
  return labels[mood] || mood;
};

export default WeatherImpactView;