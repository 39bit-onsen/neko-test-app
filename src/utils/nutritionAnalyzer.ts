import { DiaryEntry, FoodData } from '../types';

export interface MealPattern {
  hourlyDistribution: { [hour: number]: number };
  dailyAverages: {
    breakfast: number; // 6-10
    lunch: number; // 11-15
    dinner: number; // 16-21
    night: number; // 22-5
  };
  peakMealTimes: string[];
  averageMealsPerDay: number;
}

export interface ConsumptionStats {
  overallCompletionRate: number;
  appetiteDistribution: { [appetite: string]: number };
  wastageRate: number;
  averageAmount: {
    perMeal: number;
    perDay: number;
    unit: string;
  };
  foodTypePreferences: { [foodType: string]: number };
}

export interface TimeDistribution {
  hourly: { [hour: number]: number };
  weeklyPattern: { [day: number]: number }; // 0 = Sunday
  mealIntervals: {
    average: number; // hours
    shortest: number;
    longest: number;
    distribution: { [interval: string]: number };
  };
}

export interface NutritionInsights {
  weeklyTrends: {
    appetite: 'improving' | 'stable' | 'declining';
    consumption: 'increasing' | 'stable' | 'decreasing';
    regularity: 'more_regular' | 'stable' | 'less_regular';
  };
  recommendations: string[];
  alerts: {
    type: 'warning' | 'info';
    message: string;
  }[];
}

export class NutritionAnalyzer {
  static analyzeMealPatterns(entries: DiaryEntry[]): MealPattern {
    const foodEntries = entries
      .filter(entry => entry.type === 'food')
      .map(entry => ({
        date: entry.date,
        data: entry.data as FoodData
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Hourly distribution
    const hourlyDistribution: { [hour: number]: number } = {};
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i] = 0;
    }

    const dailyMealCounts: { [dateKey: string]: number } = {};

    foodEntries.forEach(entry => {
      const date = new Date(entry.date);
      const hour = parseInt(entry.data.time.split(':')[0]);
      const dateKey = date.toDateString();

      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      dailyMealCounts[dateKey] = (dailyMealCounts[dateKey] || 0) + 1;
    });

    // Daily period averages
    const breakfast = this.sumHours(hourlyDistribution, 6, 10);
    const lunch = this.sumHours(hourlyDistribution, 11, 15);
    const dinner = this.sumHours(hourlyDistribution, 16, 21);
    const night = this.sumHours(hourlyDistribution, 22, 5);

    const dailyAverages = {
      breakfast: breakfast / Object.keys(dailyMealCounts).length || 0,
      lunch: lunch / Object.keys(dailyMealCounts).length || 0,
      dinner: dinner / Object.keys(dailyMealCounts).length || 0,
      night: night / Object.keys(dailyMealCounts).length || 0
    };

    // Peak meal times
    const peakMealTimes = this.findPeakHours(hourlyDistribution, 3);

    // Average meals per day
    const totalDays = Object.keys(dailyMealCounts).length || 1;
    const averageMealsPerDay = foodEntries.length / totalDays;

    return {
      hourlyDistribution,
      dailyAverages,
      peakMealTimes,
      averageMealsPerDay
    };
  }

  static calculateConsumptionRate(entries: DiaryEntry[]): ConsumptionStats {
    const foodEntries = entries
      .filter(entry => entry.type === 'food')
      .map(entry => entry.data as FoodData);

    if (foodEntries.length === 0) {
      return {
        overallCompletionRate: 0,
        appetiteDistribution: {},
        wastageRate: 0,
        averageAmount: { perMeal: 0, perDay: 0, unit: 'g' },
        foodTypePreferences: {}
      };
    }

    // Completion rate
    const completedMeals = foodEntries.filter(entry => entry.finished).length;
    const overallCompletionRate = (completedMeals / foodEntries.length) * 100;

    // Appetite distribution
    const appetiteDistribution: { [appetite: string]: number } = {};
    foodEntries.forEach(entry => {
      appetiteDistribution[entry.appetite] = (appetiteDistribution[entry.appetite] || 0) + 1;
    });

    // Wastage rate (inverse of completion rate)
    const wastageRate = 100 - overallCompletionRate;

    // Average amounts
    const totalAmount = foodEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const commonUnit = this.getMostCommonUnit(foodEntries);
    
    // Group by day for daily average
    const dailyAmounts: { [dateKey: string]: number } = {};
    
    // We need to map entries back to get the original entry dates
    const entriesWithDates = entries
      .filter(entry => entry.type === 'food')
      .map(entry => ({
        date: new Date(entry.date),
        amount: (entry.data as FoodData).amount
      }));

    entriesWithDates.forEach(entry => {
      const dateKey = entry.date.toDateString();
      dailyAmounts[dateKey] = (dailyAmounts[dateKey] || 0) + entry.amount;
    });

    const averageAmount = {
      perMeal: totalAmount / foodEntries.length,
      perDay: Object.values(dailyAmounts).reduce((sum, amount) => sum + amount, 0) / Object.keys(dailyAmounts).length || 0,
      unit: commonUnit
    };

    // Food type preferences
    const foodTypePreferences: { [foodType: string]: number } = {};
    foodEntries.forEach(entry => {
      foodTypePreferences[entry.foodType] = (foodTypePreferences[entry.foodType] || 0) + 1;
    });

    return {
      overallCompletionRate,
      appetiteDistribution,
      wastageRate,
      averageAmount,
      foodTypePreferences
    };
  }

  static getMealTimeDistribution(entries: DiaryEntry[]): TimeDistribution {
    const foodEntries = entries
      .filter(entry => entry.type === 'food')
      .map(entry => ({
        date: new Date(entry.date),
        time: (entry.data as FoodData).time,
        data: entry.data as FoodData
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Hourly distribution
    const hourly: { [hour: number]: number } = {};
    for (let i = 0; i < 24; i++) {
      hourly[i] = 0;
    }

    // Weekly pattern (0 = Sunday)
    const weeklyPattern: { [day: number]: number } = {};
    for (let i = 0; i < 7; i++) {
      weeklyPattern[i] = 0;
    }

    foodEntries.forEach(entry => {
      const hour = parseInt(entry.time.split(':')[0]);
      const dayOfWeek = entry.date.getDay();
      
      hourly[hour] = (hourly[hour] || 0) + 1;
      weeklyPattern[dayOfWeek] = (weeklyPattern[dayOfWeek] || 0) + 1;
    });

    // Meal intervals
    const intervals: number[] = [];
    for (let i = 1; i < foodEntries.length; i++) {
      const prev = foodEntries[i - 1];
      const curr = foodEntries[i];
      
      const prevDateTime = new Date(`${prev.date.toDateString()} ${prev.time}`);
      const currDateTime = new Date(`${curr.date.toDateString()} ${curr.time}`);
      
      const diffHours = (currDateTime.getTime() - prevDateTime.getTime()) / (1000 * 60 * 60);
      
      // Only consider intervals within reasonable range (1-24 hours)
      if (diffHours > 0 && diffHours <= 24) {
        intervals.push(diffHours);
      }
    }

    const mealIntervals = {
      average: intervals.length > 0 ? intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length : 0,
      shortest: intervals.length > 0 ? Math.min(...intervals) : 0,
      longest: intervals.length > 0 ? Math.max(...intervals) : 0,
      distribution: this.groupIntervals(intervals)
    };

    return {
      hourly,
      weeklyPattern,
      mealIntervals
    };
  }

  static generateNutritionInsights(entries: DiaryEntry[]): NutritionInsights {
    const recentEntries = this.getRecentEntries(entries, 14);
    const olderEntries = this.getEntriesInRange(entries, 28, 14);

    const recentPatterns = this.analyzeMealPatterns(recentEntries);
    const olderPatterns = this.analyzeMealPatterns(olderEntries);

    const recentConsumption = this.calculateConsumptionRate(recentEntries);
    const olderConsumption = this.calculateConsumptionRate(olderEntries);

    // Trend analysis
    const appetiteTrend = this.calculateAppetiteTrend(recentEntries, olderEntries);
    const consumptionTrend = this.calculateConsumptionTrend(recentConsumption, olderConsumption);
    const regularityTrend = this.calculateRegularityTrend(recentPatterns, olderPatterns);

    const weeklyTrends = {
      appetite: appetiteTrend,
      consumption: consumptionTrend,
      regularity: regularityTrend
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(recentConsumption, recentPatterns);

    // Generate alerts
    const alerts = this.generateNutritionAlerts(recentConsumption, recentPatterns);

    return {
      weeklyTrends,
      recommendations,
      alerts
    };
  }

  // Helper methods
  private static sumHours(hourlyData: { [hour: number]: number }, start: number, end: number): number {
    let sum = 0;
    if (start <= end) {
      for (let i = start; i <= end; i++) {
        sum += hourlyData[i] || 0;
      }
    } else {
      // Handle overnight period (e.g., 22-5)
      for (let i = start; i < 24; i++) {
        sum += hourlyData[i] || 0;
      }
      for (let i = 0; i <= end; i++) {
        sum += hourlyData[i] || 0;
      }
    }
    return sum;
  }

  private static findPeakHours(hourlyData: { [hour: number]: number }, topN: number): string[] {
    const sorted = Object.entries(hourlyData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, topN);
    
    return sorted.map(([hour]) => `${hour}:00`);
  }

  private static getMostCommonUnit(foodEntries: FoodData[]): string {
    const unitCounts: { [unit: string]: number } = {};
    foodEntries.forEach(entry => {
      unitCounts[entry.amountUnit] = (unitCounts[entry.amountUnit] || 0) + 1;
    });
    
    return Object.entries(unitCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'g';
  }

  private static groupIntervals(intervals: number[]): { [interval: string]: number } {
    const groups = {
      '1-3時間': 0,
      '3-6時間': 0,
      '6-12時間': 0,
      '12時間以上': 0
    };

    intervals.forEach(interval => {
      if (interval <= 3) groups['1-3時間']++;
      else if (interval <= 6) groups['3-6時間']++;
      else if (interval <= 12) groups['6-12時間']++;
      else groups['12時間以上']++;
    });

    return groups;
  }

  private static getRecentEntries(entries: DiaryEntry[], days: number): DiaryEntry[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return entries.filter(entry => new Date(entry.date) >= cutoffDate);
  }

  private static getEntriesInRange(entries: DiaryEntry[], startDays: number, endDays: number): DiaryEntry[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDays);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - endDays);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= endDate && entryDate < startDate;
    });
  }

  private static calculateAppetiteTrend(recent: DiaryEntry[], older: DiaryEntry[]): 'improving' | 'stable' | 'declining' {
    const getAverageAppetite = (entries: DiaryEntry[]): number => {
      const foodEntries = entries.filter(entry => entry.type === 'food');
      if (foodEntries.length === 0) return 3;
      
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

      const total = foodEntries.reduce((sum, entry) => 
        sum + appetiteToNumber((entry.data as FoodData).appetite), 0
      );
      return total / foodEntries.length;
    };

    const recentAvg = getAverageAppetite(recent);
    const olderAvg = getAverageAppetite(older);
    const diff = recentAvg - olderAvg;

    if (diff >= 0.3) return 'improving';
    if (diff <= -0.3) return 'declining';
    return 'stable';
  }

  private static calculateConsumptionTrend(recent: ConsumptionStats, older: ConsumptionStats): 'increasing' | 'stable' | 'decreasing' {
    const diff = recent.overallCompletionRate - older.overallCompletionRate;
    
    if (diff >= 10) return 'increasing';
    if (diff <= -10) return 'decreasing';
    return 'stable';
  }

  private static calculateRegularityTrend(recent: MealPattern, older: MealPattern): 'more_regular' | 'stable' | 'less_regular' {
    // Calculate variance in meal timing to measure regularity
    const getTimingVariance = (pattern: MealPattern): number => {
      const hours = Object.keys(pattern.hourlyDistribution).map(Number);
      const counts = Object.values(pattern.hourlyDistribution);
      
      if (counts.length === 0) return 0;
      
      // Standard deviation of meal times
      const mean = hours.reduce((sum, hour, i) => sum + (hour * counts[i]), 0) / 
                   counts.reduce((sum, count) => sum + count, 0);
      
      const variance = hours.reduce((sum, hour, i) => 
        sum + (counts[i] * Math.pow(hour - mean, 2)), 0
      ) / counts.reduce((sum, count) => sum + count, 0);
      
      return Math.sqrt(variance);
    };

    const recentVariance = getTimingVariance(recent);
    const olderVariance = getTimingVariance(older);
    const diff = olderVariance - recentVariance; // Lower variance = more regular

    if (diff >= 1) return 'more_regular';
    if (diff <= -1) return 'less_regular';
    return 'stable';
  }

  private static generateRecommendations(consumption: ConsumptionStats, patterns: MealPattern): string[] {
    const recommendations: string[] = [];

    // Completion rate recommendations
    if (consumption.overallCompletionRate < 70) {
      recommendations.push('食べ残しが多いようです。食事量を調整するか、好みの食事を見つけましょう。');
    }

    // Meal frequency recommendations
    if (patterns.averageMealsPerDay < 2) {
      recommendations.push('食事回数が少ないようです。1日2-3回の規則正しい食事をお勧めします。');
    } else if (patterns.averageMealsPerDay > 4) {
      recommendations.push('食事回数が多いようです。間食を減らして主食を重視しましょう。');
    }

    // Meal timing recommendations
    if (patterns.dailyAverages.night > patterns.dailyAverages.dinner) {
      recommendations.push('夜遅い時間の食事が多いようです。夕食の時間を早めることをお勧めします。');
    }

    // Appetite recommendations
    const poorAppetiteRate = (consumption.appetiteDistribution.poor || 0) + 
                            (consumption.appetiteDistribution.none || 0);
    const totalMeals = Object.values(consumption.appetiteDistribution).reduce((sum, count) => sum + count, 0);
    
    if (poorAppetiteRate / totalMeals > 0.3) {
      recommendations.push('食欲不振が続いています。獣医師に相談することをお勧めします。');
    }

    return recommendations.slice(0, 3); // Limit to 3 recommendations
  }

  private static generateNutritionAlerts(consumption: ConsumptionStats, patterns: MealPattern): Array<{type: 'warning' | 'info'; message: string}> {
    const alerts: Array<{type: 'warning' | 'info'; message: string}> = [];

    // Critical completion rate
    if (consumption.overallCompletionRate < 50) {
      alerts.push({
        type: 'warning',
        message: '食事完食率が50%を下回っています。健康状態を確認してください。'
      });
    }

    // Irregular meal patterns
    if (patterns.averageMealsPerDay < 1.5) {
      alerts.push({
        type: 'warning',
        message: '食事回数が非常に少ないです。食欲不振の可能性があります。'
      });
    }

    // Positive trends
    if (consumption.overallCompletionRate > 85) {
      alerts.push({
        type: 'info',
        message: '食事を良く食べています！健康的な食習慣を維持しましょう。'
      });
    }

    return alerts;
  }
}