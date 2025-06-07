import { DiaryEntry, HealthData, BehaviorData, FoodData } from '../types';

export interface PredictionModel {
  type: 'health' | 'behavior' | 'weight' | 'appetite';
  confidence: number; // 0-100
  timeframe: 'short' | 'medium' | 'long'; // 1-7days, 1-4weeks, 1-6months
  prediction: any;
  factors: string[];
  lastUpdated: Date;
}

export interface TrendAnalysis {
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  strength: number; // 0-100
  duration: number; // days
  inflectionPoints: Date[];
  prediction: {
    direction: 'up' | 'down' | 'stable';
    confidence: number;
    expectedChange: number;
  };
}

export interface HealthPrediction {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  potentialIssues: string[];
  recommendations: string[];
  timeToNextVetVisit: number; // days
  probability: number; // 0-100
}

export interface BehaviorPrediction {
  moodTrend: 'improving' | 'stable' | 'declining';
  activityForecast: number; // expected activity level 0-100
  stressIndicators: string[];
  socialNeeds: string[];
  environmentalFactors: string[];
}

export interface WeightPrediction {
  targetWeight: number;
  weightTrend: TrendAnalysis;
  timeToTarget: number; // days
  dietRecommendations: string[];
  riskFactors: string[];
}

export class AIPredictionEngine {
  private static readonly CONFIDENCE_THRESHOLD = 60;
  private static readonly MIN_DATA_POINTS = 10;

  static generateHealthPrediction(entries: DiaryEntry[]): HealthPrediction {
    const healthEntries = entries
      .filter(entry => entry.type === 'health')
      .map(entry => ({
        date: new Date(entry.date),
        data: entry.data as HealthData
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (healthEntries.length < this.MIN_DATA_POINTS) {
      return {
        riskLevel: 'low',
        potentialIssues: [],
        recommendations: ['より多くの健康記録を追加して、より正確な予測を行いましょう'],
        timeToNextVetVisit: 365,
        probability: 0
      };
    }

    const recentEntries = healthEntries.slice(-30);
    const riskFactors = this.analyzeHealthRiskFactors(recentEntries);
    const symptomPatterns = this.analyzeSymptomPatterns(healthEntries);
    const weightTrend = this.analyzeWeightTrend(healthEntries);

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let probability = 0;
    const potentialIssues: string[] = [];
    const recommendations: string[] = [];

    // Analyze symptom frequency
    const recentSymptoms = recentEntries
      .flatMap(entry => entry.data.symptoms)
      .filter(symptom => symptom.trim() !== '');

    if (recentSymptoms.length > 5) {
      riskLevel = 'high';
      probability += 30;
      potentialIssues.push('症状の頻発');
      recommendations.push('獣医師への相談を検討してください');
    }

    // Analyze weight changes
    if (weightTrend.strength > 70) {
      if (weightTrend.trend === 'declining') {
        riskLevel = riskLevel === 'low' ? 'medium' : 'high';
        probability += 25;
        potentialIssues.push('体重減少');
        recommendations.push('食事量と健康状態を注意深く観察してください');
      }
    }

    // Analyze medication patterns
    const medicationEntries = recentEntries.filter(entry => 
      entry.data.medication && entry.data.medication.length > 0
    );

    if (medicationEntries.length > 0) {
      probability += 15;
      recommendations.push('薬の効果を継続的に監視してください');
    }

    // Calculate next vet visit recommendation
    const lastVetVisit = healthEntries
      .filter(entry => entry.data.vetVisit)
      .pop();

    let timeToNextVetVisit = 365;
    if (lastVetVisit) {
      const daysSinceVet = Math.floor(
        (Date.now() - lastVetVisit.date.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (riskLevel === 'critical') {
        timeToNextVetVisit = Math.max(1, 7 - daysSinceVet);
      } else if (riskLevel === 'high') {
        timeToNextVetVisit = Math.max(7, 30 - daysSinceVet);
      } else if (riskLevel === 'medium') {
        timeToNextVetVisit = Math.max(30, 90 - daysSinceVet);
      } else {
        timeToNextVetVisit = Math.max(90, 365 - daysSinceVet);
      }
    }

    return {
      riskLevel,
      potentialIssues,
      recommendations,
      timeToNextVetVisit,
      probability: Math.min(probability, 100)
    };
  }

  static generateBehaviorPrediction(entries: DiaryEntry[]): BehaviorPrediction {
    const behaviorEntries = entries
      .filter(entry => entry.type === 'behavior')
      .map(entry => ({
        date: new Date(entry.date),
        data: entry.data as BehaviorData
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (behaviorEntries.length < this.MIN_DATA_POINTS) {
      return {
        moodTrend: 'stable',
        activityForecast: 50,
        stressIndicators: [],
        socialNeeds: ['より多くの行動記録が必要です'],
        environmentalFactors: []
      };
    }

    const activityTrend = this.analyzeActivityTrend(behaviorEntries);
    const stressIndicators = this.analyzeStressIndicators(behaviorEntries);
    const socialPatterns = this.analyzeSocialPatterns(behaviorEntries);

    let moodTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (activityTrend.trend === 'improving') {
      moodTrend = 'improving';
    } else if (activityTrend.trend === 'declining') {
      moodTrend = 'declining';
    }

    const recentActivity = behaviorEntries
      .slice(-7)
      .map(entry => this.mapActivityToNumber(entry.data.activityLevel))
      .reduce((sum, val) => sum + val, 0) / Math.min(behaviorEntries.length, 7);

    return {
      moodTrend,
      activityForecast: Math.round(recentActivity * 20), // Convert to 0-100 scale
      stressIndicators,
      socialNeeds: socialPatterns,
      environmentalFactors: this.analyzeEnvironmentalFactors(behaviorEntries)
    };
  }

  static generateWeightPrediction(entries: DiaryEntry[]): WeightPrediction {
    const healthEntries = entries
      .filter(entry => entry.type === 'health')
      .map(entry => ({
        date: new Date(entry.date),
        data: entry.data as HealthData
      }))
      .filter(entry => entry.data.weight !== undefined)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (healthEntries.length < 3) {
      return {
        targetWeight: 0,
        weightTrend: {
          trend: 'unknown',
          strength: 0,
          duration: 0,
          inflectionPoints: [],
          prediction: { direction: 'stable', confidence: 0, expectedChange: 0 }
        },
        timeToTarget: 0,
        dietRecommendations: ['体重記録を増やして予測精度を向上させましょう'],
        riskFactors: []
      };
    }

    const weightTrend = this.analyzeWeightTrend(healthEntries);
    const foodEntries = entries
      .filter(entry => entry.type === 'food')
      .map(entry => entry.data as FoodData);

    const averageWeight = healthEntries
      .slice(-5)
      .reduce((sum, entry) => sum + (entry.data.weight || 0), 0) / Math.min(healthEntries.length, 5);

    // Ideal weight calculation (simplified)
    const targetWeight = this.calculateIdealWeight(averageWeight, foodEntries);
    const weightDifference = targetWeight - averageWeight;
    
    // Estimate time to reach target (simplified linear projection)
    const timeToTarget = Math.abs(weightDifference) > 0.1 
      ? Math.round(Math.abs(weightDifference) * 30) // ~30 days per 0.1kg
      : 0;

    const dietRecommendations = this.generateDietRecommendations(
      averageWeight, 
      targetWeight, 
      foodEntries
    );

    const riskFactors = this.analyzeWeightRiskFactors(healthEntries, foodEntries);

    return {
      targetWeight,
      weightTrend,
      timeToTarget,
      dietRecommendations,
      riskFactors
    };
  }

  static generateTrendAnalysis(
    data: { date: Date; value: number }[]
  ): TrendAnalysis {
    if (data.length < 3) {
      return {
        trend: 'unknown',
        strength: 0,
        duration: 0,
        inflectionPoints: [],
        prediction: { direction: 'stable', confidence: 0, expectedChange: 0 }
      };
    }

    const sortedData = data.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Simple linear regression
    const n = sortedData.length;
    const xValues = sortedData.map((_, i) => i);
    const yValues = sortedData.map(d => d.value);
    
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared for trend strength
    const yMean = sumY / n;
    const totalSumSquares = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const predictedValues = xValues.map(x => slope * x + intercept);
    const residualSumSquares = yValues.reduce((sum, y, i) => 
      sum + Math.pow(y - predictedValues[i], 2), 0
    );
    
    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    const strength = Math.round(Math.abs(rSquared) * 100);
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (Math.abs(slope) > 0.01) {
      trend = slope > 0 ? 'improving' : 'declining';
    }
    
    const duration = Math.floor(
      (sortedData[n - 1].date.getTime() - sortedData[0].date.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Find inflection points (simplified)
    const inflectionPoints: Date[] = [];
    for (let i = 1; i < n - 1; i++) {
      const prevSlope = (yValues[i] - yValues[i - 1]);
      const nextSlope = (yValues[i + 1] - yValues[i]);
      
      if (prevSlope * nextSlope < 0) {
        inflectionPoints.push(sortedData[i].date);
      }
    }

    // Prediction for next period
    const lastValue = yValues[n - 1];
    const expectedChange = slope;
    const confidence = Math.min(strength, 90);
    
    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(expectedChange) > 0.01) {
      direction = expectedChange > 0 ? 'up' : 'down';
    }

    return {
      trend,
      strength,
      duration,
      inflectionPoints,
      prediction: {
        direction,
        confidence,
        expectedChange
      }
    };
  }

  private static analyzeHealthRiskFactors(
    entries: { date: Date; data: HealthData }[]
  ): string[] {
    const riskFactors: string[] = [];
    
    const symptomCounts = new Map<string, number>();
    entries.forEach(entry => {
      entry.data.symptoms.forEach(symptom => {
        symptomCounts.set(symptom, (symptomCounts.get(symptom) || 0) + 1);
      });
    });

    // Check for recurring symptoms
    for (const [symptom, count] of symptomCounts) {
      if (count >= 3) {
        riskFactors.push(`繰り返し症状: ${symptom}`);
      }
    }

    return riskFactors;
  }

  private static analyzeSymptomPatterns(
    entries: { date: Date; data: HealthData }[]
  ): Record<string, number> {
    const patterns: Record<string, number> = {};
    
    entries.forEach(entry => {
      entry.data.symptoms.forEach(symptom => {
        patterns[symptom] = (patterns[symptom] || 0) + 1;
      });
    });

    return patterns;
  }

  private static analyzeWeightTrend(
    entries: { date: Date; data: HealthData }[]
  ): TrendAnalysis {
    const weightData = entries
      .filter(entry => entry.data.weight !== undefined)
      .map(entry => ({
        date: entry.date,
        value: entry.data.weight!
      }));

    return this.generateTrendAnalysis(weightData);
  }

  private static analyzeActivityTrend(
    entries: { date: Date; data: BehaviorData }[]
  ): TrendAnalysis {
    const activityData = entries.map(entry => ({
      date: entry.date,
      value: this.mapActivityToNumber(entry.data.activityLevel)
    }));

    return this.generateTrendAnalysis(activityData);
  }

  private static mapActivityToNumber(level: string): number {
    const mapping: Record<string, number> = {
      'very_active': 5,
      'active': 4,
      'normal': 3,
      'calm': 2,
      'lethargic': 1
    };
    return mapping[level] || 3;
  }

  private static analyzeStressIndicators(
    entries: { date: Date; data: BehaviorData }[]
  ): string[] {
    const indicators: string[] = [];
    
    const recentEntries = entries.slice(-7);
    const lowActivityCount = recentEntries.filter(
      entry => entry.data.activityLevel === 'calm' || entry.data.activityLevel === 'lethargic'
    ).length;

    if (lowActivityCount >= 4) {
      indicators.push('活動レベルの低下');
    }

    const behaviorChanges = recentEntries.filter(
      entry => entry.data.specialBehaviors.length > 0
    ).length;

    if (behaviorChanges >= 3) {
      indicators.push('行動パターンの変化');
    }

    return indicators;
  }

  private static analyzeSocialPatterns(
    entries: { date: Date; data: BehaviorData }[]
  ): string[] {
    const patterns: string[] = [];
    
    const avgPlayTime = entries
      .filter(entry => entry.data.playTime !== undefined)
      .reduce((sum, entry) => sum + (entry.data.playTime || 0), 0) / entries.length;

    if (avgPlayTime < 0.5) {
      patterns.push('遊び時間を増やしましょう');
    }

    if (avgPlayTime > 3) {
      patterns.push('十分な遊び時間が確保されています');
    }

    return patterns;
  }

  private static analyzeEnvironmentalFactors(
    entries: { date: Date; data: BehaviorData }[]
  ): string[] {
    const factors: string[] = [];
    
    const locationVariety = new Set(
      entries.flatMap(entry => entry.data.location)
    ).size;

    if (locationVariety < 3) {
      factors.push('活動場所の多様性を増やすことをお勧めします');
    }

    return factors;
  }

  private static calculateIdealWeight(
    currentWeight: number,
    foodEntries: FoodData[]
  ): number {
    // Simplified ideal weight calculation
    // In reality, this would depend on breed, age, etc.
    const avgDailyCalories = foodEntries
      .slice(-30)
      .reduce((sum, entry) => sum + (entry.amount * 4), 0) / 30; // Rough calorie estimate

    if (avgDailyCalories > 300) {
      return currentWeight * 0.95; // Suggest 5% weight reduction
    } else if (avgDailyCalories < 200) {
      return currentWeight * 1.05; // Suggest 5% weight increase
    }
    
    return currentWeight; // Current weight is ideal
  }

  private static generateDietRecommendations(
    currentWeight: number,
    targetWeight: number,
    foodEntries: FoodData[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (targetWeight < currentWeight) {
      recommendations.push('食事量を10-15%減らすことを検討してください');
      recommendations.push('高タンパク、低脂肪の食事に切り替えましょう');
    } else if (targetWeight > currentWeight) {
      recommendations.push('栄養価の高い食事を増やしましょう');
      recommendations.push('食事回数を増やすことを検討してください');
    } else {
      recommendations.push('現在の食事バランスを維持してください');
    }

    const poorAppetiteCount = foodEntries
      .slice(-7)
      .filter(entry => entry.appetite === 'poor' || entry.appetite === 'none')
      .length;

    if (poorAppetiteCount >= 3) {
      recommendations.push('食欲不振が続いている場合は獣医師に相談してください');
    }

    return recommendations;
  }

  private static analyzeWeightRiskFactors(
    healthEntries: { date: Date; data: HealthData }[],
    foodEntries: FoodData[]
  ): string[] {
    const riskFactors: string[] = [];
    
    if (healthEntries.length >= 3) {
      const weights = healthEntries.slice(-3).map(entry => entry.data.weight || 0);
      const weightChanges = weights.slice(1).map((weight, i) => weight - weights[i]);
      
      const rapidChange = weightChanges.some(change => Math.abs(change) > 0.5);
      if (rapidChange) {
        riskFactors.push('急激な体重変化');
      }
    }

    const inconsistentFeeding = this.analyzeConsistency(
      foodEntries.map(entry => entry.amount)
    );
    
    if (inconsistentFeeding > 0.5) {
      riskFactors.push('食事量の大きなばらつき');
    }

    return riskFactors;
  }

  private static analyzeConsistency(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    return standardDeviation / mean; // Coefficient of variation
  }
}