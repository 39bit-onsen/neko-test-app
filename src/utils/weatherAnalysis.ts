import { DiaryEntry, BehaviorData } from '../types';

export interface WeatherData {
  date: Date;
  temperature: number; // Celsius
  humidity: number; // Percentage
  pressure: number; // hPa
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
  windSpeed: number; // km/h
  uvIndex: number; // 0-11
}

export interface WeatherImpactAnalysis {
  temperatureCorrelation: {
    activityLevel: number; // -1 to 1
    appetite: number;
    mood: number;
    sleep: number;
  };
  humidityEffects: {
    preferredRange: { min: number; max: number };
    behaviorChanges: string[];
  };
  pressureEffects: {
    correlation: number;
    symptoms: string[];
  };
  seasonalPatterns: {
    season: 'spring' | 'summer' | 'fall' | 'winter';
    avgActivity: number;
    commonBehaviors: string[];
    healthTrends: string[];
  }[];
  recommendations: string[];
}

export interface WeatherPrediction {
  upcomingConditions: WeatherData[];
  behaviorForecast: {
    activityLevel: 'low' | 'normal' | 'high';
    moodPrediction: 'calm' | 'normal' | 'active' | 'restless';
    healthRisks: string[];
  };
  recommendations: string[];
}

export class WeatherAnalyzer {
  private static readonly WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
  private static readonly WEATHER_CACHE_KEY = 'weather-data-cache';
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  static async analyzeWeatherImpact(
    entries: DiaryEntry[],
    location: { lat: number; lon: number }
  ): Promise<WeatherImpactAnalysis> {
    const weatherData = await this.getHistoricalWeatherData(location, 90); // Last 90 days
    const behaviorEntries = entries
      .filter(entry => entry.type === 'behavior')
      .map(entry => ({
        date: new Date(entry.date),
        data: entry.data as BehaviorData
      }));

    const correlations = this.calculateWeatherCorrelations(behaviorEntries, weatherData);
    const seasonalPatterns = this.analyzeSeasonalPatterns(behaviorEntries);
    const recommendations = this.generateWeatherRecommendations(correlations);

    return {
      temperatureCorrelation: correlations.temperature,
      humidityEffects: correlations.humidity,
      pressureEffects: correlations.pressure,
      seasonalPatterns,
      recommendations
    };
  }

  static async generateWeatherForecast(
    entries: DiaryEntry[],
    location: { lat: number; lon: number }
  ): Promise<WeatherPrediction> {
    const forecast = await this.getWeatherForecast(location);
    const historicalImpact = await this.analyzeWeatherImpact(entries, location);
    
    const behaviorForecast = this.predictBehaviorFromWeather(
      forecast,
      historicalImpact
    );

    const recommendations = this.generateForecastRecommendations(
      forecast,
      behaviorForecast
    );

    return {
      upcomingConditions: forecast,
      behaviorForecast,
      recommendations
    };
  }

  private static async getHistoricalWeatherData(
    location: { lat: number; lon: number },
    days: number
  ): Promise<WeatherData[]> {
    // In a real implementation, this would call a weather API
    // For now, we'll generate mock data based on seasonal patterns
    return this.generateMockWeatherData(days);
  }

  private static async getWeatherForecast(
    location: { lat: number; lon: number }
  ): Promise<WeatherData[]> {
    // Mock 7-day forecast
    return this.generateMockWeatherData(7, true);
  }

  private static generateMockWeatherData(
    days: number,
    isForecast: boolean = false
  ): WeatherData[] {
    const data: WeatherData[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      if (isForecast) {
        date.setDate(date.getDate() + i);
      } else {
        date.setDate(date.getDate() - (days - i));
      }

      // Seasonal adjustments
      const month = date.getMonth();
      let baseTemp = 20;
      let baseHumidity = 60;
      
      if (month >= 11 || month <= 2) { // Winter
        baseTemp = 5;
        baseHumidity = 70;
      } else if (month >= 3 && month <= 5) { // Spring
        baseTemp = 15;
        baseHumidity = 65;
      } else if (month >= 6 && month <= 8) { // Summer
        baseTemp = 28;
        baseHumidity = 75;
      } else { // Fall
        baseTemp = 18;
        baseHumidity = 68;
      }

      // Add daily variation
      const tempVariation = (Math.random() - 0.5) * 10;
      const humidityVariation = (Math.random() - 0.5) * 20;

      const conditions: Array<'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy'> = 
        ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy'];
      
      data.push({
        date,
        temperature: baseTemp + tempVariation,
        humidity: Math.max(30, Math.min(90, baseHumidity + humidityVariation)),
        pressure: 1013 + (Math.random() - 0.5) * 30,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        windSpeed: Math.random() * 20,
        uvIndex: Math.max(0, Math.min(11, baseTemp / 5 + Math.random() * 3))
      });
    }

    return data;
  }

  private static calculateWeatherCorrelations(
    behaviorEntries: { date: Date; data: BehaviorData }[],
    weatherData: WeatherData[]
  ) {
    const matchedData = this.matchBehaviorWithWeather(behaviorEntries, weatherData);
    
    if (matchedData.length < 10) {
      return {
        temperature: { activityLevel: 0, appetite: 0, mood: 0, sleep: 0 },
        humidity: { preferredRange: { min: 40, max: 70 }, behaviorChanges: [] },
        pressure: { correlation: 0, symptoms: [] }
      };
    }

    // Calculate temperature correlations
    const temperatures = matchedData.map(d => d.weather.temperature);
    const activities = matchedData.map(d => this.mapActivityToNumber(d.behavior.activityLevel));
    const sleepHours = matchedData.map(d => d.behavior.sleepHours || 8);

    const tempActivityCorr = this.calculateCorrelation(temperatures, activities);
    const tempSleepCorr = this.calculateCorrelation(temperatures, sleepHours);

    // Analyze humidity effects
    const humidityPreferences = this.analyzeHumidityPreferences(matchedData);
    
    // Analyze pressure effects
    const pressures = matchedData.map(d => d.weather.pressure);
    const specialBehaviors = matchedData.map(d => d.behavior.specialBehaviors.length);
    const pressureCorr = this.calculateCorrelation(pressures, specialBehaviors);

    return {
      temperature: {
        activityLevel: tempActivityCorr,
        appetite: tempActivityCorr * 0.7, // Estimated correlation
        mood: tempActivityCorr * 0.8,
        sleep: tempSleepCorr
      },
      humidity: {
        preferredRange: humidityPreferences.range,
        behaviorChanges: humidityPreferences.changes
      },
      pressure: {
        correlation: pressureCorr,
        symptoms: pressureCorr < -0.3 ? ['圧力変化による不調の可能性'] : []
      }
    };
  }

  private static matchBehaviorWithWeather(
    behaviorEntries: { date: Date; data: BehaviorData }[],
    weatherData: WeatherData[]
  ) {
    const matched: Array<{ 
      date: Date; 
      behavior: BehaviorData; 
      weather: WeatherData 
    }> = [];

    behaviorEntries.forEach(behavioral => {
      const sameDay = weatherData.find(weather => 
        this.isSameDay(behavioral.date, weather.date)
      );
      
      if (sameDay) {
        matched.push({
          date: behavioral.date,
          behavior: behavioral.data,
          weather: sameDay
        });
      }
    });

    return matched;
  }

  private static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
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

  private static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static analyzeHumidityPreferences(
    matchedData: Array<{ date: Date; behavior: BehaviorData; weather: WeatherData }>
  ) {
    const activeWeather = matchedData.filter(d => 
      d.behavior.activityLevel === 'active' || d.behavior.activityLevel === 'very_active'
    );

    if (activeWeather.length === 0) {
      return {
        range: { min: 40, max: 70 },
        changes: []
      };
    }

    const humidities = activeWeather.map(d => d.weather.humidity);
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;
    const stdDev = Math.sqrt(
      humidities.reduce((sum, h) => sum + Math.pow(h - avgHumidity, 2), 0) / humidities.length
    );

    const changes: string[] = [];
    
    if (avgHumidity > 75) {
      changes.push('高湿度で活動量増加');
    } else if (avgHumidity < 45) {
      changes.push('低湿度で活動量増加');
    }

    return {
      range: {
        min: Math.max(30, avgHumidity - stdDev),
        max: Math.min(90, avgHumidity + stdDev)
      },
      changes
    };
  }

  private static analyzeSeasonalPatterns(
    behaviorEntries: { date: Date; data: BehaviorData }[]
  ) {
    const seasons = ['spring', 'summer', 'fall', 'winter'] as const;
    const patterns = seasons.map(season => {
      const seasonEntries = behaviorEntries.filter(entry => 
        this.getSeason(entry.date) === season
      );

      if (seasonEntries.length === 0) {
        return {
          season,
          avgActivity: 3,
          commonBehaviors: [],
          healthTrends: []
        };
      }

      const avgActivity = seasonEntries.reduce((sum, entry) => 
        sum + this.mapActivityToNumber(entry.data.activityLevel), 0
      ) / seasonEntries.length;

      const behaviorCounts = new Map<string, number>();
      seasonEntries.forEach(entry => {
        entry.data.specialBehaviors.forEach(behavior => {
          behaviorCounts.set(behavior, (behaviorCounts.get(behavior) || 0) + 1);
        });
      });

      const commonBehaviors = Array.from(behaviorCounts.entries())
        .filter(([_, count]) => count >= 2)
        .map(([behavior, _]) => behavior)
        .slice(0, 3);

      const healthTrends = this.generateSeasonalHealthTrends(season);

      return {
        season,
        avgActivity,
        commonBehaviors,
        healthTrends
      };
    });

    return patterns;
  }

  private static getSeason(date: Date): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private static generateSeasonalHealthTrends(
    season: 'spring' | 'summer' | 'fall' | 'winter'
  ): string[] {
    const trends: Record<string, string[]> = {
      spring: ['換毛期', 'アレルギー症状', '活動量増加'],
      summer: ['暑さによる食欲低下', '脱水注意', '熱中症リスク'],
      fall: ['毛玉対策', '体重管理', '活動量安定'],
      winter: ['関節痛注意', '体重増加傾向', '運動不足']
    };

    return trends[season] || [];
  }

  private static generateWeatherRecommendations(correlations: any): string[] {
    const recommendations: string[] = [];

    if (correlations.temperature.activityLevel > 0.5) {
      recommendations.push('暖かい日は活動量が増える傾向があります。十分な遊び時間を確保しましょう。');
    } else if (correlations.temperature.activityLevel < -0.5) {
      recommendations.push('寒い日は活動量が減る傾向があります。室内での遊びを増やしましょう。');
    }

    if (correlations.humidity.preferredRange.min > 60) {
      recommendations.push('湿度が高めの環境を好むようです。加湿器の使用を検討してください。');
    } else if (correlations.humidity.preferredRange.max < 50) {
      recommendations.push('湿度が低めの環境を好むようです。除湿を心がけてください。');
    }

    if (correlations.pressure.correlation < -0.3) {
      recommendations.push('気圧の変化に敏感な可能性があります。天気の変わり目には体調を注意深く観察してください。');
    }

    return recommendations;
  }

  private static predictBehaviorFromWeather(
    forecast: WeatherData[],
    historicalImpact: WeatherImpactAnalysis
  ) {
    const avgTemp = forecast.reduce((sum, day) => sum + day.temperature, 0) / forecast.length;
    const avgHumidity = forecast.reduce((sum, day) => sum + day.humidity, 0) / forecast.length;
    
    let activityLevel: 'low' | 'normal' | 'high' = 'normal';
    let moodPrediction: 'calm' | 'normal' | 'active' | 'restless' = 'normal';
    const healthRisks: string[] = [];

    // Temperature effects
    if (historicalImpact.temperatureCorrelation.activityLevel > 0.3) {
      if (avgTemp > 25) activityLevel = 'high';
      else if (avgTemp < 10) activityLevel = 'low';
    }

    // Weather condition effects
    const rainyDays = forecast.filter(day => day.condition === 'rainy').length;
    if (rainyDays >= 3) {
      moodPrediction = 'calm';
      healthRisks.push('長期間の雨による運動不足');
    }

    const stormyDays = forecast.filter(day => day.condition === 'stormy').length;
    if (stormyDays >= 1) {
      moodPrediction = 'restless';
      healthRisks.push('嵐によるストレス反応');
    }

    // Extreme weather warnings
    const hotDays = forecast.filter(day => day.temperature > 30).length;
    if (hotDays >= 2) {
      healthRisks.push('熱中症リスク');
    }

    const coldDays = forecast.filter(day => day.temperature < 5).length;
    if (coldDays >= 2) {
      healthRisks.push('低体温症リスク');
    }

    return {
      activityLevel,
      moodPrediction,
      healthRisks
    };
  }

  private static generateForecastRecommendations(
    forecast: WeatherData[],
    behaviorForecast: any
  ): string[] {
    const recommendations: string[] = [];

    if (behaviorForecast.activityLevel === 'low') {
      recommendations.push('室内での遊びや運動を増やしてください');
    } else if (behaviorForecast.activityLevel === 'high') {
      recommendations.push('十分な水分補給と休憩を心がけてください');
    }

    if (behaviorForecast.moodPrediction === 'restless') {
      recommendations.push('安心できる環境を整え、ストレス軽減に努めてください');
    }

    behaviorForecast.healthRisks.forEach((risk: string) => {
      if (risk.includes('熱中症')) {
        recommendations.push('エアコンで室温を調整し、冷たい場所を提供してください');
      } else if (risk.includes('低体温症')) {
        recommendations.push('暖房を適切に使用し、暖かい寝床を用意してください');
      } else if (risk.includes('運動不足')) {
        recommendations.push('室内で十分な運動機会を提供してください');
      }
    });

    return recommendations;
  }

  static getCachedWeatherData(): WeatherData[] | null {
    const cached = localStorage.getItem(this.WEATHER_CACHE_KEY);
    if (!cached) return null;

    try {
      const data = JSON.parse(cached);
      const cacheTime = new Date(data.timestamp);
      const now = new Date();

      if (now.getTime() - cacheTime.getTime() < this.CACHE_DURATION) {
        return data.weather.map((w: any) => ({
          ...w,
          date: new Date(w.date)
        }));
      }
    } catch (error) {
      console.error('Error parsing cached weather data:', error);
    }

    return null;
  }

  static cacheWeatherData(weather: WeatherData[]): void {
    const cacheData = {
      timestamp: new Date().toISOString(),
      weather: weather.map(w => ({
        ...w,
        date: w.date.toISOString()
      }))
    };

    localStorage.setItem(this.WEATHER_CACHE_KEY, JSON.stringify(cacheData));
  }
}