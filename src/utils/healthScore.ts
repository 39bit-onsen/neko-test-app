import { DiaryEntry, HealthData, FoodData, BehaviorData } from '../types';

export interface HealthScore {
  overall: number;
  categories: {
    weight: number;
    activity: number;
    appetite: number;
    symptoms: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

export interface TrendAnalysis {
  direction: 'improving' | 'stable' | 'declining';
  confidence: number; // 0-1
  changeRate: number; // percentage change
  timeSpan: number; // days analyzed
}

export interface HealthAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  category: 'weight' | 'activity' | 'appetite' | 'symptoms';
  message: string;
  severity: number; // 1-5
  created: Date;
}

export class HealthScoreCalculator {
  static calculateOverallScore(entries: DiaryEntry[]): HealthScore {
    const recentEntries = this.getRecentEntries(entries, 30); // Last 30 days
    
    const weightScore = this.calculateWeightScore(recentEntries);
    const activityScore = this.calculateActivityScore(recentEntries);
    const appetiteScore = this.calculateAppetiteScore(recentEntries);
    const symptomsScore = this.calculateSymptomsScore(recentEntries);

    const categories = {
      weight: weightScore,
      activity: activityScore,
      appetite: appetiteScore,
      symptoms: symptomsScore
    };

    // Calculate weighted overall score
    const weights = {
      weight: 0.25,
      activity: 0.25,
      appetite: 0.25,
      symptoms: 0.25
    };

    const overall = Math.round(
      (weightScore * weights.weight +
       activityScore * weights.activity +
       appetiteScore * weights.appetite +
       symptomsScore * weights.symptoms)
    );

    const trend = this.calculateTrend(entries);

    return {
      overall,
      categories,
      trend,
      lastUpdated: new Date()
    };
  }

  private static getRecentEntries(entries: DiaryEntry[], days: number): DiaryEntry[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return entries.filter(entry => new Date(entry.date) >= cutoffDate);
  }

  private static calculateWeightScore(entries: DiaryEntry[]): number {
    const healthEntries = entries
      .filter(entry => entry.type === 'health')
      .map(entry => entry.data as HealthData)
      .filter(data => data.weight !== undefined)
      .sort((a, b) => new Date(b.notes || '').getTime() - new Date(a.notes || '').getTime());

    if (healthEntries.length === 0) return 75; // Default neutral score

    const weights = healthEntries.map(entry => entry.weight!);
    const latest = weights[0];
    
    // Ideal weight range for average cat (3-5kg)
    const idealMin = 3.0;
    const idealMax = 5.0;
    
    if (latest >= idealMin && latest <= idealMax) {
      return 100; // Perfect weight
    } else if (latest < idealMin) {
      // Underweight penalty
      const deficit = idealMin - latest;
      return Math.max(50, 100 - (deficit * 25));
    } else {
      // Overweight penalty
      const excess = latest - idealMax;
      return Math.max(50, 100 - (excess * 15));
    }
  }

  private static calculateActivityScore(entries: DiaryEntry[]): number {
    const behaviorEntries = entries
      .filter(entry => entry.type === 'behavior')
      .map(entry => entry.data as BehaviorData);

    if (behaviorEntries.length === 0) return 75; // Default neutral score

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

    const activityValues = behaviorEntries.map(entry => 
      activityToNumber(entry.activityLevel)
    );

    const averageActivity = activityValues.reduce((sum, val) => sum + val, 0) / activityValues.length;
    
    // Convert 1-5 scale to 0-100 score
    // 3 (normal) = 80, 4-5 = 90-100, 1-2 = 40-70
    if (averageActivity >= 4) {
      return Math.min(100, 80 + (averageActivity - 3) * 10);
    } else if (averageActivity >= 3) {
      return 80;
    } else {
      return Math.max(40, 40 + (averageActivity - 1) * 15);
    }
  }

  private static calculateAppetiteScore(entries: DiaryEntry[]): number {
    const foodEntries = entries
      .filter(entry => entry.type === 'food')
      .map(entry => entry.data as FoodData);

    if (foodEntries.length === 0) return 75; // Default neutral score

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

    const appetiteValues = foodEntries.map(entry => 
      appetiteToNumber(entry.appetite)
    );

    const averageAppetite = appetiteValues.reduce((sum, val) => sum + val, 0) / appetiteValues.length;
    
    // Convert 1-5 scale to 0-100 score
    if (averageAppetite >= 4) {
      return Math.min(100, 80 + (averageAppetite - 3) * 10);
    } else if (averageAppetite >= 3) {
      return 80;
    } else {
      return Math.max(30, 30 + (averageAppetite - 1) * 25);
    }
  }

  private static calculateSymptomsScore(entries: DiaryEntry[]): number {
    const healthEntries = entries
      .filter(entry => entry.type === 'health')
      .map(entry => entry.data as HealthData);

    if (healthEntries.length === 0) return 100; // No health records = assume healthy

    const totalEntries = healthEntries.length;
    const entriesWithSymptoms = healthEntries.filter(entry => 
      entry.symptoms && entry.symptoms.length > 0
    ).length;

    const symptomRate = entriesWithSymptoms / totalEntries;
    
    // Convert symptom rate to health score (inverse relationship)
    if (symptomRate === 0) return 100; // No symptoms
    if (symptomRate <= 0.1) return 90; // Very few symptoms
    if (symptomRate <= 0.2) return 75; // Some symptoms
    if (symptomRate <= 0.4) return 60; // Moderate symptoms
    return Math.max(20, 60 - (symptomRate - 0.4) * 100); // Frequent symptoms
  }

  private static calculateTrend(entries: DiaryEntry[]): 'improving' | 'stable' | 'declining' {
    if (entries.length < 14) return 'stable'; // Need at least 2 weeks of data

    const recent = this.getRecentEntries(entries, 14); // Last 2 weeks
    const previous = entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        return entryDate >= fourWeeksAgo && entryDate < twoWeeksAgo;
      });

    if (previous.length === 0) return 'stable';

    const recentScore = this.calculateOverallScore(recent).overall;
    const previousScore = this.calculateOverallScore(previous).overall;

    const difference = recentScore - previousScore;

    if (difference >= 5) return 'improving';
    if (difference <= -5) return 'declining';
    return 'stable';
  }

  static generateHealthAlerts(entries: DiaryEntry[], currentScore: HealthScore): HealthAlert[] {
    const alerts: HealthAlert[] = [];

    // Weight alerts
    if (currentScore.categories.weight < 60) {
      alerts.push({
        id: `weight_${Date.now()}`,
        type: currentScore.categories.weight < 40 ? 'critical' : 'warning',
        category: 'weight',
        message: currentScore.categories.weight < 40 
          ? '体重に深刻な問題があります。すぐに獣医師に相談してください。'
          : '体重管理に注意が必要です。',
        severity: currentScore.categories.weight < 40 ? 5 : 3,
        created: new Date()
      });
    }

    // Activity alerts
    if (currentScore.categories.activity < 50) {
      alerts.push({
        id: `activity_${Date.now()}`,
        type: currentScore.categories.activity < 30 ? 'critical' : 'warning',
        category: 'activity',
        message: currentScore.categories.activity < 30 
          ? '活動レベルが著しく低下しています。健康状態を確認してください。'
          : '活動量が少し気になります。',
        severity: currentScore.categories.activity < 30 ? 4 : 2,
        created: new Date()
      });
    }

    // Appetite alerts
    if (currentScore.categories.appetite < 50) {
      alerts.push({
        id: `appetite_${Date.now()}`,
        type: currentScore.categories.appetite < 30 ? 'critical' : 'warning',
        category: 'appetite',
        message: currentScore.categories.appetite < 30 
          ? '食欲不振が続いています。獣医師の診察を受けることをお勧めします。'
          : '食欲に変化が見られます。',
        severity: currentScore.categories.appetite < 30 ? 4 : 2,
        created: new Date()
      });
    }

    // Symptoms alerts
    if (currentScore.categories.symptoms < 70) {
      alerts.push({
        id: `symptoms_${Date.now()}`,
        type: currentScore.categories.symptoms < 40 ? 'critical' : 'warning',
        category: 'symptoms',
        message: currentScore.categories.symptoms < 40 
          ? '症状が頻繁に報告されています。獣医師の診察が必要です。'
          : '症状の出現頻度が気になります。',
        severity: currentScore.categories.symptoms < 40 ? 5 : 3,
        created: new Date()
      });
    }

    // Overall trend alert
    if (currentScore.trend === 'declining') {
      alerts.push({
        id: `trend_${Date.now()}`,
        type: 'warning',
        category: 'symptoms',
        message: '全体的な健康状態が下降傾向にあります。注意深く観察してください。',
        severity: 3,
        created: new Date()
      });
    }

    return alerts;
  }

  static getScoreColor(score: number): string {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FFC107'; // Yellow
    if (score >= 40) return '#FF9800'; // Orange
    return '#F44336'; // Red
  }

  static getScoreLabel(score: number): string {
    if (score >= 90) return '優秀';
    if (score >= 80) return '良好';
    if (score >= 70) return 'まずまず';
    if (score >= 60) return '要注意';
    if (score >= 40) return '心配';
    return '深刻';
  }

  static getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➖';
    }
  }
}