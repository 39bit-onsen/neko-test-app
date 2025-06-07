import { DiaryEntry, BehaviorData } from '../types';

export interface SleepAnalysis {
  averageSleepHours: number;
  sleepPattern: {
    hourlyDistribution: { [hour: number]: number };
    dailyAverages: { [day: number]: number }; // 0 = Sunday
    qualityTrend: 'improving' | 'stable' | 'declining';
  };
  sleepQuality: {
    consistency: number; // 0-100
    duration: 'too_short' | 'optimal' | 'too_long';
    recommendations: string[];
  };
}

export interface PlayAnalysis {
  averagePlayTime: number;
  playPattern: {
    hourlyDistribution: { [hour: number]: number };
    weeklyTrend: PlayTrend[];
    seasonalVariation: SeasonalPattern[];
  };
  playQuality: {
    frequency: 'low' | 'normal' | 'high';
    duration: 'short' | 'normal' | 'long';
    engagement: number; // 0-100
  };
  recommendations: string[];
}

export interface LocationAnalysis {
  favoriteLocations: LocationPreference[];
  locationChanges: LocationChange[];
  territoryMapping: {
    primary: string[];
    secondary: string[];
    avoided: string[];
  };
  timeSpentByLocation: { [location: string]: number };
}

export interface ActivityTimeAnalysis {
  peakActivityHours: string[];
  restingHours: string[];
  activityDistribution: {
    morning: number; // 6-12
    afternoon: number; // 12-18
    evening: number; // 18-22
    night: number; // 22-6
  };
  weeklyPattern: { [day: number]: ActivityPattern };
}

export interface BehaviorInsights {
  overallAssessment: {
    activityLevel: 'low' | 'normal' | 'high';
    behaviorHealth: 'excellent' | 'good' | 'concerning' | 'poor';
    stressLevel: 'low' | 'medium' | 'high';
  };
  keyFindings: string[];
  alerts: BehaviorAlert[];
  recommendations: string[];
  trends: {
    activity: 'increasing' | 'stable' | 'decreasing';
    sleep: 'improving' | 'stable' | 'declining';
    play: 'more_active' | 'stable' | 'less_active';
  };
}

interface PlayTrend {
  week: string;
  averageMinutes: number;
  change: number;
}

interface SeasonalPattern {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  averageMinutes: number;
}

interface LocationPreference {
  location: string;
  frequency: number;
  percentage: number;
  timeSpent: number; // minutes
}

interface LocationChange {
  date: Date;
  from: string;
  to: string;
  reason?: string;
}

interface ActivityPattern {
  day: number;
  averageActivity: number;
  peakHours: number[];
  lowHours: number[];
}

interface BehaviorAlert {
  type: 'warning' | 'info' | 'critical';
  category: 'sleep' | 'activity' | 'location' | 'social';
  message: string;
  severity: number; // 1-5
  date: Date;
}

export class BehaviorAnalyzer {
  static analyzeSleepPatterns(entries: DiaryEntry[]): SleepAnalysis {
    const behaviorEntries = entries
      .filter(entry => entry.type === 'behavior')
      .map(entry => ({
        date: new Date(entry.date),
        data: entry.data as BehaviorData
      }))
      .filter(entry => entry.data.sleepHours !== undefined)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (behaviorEntries.length === 0) {
      return {
        averageSleepHours: 0,
        sleepPattern: {
          hourlyDistribution: {},
          dailyAverages: {},
          qualityTrend: 'stable'
        },
        sleepQuality: {
          consistency: 0,
          duration: 'optimal',
          recommendations: ['睡眠記録を追加して分析を開始しましょう。']
        }
      };
    }

    // Calculate average sleep hours
    const totalSleepHours = behaviorEntries.reduce((sum, entry) => sum + (entry.data.sleepHours || 0), 0);
    const averageSleepHours = totalSleepHours / behaviorEntries.length;

    // Hourly distribution (assuming sleep starts at different times)
    const hourlyDistribution: { [hour: number]: number } = {};
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i] = 0;
    }

    // Daily averages (by day of week)
    const dailyAverages: { [day: number]: number } = {};
    const dailyCounts: { [day: number]: number } = {};
    
    for (let i = 0; i < 7; i++) {
      dailyAverages[i] = 0;
      dailyCounts[i] = 0;
    }

    behaviorEntries.forEach(entry => {
      const dayOfWeek = entry.date.getDay();
      dailyAverages[dayOfWeek] += entry.data.sleepHours || 0;
      dailyCounts[dayOfWeek]++;

      // Simulate hourly distribution based on typical cat sleep patterns
      const sleepHours = entry.data.sleepHours || 0;
      const startHour = 22; // Cats typically sleep more at night
      for (let i = 0; i < sleepHours && i < 24; i++) {
        const hour = (startHour + i) % 24;
        hourlyDistribution[hour] += 1;
      }
    });

    // Calculate daily averages
    for (let i = 0; i < 7; i++) {
      if (dailyCounts[i] > 0) {
        dailyAverages[i] = dailyAverages[i] / dailyCounts[i];
      }
    }

    // Calculate quality trend
    const qualityTrend = this.calculateSleepTrend(behaviorEntries);

    // Sleep quality assessment
    const consistency = this.calculateSleepConsistency(behaviorEntries);
    const duration = this.assessSleepDuration(averageSleepHours);
    const recommendations = this.generateSleepRecommendations(averageSleepHours, consistency);

    return {
      averageSleepHours,
      sleepPattern: {
        hourlyDistribution,
        dailyAverages,
        qualityTrend
      },
      sleepQuality: {
        consistency,
        duration,
        recommendations
      }
    };
  }

  static analyzePlayPatterns(entries: DiaryEntry[]): PlayAnalysis {
    const behaviorEntries = entries
      .filter(entry => entry.type === 'behavior')
      .map(entry => ({
        date: new Date(entry.date),
        data: entry.data as BehaviorData
      }))
      .filter(entry => entry.data.playTime !== undefined)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (behaviorEntries.length === 0) {
      return {
        averagePlayTime: 0,
        playPattern: {
          hourlyDistribution: {},
          weeklyTrend: [],
          seasonalVariation: []
        },
        playQuality: {
          frequency: 'normal',
          duration: 'normal',
          engagement: 0
        },
        recommendations: ['遊び時間を記録して活動パターンを分析しましょう。']
      };
    }

    // Calculate average play time
    const totalPlayTime = behaviorEntries.reduce((sum, entry) => sum + (entry.data.playTime || 0), 0);
    const averagePlayTime = totalPlayTime / behaviorEntries.length;

    // Hourly distribution (simulate based on typical active hours)
    const hourlyDistribution: { [hour: number]: number } = {};
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i] = 0;
    }

    // Simulate play time distribution (cats are typically active morning and evening)
    behaviorEntries.forEach(entry => {
      const playTime = entry.data.playTime || 0;
      if (playTime > 0) {
        // Morning activity (7-9 AM)
        hourlyDistribution[7] += playTime * 0.3;
        hourlyDistribution[8] += playTime * 0.2;
        // Evening activity (6-8 PM)
        hourlyDistribution[18] += playTime * 0.3;
        hourlyDistribution[19] += playTime * 0.2;
      }
    });

    // Weekly trend analysis
    const weeklyTrend = this.calculateWeeklyPlayTrend(behaviorEntries);

    // Seasonal variation (simplified)
    const seasonalVariation = this.calculateSeasonalPlayVariation(behaviorEntries);

    // Play quality assessment
    const frequency = this.assessPlayFrequency(behaviorEntries);
    const duration = this.assessPlayDuration(averagePlayTime);
    const engagement = this.calculatePlayEngagement(behaviorEntries);

    const recommendations = this.generatePlayRecommendations(averagePlayTime, frequency, engagement);

    return {
      averagePlayTime,
      playPattern: {
        hourlyDistribution,
        weeklyTrend,
        seasonalVariation
      },
      playQuality: {
        frequency,
        duration,
        engagement
      },
      recommendations
    };
  }

  static analyzeLocationPatterns(entries: DiaryEntry[]): LocationAnalysis {
    const behaviorEntries = entries
      .filter(entry => entry.type === 'behavior')
      .map(entry => ({
        date: new Date(entry.date),
        data: entry.data as BehaviorData
      }))
      .filter(entry => entry.data.location && entry.data.location.length > 0);

    if (behaviorEntries.length === 0) {
      return {
        favoriteLocations: [],
        locationChanges: [],
        territoryMapping: {
          primary: [],
          secondary: [],
          avoided: []
        },
        timeSpentByLocation: {}
      };
    }

    // Calculate location frequencies
    const locationCounts: { [location: string]: number } = {};
    const timeSpentByLocation: { [location: string]: number } = {};

    behaviorEntries.forEach(entry => {
      const locations = entry.data.location || [];
      locations.forEach(location => {
        locationCounts[location] = (locationCounts[location] || 0) + 1;
        // Estimate time spent (simplified calculation)
        timeSpentByLocation[location] = (timeSpentByLocation[location] || 0) + 60; // 1 hour per entry
      });
    });

    // Create favorite locations list
    const totalEntries = behaviorEntries.length;
    const favoriteLocations: LocationPreference[] = Object.entries(locationCounts)
      .map(([location, frequency]) => ({
        location,
        frequency,
        percentage: (frequency / totalEntries) * 100,
        timeSpent: timeSpentByLocation[location] || 0
      }))
      .sort((a, b) => b.frequency - a.frequency);

    // Territory mapping
    const sortedLocations = favoriteLocations.map(l => l.location);
    const territoryMapping = {
      primary: sortedLocations.slice(0, 2), // Top 2 locations
      secondary: sortedLocations.slice(2, 5), // Next 3 locations
      avoided: [] // Would need negative data to determine
    };

    // Location changes (simplified)
    const locationChanges: LocationChange[] = [];
    for (let i = 1; i < behaviorEntries.length; i++) {
      const prev = behaviorEntries[i - 1];
      const curr = behaviorEntries[i];
      
      const prevLocations = prev.data.location || [];
      const currLocations = curr.data.location || [];
      
      // Check for new locations
      currLocations.forEach(location => {
        if (!prevLocations.includes(location)) {
          locationChanges.push({
            date: curr.date,
            from: prevLocations[0] || 'unknown',
            to: location
          });
        }
      });
    }

    return {
      favoriteLocations,
      locationChanges: locationChanges.slice(-10), // Last 10 changes
      territoryMapping,
      timeSpentByLocation
    };
  }

  static analyzeActivityTimePatterns(entries: DiaryEntry[]): ActivityTimeAnalysis {
    const behaviorEntries = entries
      .filter(entry => entry.type === 'behavior')
      .map(entry => ({
        date: new Date(entry.date),
        data: entry.data as BehaviorData
      }));

    if (behaviorEntries.length === 0) {
      return {
        peakActivityHours: [],
        restingHours: [],
        activityDistribution: {
          morning: 0,
          afternoon: 0,
          evening: 0,
          night: 0
        },
        weeklyPattern: {}
      };
    }

    // Convert activity levels to numbers
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

    // Hourly activity distribution (simplified simulation)
    const hourlyActivity: { [hour: number]: number[] } = {};
    for (let i = 0; i < 24; i++) {
      hourlyActivity[i] = [];
    }

    // Simulate activity distribution based on entry time
    behaviorEntries.forEach(entry => {
      const hour = entry.date.getHours();
      const activityLevel = activityToNumber(entry.data.activityLevel);
      hourlyActivity[hour].push(activityLevel);
    });

    // Calculate average activity per hour
    const hourlyAverages: { [hour: number]: number } = {};
    for (let i = 0; i < 24; i++) {
      if (hourlyActivity[i].length > 0) {
        hourlyAverages[i] = hourlyActivity[i].reduce((sum, val) => sum + val, 0) / hourlyActivity[i].length;
      } else {
        hourlyAverages[i] = 0;
      }
    }

    // Find peak and resting hours
    const sortedHours = Object.entries(hourlyAverages)
      .sort(([,a], [,b]) => b - a);
    
    const peakActivityHours = sortedHours.slice(0, 3).map(([hour]) => `${hour}:00`);
    const restingHours = sortedHours.slice(-3).map(([hour]) => `${hour}:00`);

    // Activity distribution by time periods
    const activityDistribution = {
      morning: this.getAverageForPeriod(hourlyAverages, 6, 12),
      afternoon: this.getAverageForPeriod(hourlyAverages, 12, 18),
      evening: this.getAverageForPeriod(hourlyAverages, 18, 22),
      night: this.getAverageForPeriod(hourlyAverages, 22, 6)
    };

    // Weekly pattern
    const weeklyPattern: { [day: number]: ActivityPattern } = {};
    for (let day = 0; day < 7; day++) {
      const dayEntries = behaviorEntries.filter(entry => entry.date.getDay() === day);
      if (dayEntries.length > 0) {
        const avgActivity = dayEntries.reduce((sum, entry) => 
          sum + activityToNumber(entry.data.activityLevel), 0
        ) / dayEntries.length;

        weeklyPattern[day] = {
          day,
          averageActivity: avgActivity,
          peakHours: [7, 19], // Simplified
          lowHours: [2, 14]
        };
      }
    }

    return {
      peakActivityHours,
      restingHours,
      activityDistribution,
      weeklyPattern
    };
  }

  static generateBehaviorInsights(entries: DiaryEntry[]): BehaviorInsights {
    const behaviorEntries = entries.filter(entry => entry.type === 'behavior');
    
    if (behaviorEntries.length === 0) {
      return {
        overallAssessment: {
          activityLevel: 'normal',
          behaviorHealth: 'good',
          stressLevel: 'low'
        },
        keyFindings: ['行動記録を追加して詳細な分析を開始しましょう。'],
        alerts: [],
        recommendations: ['定期的な行動記録で健康状態を把握しましょう。'],
        trends: {
          activity: 'stable',
          sleep: 'stable',
          play: 'stable'
        }
      };
    }

    // Overall assessment
    const overallAssessment = this.assessOverallBehavior(behaviorEntries);
    
    // Key findings
    const keyFindings = this.generateKeyFindings(behaviorEntries);
    
    // Alerts
    const alerts = this.generateBehaviorAlerts(behaviorEntries);
    
    // Recommendations
    const recommendations = this.generateBehaviorRecommendations(behaviorEntries, overallAssessment);
    
    // Trends
    const trends = this.calculateBehaviorTrends(behaviorEntries);

    return {
      overallAssessment,
      keyFindings,
      alerts,
      recommendations,
      trends
    };
  }

  // Helper methods
  private static calculateSleepTrend(entries: any[]): 'improving' | 'stable' | 'declining' {
    if (entries.length < 7) return 'stable';
    
    const recent = entries.slice(-7);
    const previous = entries.slice(-14, -7);
    
    if (previous.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, entry) => sum + (entry.data.sleepHours || 0), 0) / recent.length;
    const previousAvg = previous.reduce((sum, entry) => sum + (entry.data.sleepHours || 0), 0) / previous.length;
    
    const diff = recentAvg - previousAvg;
    
    if (diff >= 0.5) return 'improving';
    if (diff <= -0.5) return 'declining';
    return 'stable';
  }

  private static calculateSleepConsistency(entries: any[]): number {
    if (entries.length < 3) return 50;
    
    const sleepHours = entries.map(entry => entry.data.sleepHours || 0);
    const mean = sleepHours.reduce((sum, hours) => sum + hours, 0) / sleepHours.length;
    const variance = sleepHours.reduce((sum, hours) => sum + Math.pow(hours - mean, 2), 0) / sleepHours.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to 0-100 scale (lower std dev = higher consistency)
    return Math.max(0, Math.min(100, 100 - (stdDev * 10)));
  }

  private static assessSleepDuration(avgHours: number): 'too_short' | 'optimal' | 'too_long' {
    if (avgHours < 10) return 'too_short';
    if (avgHours > 16) return 'too_long';
    return 'optimal';
  }

  private static generateSleepRecommendations(avgHours: number, consistency: number): string[] {
    const recommendations: string[] = [];
    
    if (avgHours < 10) {
      recommendations.push('猫の睡眠時間が短いようです。ストレスや環境要因を確認しましょう。');
    } else if (avgHours > 16) {
      recommendations.push('睡眠時間が長めです。活動量を増やすことを検討しましょう。');
    }
    
    if (consistency < 60) {
      recommendations.push('睡眠パターンが不規則です。規則正しい環境づくりを心がけましょう。');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('良好な睡眠パターンを維持しています。');
    }
    
    return recommendations;
  }

  private static calculateWeeklyPlayTrend(entries: any[]): PlayTrend[] {
    const weeklyData: { [week: string]: number[] } = {};
    
    entries.forEach(entry => {
      const week = this.getWeekKey(entry.date);
      if (!weeklyData[week]) {
        weeklyData[week] = [];
      }
      weeklyData[week].push(entry.data.playTime || 0);
    });

    const trends: PlayTrend[] = [];
    const weeks = Object.keys(weeklyData).sort();
    
    weeks.forEach((week, index) => {
      const playTimes = weeklyData[week];
      const averageMinutes = playTimes.reduce((sum, time) => sum + time, 0) / playTimes.length;
      
      let change = 0;
      if (index > 0) {
        const prevWeek = weeks[index - 1];
        const prevAverage = weeklyData[prevWeek].reduce((sum, time) => sum + time, 0) / weeklyData[prevWeek].length;
        change = averageMinutes - prevAverage;
      }
      
      trends.push({
        week,
        averageMinutes,
        change
      });
    });
    
    return trends.slice(-8); // Last 8 weeks
  }

  private static calculateSeasonalPlayVariation(entries: any[]): SeasonalPattern[] {
    const seasonalData: { [season: string]: number[] } = {
      spring: [],
      summer: [],
      fall: [],
      winter: []
    };
    
    entries.forEach(entry => {
      const season = this.getSeason(entry.date);
      seasonalData[season].push(entry.data.playTime || 0);
    });
    
    return Object.entries(seasonalData)
      .filter(([, times]) => times.length > 0)
      .map(([season, times]) => ({
        season: season as any,
        averageMinutes: times.reduce((sum, time) => sum + time, 0) / times.length
      }));
  }

  private static assessPlayFrequency(entries: any[]): 'low' | 'normal' | 'high' {
    const daysWithPlay = new Set(entries.map(entry => entry.date.toDateString())).size;
    const totalDays = Math.max(1, (Date.now() - entries[0].date.getTime()) / (1000 * 60 * 60 * 24));
    const frequency = daysWithPlay / totalDays;
    
    if (frequency < 0.3) return 'low';
    if (frequency > 0.7) return 'high';
    return 'normal';
  }

  private static assessPlayDuration(avgMinutes: number): 'short' | 'normal' | 'long' {
    if (avgMinutes < 15) return 'short';
    if (avgMinutes > 45) return 'long';
    return 'normal';
  }

  private static calculatePlayEngagement(entries: any[]): number {
    // Simplified engagement calculation based on consistency and duration
    const playTimes = entries.map(entry => entry.data.playTime || 0);
    const consistency = this.calculateConsistency(playTimes);
    const avgDuration = playTimes.reduce((sum, time) => sum + time, 0) / playTimes.length;
    
    const durationScore = Math.min(100, (avgDuration / 30) * 100); // 30 minutes = 100%
    return Math.round((consistency + durationScore) / 2);
  }

  private static generatePlayRecommendations(avgTime: number, frequency: string, engagement: number): string[] {
    const recommendations: string[] = [];
    
    if (avgTime < 15) {
      recommendations.push('遊び時間を増やしましょう。1日15-30分の活発な遊びがおすすめです。');
    }
    
    if (frequency === 'low') {
      recommendations.push('遊ぶ頻度を増やしましょう。毎日の遊び時間を設けることが大切です。');
    }
    
    if (engagement < 60) {
      recommendations.push('遊びの質を向上させましょう。猫の興味を引く新しいおもちゃを試してみてください。');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('良い遊び習慣を維持しています！');
    }
    
    return recommendations;
  }

  private static assessOverallBehavior(entries: any[]): any {
    // Simplified overall assessment
    const activityLevels = entries.map(entry => {
      switch (entry.data.activityLevel) {
        case 'very_active': return 5;
        case 'active': return 4;
        case 'normal': return 3;
        case 'calm': return 2;
        case 'lethargic': return 1;
        default: return 3;
      }
    });
    
    const avgActivity = activityLevels.reduce((sum, level) => sum + level, 0) / activityLevels.length;
    
    return {
      activityLevel: avgActivity >= 4 ? 'high' : avgActivity >= 2.5 ? 'normal' : 'low',
      behaviorHealth: avgActivity >= 3.5 ? 'excellent' : avgActivity >= 2.5 ? 'good' : avgActivity >= 1.5 ? 'concerning' : 'poor',
      stressLevel: avgActivity <= 2 ? 'high' : avgActivity >= 4 ? 'low' : 'medium'
    };
  }

  private static generateKeyFindings(entries: any[]): string[] {
    const findings: string[] = [];
    
    const sleepEntries = entries.filter(entry => entry.data.sleepHours !== undefined);
    const playEntries = entries.filter(entry => entry.data.playTime !== undefined);
    
    if (sleepEntries.length > 0) {
      const avgSleep = sleepEntries.reduce((sum, entry) => sum + (entry.data.sleepHours || 0), 0) / sleepEntries.length;
      findings.push(`平均睡眠時間: ${avgSleep.toFixed(1)}時間`);
    }
    
    if (playEntries.length > 0) {
      const avgPlay = playEntries.reduce((sum, entry) => sum + (entry.data.playTime || 0), 0) / playEntries.length;
      findings.push(`平均遊び時間: ${avgPlay.toFixed(1)}分`);
    }
    
    return findings;
  }

  private static generateBehaviorAlerts(entries: any[]): BehaviorAlert[] {
    const alerts: BehaviorAlert[] = [];
    
    // Check for concerning activity levels
    const recentEntries = entries.slice(-7); // Last 7 entries
    const lowActivityCount = recentEntries.filter(entry => 
      entry.data.activityLevel === 'lethargic' || entry.data.activityLevel === 'calm'
    ).length;
    
    if (lowActivityCount >= 5) {
      alerts.push({
        type: 'warning',
        category: 'activity',
        message: '最近活動レベルが低下しています。健康状態を確認してください。',
        severity: 3,
        date: new Date()
      });
    }
    
    return alerts;
  }

  private static generateBehaviorRecommendations(entries: any[], assessment: any): string[] {
    const recommendations: string[] = [];
    
    if (assessment.activityLevel === 'low') {
      recommendations.push('活動量を増やすため、遊び時間を増やしましょう。');
    }
    
    if (assessment.stressLevel === 'high') {
      recommendations.push('ストレス軽減のため、静かで安全な環境を提供しましょう。');
    }
    
    return recommendations;
  }

  private static calculateBehaviorTrends(entries: any[]): any {
    if (entries.length < 14) {
      return {
        activity: 'stable',
        sleep: 'stable',
        play: 'stable'
      };
    }
    
    const recent = entries.slice(-7);
    const previous = entries.slice(-14, -7);
    
    // Activity trend
    const recentActivity = this.getAverageActivityLevel(recent);
    const previousActivity = this.getAverageActivityLevel(previous);
    const activityTrend = recentActivity > previousActivity + 0.3 ? 'increasing' : 
                         recentActivity < previousActivity - 0.3 ? 'decreasing' : 'stable';
    
    return {
      activity: activityTrend,
      sleep: 'stable', // Would need sleep data analysis
      play: 'stable'   // Would need play data analysis
    };
  }

  // Utility methods
  private static getAverageForPeriod(hourlyData: { [hour: number]: number }, start: number, end: number): number {
    let sum = 0;
    let count = 0;
    
    if (start <= end) {
      for (let i = start; i < end; i++) {
        sum += hourlyData[i] || 0;
        count++;
      }
    } else {
      // Handle overnight period
      for (let i = start; i < 24; i++) {
        sum += hourlyData[i] || 0;
        count++;
      }
      for (let i = 0; i < end; i++) {
        sum += hourlyData[i] || 0;
        count++;
      }
    }
    
    return count > 0 ? sum / count : 0;
  }

  private static getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = Math.floor((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week}`;
  }

  private static getSeason(date: Date): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private static calculateConsistency(values: number[]): number {
    if (values.length < 2) return 100;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return Math.max(0, Math.min(100, 100 - (stdDev * 5)));
  }

  private static getAverageActivityLevel(entries: any[]): number {
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
    
    const total = entries.reduce((sum, entry) => sum + activityToNumber(entry.data.activityLevel), 0);
    return total / entries.length;
  }
}