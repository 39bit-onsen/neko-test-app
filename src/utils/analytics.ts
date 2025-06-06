import { DiaryEntry, HealthData, FoodData, BehaviorData } from '../types';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
    tension?: number;
  }[];
}

export interface FrequencyData {
  [key: string]: number;
}

export interface TrendPoint {
  date: string;
  value: number;
}

export class BasicStats {
  static filterEntriesByDateRange(
    entries: DiaryEntry[], 
    days: number
  ): DiaryEntry[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return entries.filter(entry => new Date(entry.date) >= cutoffDate);
  }

  static calculateWeightTrend(entries: DiaryEntry[]): ChartData {
    const healthEntries = entries
      .filter(entry => entry.type === 'health')
      .map(entry => ({
        date: entry.date,
        data: entry.data as HealthData
      }))
      .filter(entry => entry.data.weight !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const labels = healthEntries.map(entry => 
      new Date(entry.date).toLocaleDateString('ja-JP', { 
        month: 'short', 
        day: 'numeric' 
      })
    );
    
    const weights = healthEntries.map(entry => entry.data.weight || 0);

    return {
      labels,
      datasets: [{
        label: '体重 (kg)',
        data: weights,
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  static calculateAppetiteTrend(entries: DiaryEntry[]): ChartData {
    const foodEntries = entries
      .filter(entry => entry.type === 'food')
      .map(entry => ({
        date: entry.date,
        data: entry.data as FoodData
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Convert appetite strings to numbers
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

    // Group by date and calculate average appetite per day
    const dailyAppetite: { [key: string]: number[] } = {};
    
    foodEntries.forEach(entry => {
      const dateKey = new Date(entry.date).toDateString();
      if (!dailyAppetite[dateKey]) {
        dailyAppetite[dateKey] = [];
      }
      dailyAppetite[dateKey].push(appetiteToNumber(entry.data.appetite));
    });

    const labels = Object.keys(dailyAppetite).map(dateKey =>
      new Date(dateKey).toLocaleDateString('ja-JP', { 
        month: 'short', 
        day: 'numeric' 
      })
    );

    const appetiteValues = Object.values(dailyAppetite).map(appetites =>
      appetites.reduce((sum, appetite) => sum + appetite, 0) / appetites.length
    );

    return {
      labels,
      datasets: [{
        label: '食欲レベル',
        data: appetiteValues,
        borderColor: '#4ECDC4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  static calculateActivityTrend(entries: DiaryEntry[]): ChartData {
    const behaviorEntries = entries
      .filter(entry => entry.type === 'behavior')
      .map(entry => ({
        date: entry.date,
        data: entry.data as BehaviorData
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Convert activity level strings to numbers
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

    // Group by date and calculate average activity per day
    const dailyActivity: { [key: string]: number[] } = {};
    
    behaviorEntries.forEach(entry => {
      const dateKey = new Date(entry.date).toDateString();
      if (!dailyActivity[dateKey]) {
        dailyActivity[dateKey] = [];
      }
      dailyActivity[dateKey].push(activityToNumber(entry.data.activityLevel));
    });

    const labels = Object.keys(dailyActivity).map(dateKey =>
      new Date(dateKey).toLocaleDateString('ja-JP', { 
        month: 'short', 
        day: 'numeric' 
      })
    );

    const activityValues = Object.values(dailyActivity).map(activities =>
      activities.reduce((sum, activity) => sum + activity, 0) / activities.length
    );

    return {
      labels,
      datasets: [{
        label: '活動レベル',
        data: activityValues,
        borderColor: '#45B7D1',
        backgroundColor: 'rgba(69, 183, 209, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  static getSymptomFrequency(entries: DiaryEntry[]): FrequencyData {
    const healthEntries = entries
      .filter(entry => entry.type === 'health')
      .map(entry => entry.data as HealthData);

    const symptomCounts: FrequencyData = {};

    healthEntries.forEach(entry => {
      if (entry.symptoms && entry.symptoms.length > 0) {
        entry.symptoms.forEach(symptom => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
      }
    });

    return symptomCounts;
  }

  static getSymptomFrequencyChart(entries: DiaryEntry[]): ChartData {
    const frequency = this.getSymptomFrequency(entries);
    const sortedSymptoms = Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10 symptoms

    return {
      labels: sortedSymptoms.map(([symptom]) => symptom),
      datasets: [{
        label: '症状出現回数',
        data: sortedSymptoms.map(([, count]) => count),
        borderColor: '#FF8C42',
        backgroundColor: 'rgba(255, 140, 66, 0.6)',
      }]
    };
  }

  static calculateBasicStats(entries: DiaryEntry[]) {
    const totalEntries = entries.length;
    const typeDistribution = entries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const recentEntries = this.filterEntriesByDateRange(entries, 7);
    const weeklyAverage = recentEntries.length / 7;

    return {
      totalEntries,
      typeDistribution,
      weeklyAverage: Math.round(weeklyAverage * 10) / 10,
      oldestEntry: entries.length > 0 ? 
        new Date(Math.min(...entries.map(e => new Date(e.date).getTime()))) : null,
      newestEntry: entries.length > 0 ? 
        new Date(Math.max(...entries.map(e => new Date(e.date).getTime()))) : null
    };
  }
}