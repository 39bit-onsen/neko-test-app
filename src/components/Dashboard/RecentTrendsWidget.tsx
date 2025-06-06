import React from 'react';
import { DiaryEntry, HealthData, FoodData, BehaviorData } from '../../types';

interface RecentTrendsWidgetProps {
  entries: DiaryEntry[];
}

const RecentTrendsWidget: React.FC<RecentTrendsWidgetProps> = ({ entries }) => {
  const getRecentEntries = (days: number): DiaryEntry[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return entries.filter(entry => new Date(entry.date) >= cutoffDate);
  };

  const calculateTrend = (values: number[]): 'up' | 'down' | 'stable' => {
    if (values.length < 2) return 'stable';
    
    const recent = values.slice(-3); // Last 3 values
    const older = values.slice(0, -3); // Older values
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (Math.abs(difference) < 0.1) return 'stable';
    return difference > 0 ? 'up' : 'down';
  };

  const getWeightTrend = (): { value: string; trend: 'up' | 'down' | 'stable' } => {
    const recentEntries = getRecentEntries(14);
    const healthEntries = recentEntries
      .filter(entry => entry.type === 'health')
      .map(entry => entry.data as HealthData)
      .filter(data => data.weight !== undefined)
      .sort((a, b) => new Date(a.notes || '').getTime() - new Date(b.notes || '').getTime());

    if (healthEntries.length === 0) {
      return { value: 'データなし', trend: 'stable' };
    }

    const weights = healthEntries.map(entry => entry.weight!);
    const latest = weights[weights.length - 1];
    const trend = calculateTrend(weights);
    
    return { value: `${latest.toFixed(1)}kg`, trend };
  };

  const getAppetiteTrend = (): { value: string; trend: 'up' | 'down' | 'stable' } => {
    const recentEntries = getRecentEntries(7);
    const foodEntries = recentEntries
      .filter(entry => entry.type === 'food')
      .map(entry => entry.data as FoodData);

    if (foodEntries.length === 0) {
      return { value: 'データなし', trend: 'stable' };
    }

    const appetiteToNumber = (appetite: string): number => {
      switch (appetite) {
        case 'excellent': return 5;
        case 'good': return 4;
        case 'fair': return 3;
        case 'poor': return 2;
        case 'none': return 1;
        default: return 3;
      }
    };

    const appetiteValues = foodEntries.map(entry => appetiteToNumber(entry.appetite));
    const average = appetiteValues.reduce((sum, val) => sum + val, 0) / appetiteValues.length;
    const trend = calculateTrend(appetiteValues);
    
    const appetiteLabel = average >= 4.5 ? '優秀' :
                         average >= 3.5 ? '良好' :
                         average >= 2.5 ? '普通' :
                         average >= 1.5 ? '心配' : '深刻';
    
    return { value: appetiteLabel, trend };
  };

  const getActivityTrend = (): { value: string; trend: 'up' | 'down' | 'stable' } => {
    const recentEntries = getRecentEntries(7);
    const behaviorEntries = recentEntries
      .filter(entry => entry.type === 'behavior')
      .map(entry => entry.data as BehaviorData);

    if (behaviorEntries.length === 0) {
      return { value: 'データなし', trend: 'stable' };
    }

    const activityToNumber = (activity: string): number => {
      switch (activity) {
        case 'very_active': return 5;
        case 'active': return 4;
        case 'normal': return 3;
        case 'calm': return 2;
        case 'lethargic': return 1;
        default: return 3;
      }
    };

    const activityValues = behaviorEntries.map(entry => activityToNumber(entry.activityLevel));
    const average = activityValues.reduce((sum, val) => sum + val, 0) / activityValues.length;
    const trend = calculateTrend(activityValues);
    
    const activityLabel = average >= 4.5 ? 'とても活発' :
                         average >= 3.5 ? '活発' :
                         average >= 2.5 ? '普通' :
                         average >= 1.5 ? '静か' : '元気がない';
    
    return { value: activityLabel, trend };
  };

  const getSymptomsTrend = (): { value: string; trend: 'up' | 'down' | 'stable' } => {
    const recentEntries = getRecentEntries(14);
    const healthEntries = recentEntries
      .filter(entry => entry.type === 'health')
      .map(entry => entry.data as HealthData);

    if (healthEntries.length === 0) {
      return { value: 'データなし', trend: 'stable' };
    }

    const totalEntries = healthEntries.length;
    const entriesWithSymptoms = healthEntries.filter(entry => 
      entry.symptoms && entry.symptoms.length > 0
    ).length;

    const symptomRate = entriesWithSymptoms / totalEntries;
    
    // Create a simple trend based on recent vs older entries
    const midpoint = Math.floor(healthEntries.length / 2);
    const recentHalf = healthEntries.slice(midpoint);
    const olderHalf = healthEntries.slice(0, midpoint);
    
    const recentSymptomRate = recentHalf.filter(entry => 
      entry.symptoms && entry.symptoms.length > 0
    ).length / recentHalf.length;
    
    const olderSymptomRate = olderHalf.filter(entry => 
      entry.symptoms && entry.symptoms.length > 0
    ).length / olderHalf.length;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentSymptomRate > olderSymptomRate + 0.1) trend = 'up'; // More symptoms = worse trend
    else if (recentSymptomRate < olderSymptomRate - 0.1) trend = 'down'; // Fewer symptoms = better trend
    
    const symptomsLabel = symptomRate === 0 ? '良好' :
                         symptomRate <= 0.2 ? '軽微' :
                         symptomRate <= 0.5 ? '注意' : '心配';
    
    return { value: symptomsLabel, trend: trend === 'up' ? 'down' : trend === 'down' ? 'up' : 'stable' };
  };

  const TrendItem: React.FC<{
    icon: string;
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    isPositive?: boolean;
  }> = ({ icon, label, value, trend, isPositive = true }) => {
    const getTrendColor = () => {
      if (trend === 'stable') return '#666';
      const improving = isPositive ? trend === 'up' : trend === 'down';
      return improving ? '#4CAF50' : '#f44336';
    };

    const getTrendIcon = () => {
      if (trend === 'stable') return '→';
      return trend === 'up' ? '↗' : '↘';
    };

    return (
      <div className="trend-item">
        <div className="trend-header">
          <span className="trend-icon">{icon}</span>
          <span className="trend-label">{label}</span>
        </div>
        <div className="trend-value">
          <span className="trend-text">{value}</span>
          <span 
            className="trend-indicator"
            style={{ color: getTrendColor() }}
          >
            {getTrendIcon()}
          </span>
        </div>
      </div>
    );
  };

  const weightTrend = getWeightTrend();
  const appetiteTrend = getAppetiteTrend();
  const activityTrend = getActivityTrend();
  const symptomsTrend = getSymptomsTrend();

  return (
    <div className="recent-trends-widget">
      <div className="widget-header">
        <h3>📈 最近のトレンド</h3>
        <span className="period-label">過去2週間</span>
      </div>
      
      <div className="trends-grid">
        <TrendItem
          icon="⚖️"
          label="体重"
          value={weightTrend.value}
          trend={weightTrend.trend}
          isPositive={false} // Weight gain is generally not positive
        />
        
        <TrendItem
          icon="🍽️"
          label="食欲"
          value={appetiteTrend.value}
          trend={appetiteTrend.trend}
          isPositive={true}
        />
        
        <TrendItem
          icon="🎾"
          label="活動量"
          value={activityTrend.value}
          trend={activityTrend.trend}
          isPositive={true}
        />
        
        <TrendItem
          icon="🏥"
          label="健康状態"
          value={symptomsTrend.value}
          trend={symptomsTrend.trend}
          isPositive={true}
        />
      </div>
      
      <div className="trends-summary">
        <p className="trends-note">
          矢印は過去2週間の傾向を示しています。データが少ない場合は「安定」と表示されます。
        </p>
      </div>
    </div>
  );
};

export default RecentTrendsWidget;