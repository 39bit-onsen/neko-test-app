import React from 'react';
import { HealthScore, HealthScoreCalculator } from '../../utils/healthScore';

interface HealthScoreWidgetProps {
  healthScore: HealthScore;
}

const HealthScoreWidget: React.FC<HealthScoreWidgetProps> = ({ healthScore }) => {
  const { overall, categories, trend } = healthScore;

  const ScoreCircle: React.FC<{ score: number; size?: 'large' | 'small' }> = ({ 
    score, 
    size = 'large' 
  }) => {
    const radius = size === 'large' ? 45 : 30;
    const strokeWidth = size === 'large' ? 8 : 5;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;
    
    return (
      <div className={`score-circle ${size}`}>
        <svg
          height={radius * 2}
          width={radius * 2}
        >
          <circle
            stroke="#e6e6e6"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={HealthScoreCalculator.getScoreColor(score)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset: 0 }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="score-progress"
          />
        </svg>
        <div className="score-text">
          <span className="score-number">{score}</span>
          {size === 'large' && <span className="score-label">ポイント</span>}
        </div>
      </div>
    );
  };

  const CategoryScore: React.FC<{ 
    label: string; 
    score: number; 
    icon: string;
  }> = ({ label, score, icon }) => (
    <div className="category-score">
      <div className="category-header">
        <span className="category-icon">{icon}</span>
        <span className="category-label">{label}</span>
      </div>
      <div className="category-score-display">
        <ScoreCircle score={score} size="small" />
        <div className="category-details">
          <span className="category-value">{score}</span>
          <span className="category-status">
            {HealthScoreCalculator.getScoreLabel(score)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="health-score-widget">
      <div className="widget-header">
        <h3>総合健康スコア</h3>
        <div className="trend-indicator">
          <span className="trend-icon">
            {HealthScoreCalculator.getTrendIcon(trend)}
          </span>
          <span className="trend-text">
            {trend === 'improving' ? '改善傾向' : 
             trend === 'declining' ? '下降傾向' : '安定'}
          </span>
        </div>
      </div>
      
      <div className="overall-score">
        <ScoreCircle score={overall} size="large" />
        <div className="overall-details">
          <div className="score-description">
            <span className="score-status">
              {HealthScoreCalculator.getScoreLabel(overall)}
            </span>
            <p className="score-message">
              {overall >= 80 ? 
                '愛猫の健康状態は良好です！このまま続けてください。' :
                overall >= 60 ?
                '健康状態にやや気になる点があります。' :
                '健康状態に注意が必要です。獣医師への相談をお勧めします。'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="category-scores">
        <CategoryScore 
          label="体重管理" 
          score={categories.weight} 
          icon="⚖️"
        />
        <CategoryScore 
          label="活動レベル" 
          score={categories.activity} 
          icon="🎾"
        />
        <CategoryScore 
          label="食欲状態" 
          score={categories.appetite} 
          icon="🍽️"
        />
        <CategoryScore 
          label="症状頻度" 
          score={categories.symptoms} 
          icon="🏥"
        />
      </div>
    </div>
  );
};

export default HealthScoreWidget;