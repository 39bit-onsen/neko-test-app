import React from 'react';
import { HealthPrediction, BehaviorPrediction, WeightPrediction } from '../../utils/aiPrediction';

interface PredictionCardProps {
  type: 'health' | 'behavior' | 'weight';
  title: string;
  icon: string;
  prediction: HealthPrediction | BehaviorPrediction | WeightPrediction;
  confidence: number;
}

const PredictionCard: React.FC<PredictionCardProps> = ({
  type,
  title,
  icon,
  prediction,
  confidence
}) => {
  const getConfidenceClass = (confidence: number): string => {
    if (confidence >= 70) return 'high';
    if (confidence >= 50) return 'medium';
    return 'low';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 70) return '高信頼度';
    if (confidence >= 50) return '中信頼度';
    return '低信頼度';
  };

  const renderHealthPrediction = (pred: HealthPrediction) => (
    <>
      <div className="prediction-main">
        <div className={`risk-level ${pred.riskLevel}`}>
          <span className="risk-label">リスクレベル</span>
          <span className="risk-value">{getRiskLevelLabel(pred.riskLevel)}</span>
        </div>
        
        <div className="probability">
          <span className="probability-label">リスク確率</span>
          <div className="probability-bar">
            <div 
              className="probability-fill"
              style={{ width: `${pred.probability}%` }}
            ></div>
          </div>
          <span className="probability-value">{pred.probability}%</span>
        </div>
      </div>

      <div className="prediction-details">
        <div className="detail-section">
          <h5>獣医師診察推奨</h5>
          <p className="vet-recommendation">
            {pred.timeToNextVetVisit <= 7 ? '緊急' :
             pred.timeToNextVetVisit <= 30 ? '早期' :
             pred.timeToNextVetVisit <= 90 ? '定期' : '年次'}
            （{pred.timeToNextVetVisit}日以内）
          </p>
        </div>

        {pred.potentialIssues.length > 0 && (
          <div className="detail-section">
            <h5>注意事項</h5>
            <ul className="issues-list">
              {pred.potentialIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="detail-section">
          <h5>推奨アクション</h5>
          <ul className="recommendations-list">
            {pred.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );

  const renderBehaviorPrediction = (pred: BehaviorPrediction) => (
    <>
      <div className="prediction-main">
        <div className="mood-trend">
          <span className="trend-label">気分トレンド</span>
          <span className={`trend-value ${pred.moodTrend}`}>
            {getMoodTrendLabel(pred.moodTrend)}
          </span>
        </div>
        
        <div className="activity-forecast">
          <span className="activity-label">活動予測</span>
          <div className="activity-meter">
            <div 
              className="activity-fill"
              style={{ width: `${pred.activityForecast}%` }}
            ></div>
          </div>
          <span className="activity-value">{pred.activityForecast}%</span>
        </div>
      </div>

      <div className="prediction-details">
        {pred.stressIndicators.length > 0 && (
          <div className="detail-section">
            <h5>ストレス要因</h5>
            <ul className="stress-list">
              {pred.stressIndicators.map((indicator, index) => (
                <li key={index}>{indicator}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="detail-section">
          <h5>社会的ニーズ</h5>
          <ul className="social-needs-list">
            {pred.socialNeeds.map((need, index) => (
              <li key={index}>{need}</li>
            ))}
          </ul>
        </div>

        {pred.environmentalFactors.length > 0 && (
          <div className="detail-section">
            <h5>環境要因</h5>
            <ul className="environmental-list">
              {pred.environmentalFactors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );

  const renderWeightPrediction = (pred: WeightPrediction) => (
    <>
      <div className="prediction-main">
        <div className="weight-target">
          <span className="target-label">目標体重</span>
          <span className="target-value">{pred.targetWeight.toFixed(1)}kg</span>
        </div>
        
        <div className="weight-trend">
          <span className="trend-label">体重トレンド</span>
          <span className={`trend-value ${pred.weightTrend.trend}`}>
            {getTrendLabel(pred.weightTrend.trend)}
          </span>
        </div>

        {pred.timeToTarget > 0 && (
          <div className="time-to-target">
            <span className="time-label">目標到達予定</span>
            <span className="time-value">{pred.timeToTarget}日後</span>
          </div>
        )}
      </div>

      <div className="prediction-details">
        <div className="detail-section">
          <h5>食事推奨</h5>
          <ul className="diet-recommendations-list">
            {pred.dietRecommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>

        {pred.riskFactors.length > 0 && (
          <div className="detail-section">
            <h5>リスク要因</h5>
            <ul className="risk-factors-list">
              {pred.riskFactors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="detail-section">
          <h5>体重変化予測</h5>
          <div className="weight-change-prediction">
            <span className="change-direction">
              {pred.weightTrend.prediction.direction === 'up' ? '↗️ 増加' :
               pred.weightTrend.prediction.direction === 'down' ? '↘️ 減少' : '→ 安定'}
            </span>
            <span className="change-confidence">
              信頼度: {pred.weightTrend.prediction.confidence}%
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className={`prediction-card ${type}`}>
      <div className="card-header">
        <div className="card-title">
          <span className="card-icon">{icon}</span>
          <h3>{title}</h3>
        </div>
        <div className={`confidence-badge ${getConfidenceClass(confidence)}`}>
          <span className="confidence-label">{getConfidenceLabel(confidence)}</span>
          <span className="confidence-value">{confidence}%</span>
        </div>
      </div>

      <div className="card-content">
        {type === 'health' && renderHealthPrediction(prediction as HealthPrediction)}
        {type === 'behavior' && renderBehaviorPrediction(prediction as BehaviorPrediction)}
        {type === 'weight' && renderWeightPrediction(prediction as WeightPrediction)}
      </div>
    </div>
  );
};

const getRiskLevelLabel = (level: string): string => {
  switch (level) {
    case 'low': return '低';
    case 'medium': return '中';
    case 'high': return '高';
    case 'critical': return '緊急';
    default: return '不明';
  }
};

const getMoodTrendLabel = (trend: string): string => {
  switch (trend) {
    case 'improving': return '改善中';
    case 'stable': return '安定';
    case 'declining': return '悪化中';
    default: return '不明';
  }
};

const getTrendLabel = (trend: string): string => {
  switch (trend) {
    case 'improving': return '改善中';
    case 'stable': return '安定';
    case 'declining': return '悪化中';
    default: return '不明';
  }
};

export default PredictionCard;