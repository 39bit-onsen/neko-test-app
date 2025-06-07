import { Reminder, Alert, DiaryEntry, ReminderType, AlertType, AlertSeverity } from '../types';
import { HealthScoreCalculator } from './healthScore';
import { BehaviorAnalyzer } from './behaviorAnalyzer';

export class ReminderManager {
  private static STORAGE_KEYS = {
    REMINDERS: 'cat-diary-reminders',
    ALERTS: 'cat-diary-alerts'
  };

  static createReminder(
    type: ReminderType,
    title: string,
    time: string,
    frequency: 'once' | 'daily' | 'weekly' | 'monthly',
    description?: string
  ): Reminder {
    const now = new Date();
    const nextTrigger = this.calculateNextTrigger(time, frequency);
    
    return {
      id: `reminder_${Date.now()}_${Math.random()}`,
      type,
      title,
      description,
      time,
      frequency,
      enabled: true,
      nextTrigger,
      createdAt: now
    };
  }

  static saveReminders(reminders: Reminder[]): void {
    localStorage.setItem(this.STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }

  static loadReminders(): Reminder[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.REMINDERS);
    if (!stored) return [];
    
    return JSON.parse(stored).map((r: any) => ({
      ...r,
      nextTrigger: new Date(r.nextTrigger),
      createdAt: new Date(r.createdAt),
      lastTriggered: r.lastTriggered ? new Date(r.lastTriggered) : undefined
    }));
  }

  static saveAlerts(alerts: Alert[]): void {
    localStorage.setItem(this.STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }

  static loadAlerts(): Alert[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.ALERTS);
    if (!stored) return [];
    
    return JSON.parse(stored).map((a: any) => ({
      ...a,
      createdAt: new Date(a.createdAt),
      expiresAt: a.expiresAt ? new Date(a.expiresAt) : undefined
    }));
  }

  static checkDueReminders(reminders: Reminder[]): Reminder[] {
    const now = new Date();
    return reminders.filter(reminder => 
      reminder.enabled && 
      reminder.nextTrigger <= now
    );
  }

  static updateReminderAfterTrigger(reminder: Reminder): Reminder {
    const now = new Date();
    const nextTrigger = reminder.frequency === 'once' 
      ? new Date(0) 
      : this.calculateNextTrigger(reminder.time, reminder.frequency, now);
    
    return {
      ...reminder,
      lastTriggered: now,
      nextTrigger,
      enabled: reminder.frequency !== 'once'
    };
  }

  private static calculateNextTrigger(
    time: string, 
    frequency: 'once' | 'daily' | 'weekly' | 'monthly',
    fromDate: Date = new Date()
  ): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const trigger = new Date(fromDate);
    trigger.setHours(hours, minutes, 0, 0);

    if (trigger <= fromDate) {
      switch (frequency) {
        case 'daily':
          trigger.setDate(trigger.getDate() + 1);
          break;
        case 'weekly':
          trigger.setDate(trigger.getDate() + 7);
          break;
        case 'monthly':
          trigger.setMonth(trigger.getMonth() + 1);
          break;
        case 'once':
          break;
      }
    }

    return trigger;
  }

  static generateHealthAlerts(entries: DiaryEntry[]): Alert[] {
    const alerts: Alert[] = [];
    const recentEntries = entries.slice(-30);

    const healthScore = HealthScoreCalculator.calculateOverallScore(recentEntries);
    
    if (healthScore.overall < 4) {
      alerts.push(this.createAlert(
        'health',
        'critical',
        '健康状態が心配です',
        `総合ヘルススコアが${healthScore.overall}/10と低下しています。獣医師への相談を検討してください。`,
        { score: healthScore.overall }
      ));
    } else if (healthScore.overall < 6) {
      alerts.push(this.createAlert(
        'health',
        'warning',
        '健康状態に注意',
        `総合ヘルススコアが${healthScore.overall}/10です。継続的な観察をお勧めします。`,
        { score: healthScore.overall }
      ));
    }

    if (healthScore.trend === 'declining') {
      alerts.push(this.createAlert(
        'health',
        'warning',
        '健康状態が悪化傾向',
        '最近の健康状態が悪化しています。食事や活動レベルを確認してください。',
        { trend: healthScore.trend }
      ));
    }

    const behaviorInsights = BehaviorAnalyzer.generateBehaviorInsights(recentEntries);
    if (behaviorInsights.overallAssessment.behaviorHealth === 'poor' || behaviorInsights.overallAssessment.behaviorHealth === 'concerning') {
      alerts.push(this.createAlert(
        'behavior',
        'warning',
        '行動パターンに変化',
        `行動の健康状態が${behaviorInsights.overallAssessment.behaviorHealth}です。ストレスや体調不良の可能性があります。`,
        { behaviorHealth: behaviorInsights.overallAssessment.behaviorHealth }
      ));
    }

    return alerts;
  }

  static generateWeightAlerts(entries: DiaryEntry[]): Alert[] {
    const alerts: Alert[] = [];
    const healthEntries = entries
      .filter(entry => entry.type === 'health')
      .map(entry => ({ date: entry.date, data: entry.data as any }))
      .filter(entry => entry.data.weight !== undefined)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    if (healthEntries.length < 2) return alerts;

    const latestWeight = healthEntries[0].data.weight;
    const previousWeight = healthEntries[1].data.weight;
    const weightChange = latestWeight - previousWeight;
    const changePercent = (weightChange / previousWeight) * 100;

    if (Math.abs(changePercent) > 10) {
      const severity: AlertSeverity = Math.abs(changePercent) > 20 ? 'critical' : 'warning';
      const direction = weightChange > 0 ? '増加' : '減少';
      
      alerts.push(this.createAlert(
        'weight',
        severity,
        `体重が急激に${direction}`,
        `前回から${Math.abs(changePercent).toFixed(1)}%の体重変化があります。（${previousWeight}kg → ${latestWeight}kg）`,
        { weightChange, changePercent, currentWeight: latestWeight }
      ));
    }

    return alerts;
  }

  static generateAppetiteAlerts(entries: DiaryEntry[]): Alert[] {
    const alerts: Alert[] = [];
    const recentFoodEntries = entries
      .filter(entry => entry.type === 'food')
      .slice(-7)
      .map(entry => entry.data as any);

    const poorAppetiteCount = recentFoodEntries.filter(
      entry => entry.appetite === 'poor' || entry.appetite === 'none'
    ).length;

    if (poorAppetiteCount >= 3) {
      alerts.push(this.createAlert(
        'appetite',
        'warning',
        '食欲不振が続いています',
        `過去7回の食事のうち${poorAppetiteCount}回で食欲不振が記録されています。`,
        { poorAppetiteCount, totalEntries: recentFoodEntries.length }
      ));
    }

    const unfinishedMeals = recentFoodEntries.filter(entry => !entry.finished).length;
    if (unfinishedMeals >= 4) {
      alerts.push(this.createAlert(
        'appetite',
        'warning',
        '食事を残すことが多い',
        `過去7回の食事のうち${unfinishedMeals}回で食事を完食していません。`,
        { unfinishedMeals, totalEntries: recentFoodEntries.length }
      ));
    }

    return alerts;
  }

  static generateActivityAlerts(entries: DiaryEntry[]): Alert[] {
    const alerts: Alert[] = [];
    const recentBehaviorEntries = entries
      .filter(entry => entry.type === 'behavior')
      .slice(-5)
      .map(entry => entry.data as any);

    const lowActivityCount = recentBehaviorEntries.filter(
      entry => entry.activityLevel === 'calm' || entry.activityLevel === 'lethargic'
    ).length;

    if (lowActivityCount >= 3) {
      const severity: AlertSeverity = lowActivityCount >= 4 ? 'warning' : 'info';
      alerts.push(this.createAlert(
        'activity',
        severity,
        '活動レベルが低下',
        `最近5回の行動記録のうち${lowActivityCount}回で活動レベルが低い状態です。`,
        { lowActivityCount, totalEntries: recentBehaviorEntries.length }
      ));
    }

    return alerts;
  }

  private static createAlert(
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    message: string,
    data?: any
  ): Alert {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 7);

    return {
      id: `alert_${Date.now()}_${Math.random()}`,
      type,
      severity,
      title,
      message,
      data,
      isRead: false,
      createdAt: now,
      expiresAt
    };
  }

  static markAlertAsRead(alerts: Alert[], alertId: string): Alert[] {
    return alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    );
  }

  static removeExpiredAlerts(alerts: Alert[]): Alert[] {
    const now = new Date();
    return alerts.filter(alert => !alert.expiresAt || alert.expiresAt > now);
  }

  static getUnreadAlertsCount(alerts: Alert[]): number {
    return alerts.filter(alert => !alert.isRead).length;
  }

  static getDefaultReminders(): Reminder[] {
    return [
      this.createReminder(
        'food',
        '朝ごはんの時間',
        '08:00',
        'daily',
        'メインの朝食をあげる時間です'
      ),
      this.createReminder(
        'food',
        '夜ごはんの時間',
        '18:00',
        'daily',
        'メインの夕食をあげる時間です'
      ),
      this.createReminder(
        'weighing',
        '体重測定',
        '10:00',
        'weekly',
        '週1回の体重測定を忘れずに'
      )
    ];
  }
}