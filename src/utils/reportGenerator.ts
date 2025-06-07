import { DiaryEntry, CatProfile } from '../types';
import { BasicStats } from './analytics';
import { HealthScoreCalculator } from './healthScore';
import { NutritionAnalyzer } from './nutritionAnalyzer';
import { BehaviorAnalyzer } from './behaviorAnalyzer';

export interface ReportData {
  profile?: CatProfile;
  entries: DiaryEntry[];
  period: {
    start: Date;
    end: Date;
    label: string;
  };
  basicStats: any;
  healthScore: any;
  nutritionAnalysis: any;
  behaviorAnalysis: any;
  generatedAt: Date;
}

export type ReportType = 'comprehensive' | 'health' | 'nutrition' | 'behavior' | 'summary';
export type ExportFormat = 'pdf' | 'csv' | 'json';

export class ReportGenerator {
  static generateReportData(
    entries: DiaryEntry[],
    type: ReportType,
    dateRange: { start: Date; end: Date },
    profile?: CatProfile
  ): ReportData {
    const filteredEntries = this.filterEntriesByDateRange(entries, dateRange);
    
    const reportData: ReportData = {
      profile,
      entries: filteredEntries,
      period: {
        start: dateRange.start,
        end: dateRange.end,
        label: this.formatPeriodLabel(dateRange)
      },
      basicStats: BasicStats.calculateBasicStats(filteredEntries),
      healthScore: null,
      nutritionAnalysis: null,
      behaviorAnalysis: null,
      generatedAt: new Date()
    };

    switch (type) {
      case 'comprehensive':
        reportData.healthScore = HealthScoreCalculator.calculateOverallScore(filteredEntries);
        reportData.nutritionAnalysis = NutritionAnalyzer.generateNutritionInsights(filteredEntries);
        reportData.behaviorAnalysis = BehaviorAnalyzer.generateBehaviorInsights(filteredEntries);
        break;
      case 'health':
        reportData.healthScore = HealthScoreCalculator.calculateOverallScore(filteredEntries);
        break;
      case 'nutrition':
        reportData.nutritionAnalysis = NutritionAnalyzer.generateNutritionInsights(filteredEntries);
        break;
      case 'behavior':
        reportData.behaviorAnalysis = BehaviorAnalyzer.generateBehaviorInsights(filteredEntries);
        break;
      case 'summary':
        break;
    }

    return reportData;
  }

  static exportToPDF(reportData: ReportData): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = this.generateHTMLReport(reportData);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }

  static exportToCSV(reportData: ReportData): void {
    const csvContent = this.generateCSVReport(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `cat-diary-report-${this.formatDateForFilename(reportData.generatedAt)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportToJSON(reportData: ReportData): void {
    const jsonContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `cat-diary-report-${this.formatDateForFilename(reportData.generatedAt)}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private static filterEntriesByDateRange(entries: DiaryEntry[], dateRange: { start: Date; end: Date }): DiaryEntry[] {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= dateRange.start && entryDate <= dateRange.end;
    });
  }

  private static formatPeriodLabel(dateRange: { start: Date; end: Date }): string {
    const start = dateRange.start.toLocaleDateString('ja-JP');
    const end = dateRange.end.toLocaleDateString('ja-JP');
    return `${start} 〜 ${end}`;
  }

  private static formatDateForFilename(date: Date): string {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }

  private static generateHTMLReport(reportData: ReportData): string {
    const { profile, entries, period, basicStats, healthScore, nutritionAnalysis, behaviorAnalysis } = reportData;
    
    const styles = `
      <style>
        @media print {
          @page {
            margin: 20mm;
            size: A4;
          }
        }
        body {
          font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background: white;
        }
        h1 { color: #2196F3; border-bottom: 2px solid #2196F3; padding-bottom: 10px; }
        h2 { color: #1976D2; border-left: 4px solid #2196F3; padding-left: 10px; }
        h3 { color: #666; }
        .header { text-align: center; margin-bottom: 30px; }
        .profile { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .period { background: #e3f2fd; padding: 10px; border-radius: 4px; margin-bottom: 20px; text-align: center; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: #fafafa; padding: 15px; border-radius: 8px; text-align: center; }
        .score { font-size: 2em; font-weight: bold; color: #4CAF50; }
        .alert { background: #fff3e0; border-left: 4px solid #ff9800; padding: 10px; margin: 10px 0; }
        .recommendation { background: #e8f5e8; border-left: 4px solid #4caf50; padding: 10px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #2196F3; color: white; }
        .no-break { page-break-inside: avoid; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
      </style>
    `;

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>猫日記レポート</title>
        ${styles}
      </head>
      <body>
        <div class="header">
          <h1>🐱 猫日記レポート</h1>
          <div class="period">期間: ${period.label}</div>
        </div>
    `;

    if (profile) {
      html += `
        <div class="profile no-break">
          <h2>プロフィール</h2>
          <p><strong>名前:</strong> ${profile.name}</p>
          ${profile.breed ? `<p><strong>品種:</strong> ${profile.breed}</p>` : ''}
          ${profile.birthDate ? `<p><strong>生年月日:</strong> ${new Date(profile.birthDate).toLocaleDateString('ja-JP')}</p>` : ''}
          ${profile.gender ? `<p><strong>性別:</strong> ${profile.gender === 'male' ? 'オス' : 'メス'}</p>` : ''}
          ${profile.weight ? `<p><strong>体重:</strong> ${profile.weight}kg</p>` : ''}
        </div>
      `;
    }

    html += `
      <div class="no-break">
        <h2>基本統計</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <h3>総記録数</h3>
            <div class="score">${basicStats.totalEntries}</div>
          </div>
          <div class="stat-card">
            <h3>週平均記録数</h3>
            <div class="score">${basicStats.weeklyAverage}</div>
          </div>
          <div class="stat-card">
            <h3>食事記録</h3>
            <div class="score">${basicStats.typeDistribution.food || 0}</div>
          </div>
          <div class="stat-card">
            <h3>健康記録</h3>
            <div class="score">${basicStats.typeDistribution.health || 0}</div>
          </div>
        </div>
      </div>
    `;

    if (healthScore) {
      html += `
        <div class="no-break">
          <h2>健康スコア</h2>
          <div class="stat-card">
            <h3>総合スコア</h3>
            <div class="score" style="color: ${healthScore.overall >= 7 ? '#4CAF50' : healthScore.overall >= 5 ? '#FF9800' : '#F44336'}">${healthScore.overall}/10</div>
          </div>
          
          <h3>カテゴリ別スコア</h3>
          <table>
            <tr><th>カテゴリ</th><th>スコア</th></tr>
            <tr><td>体重</td><td>${healthScore.categories?.weight || 'N/A'}</td></tr>
            <tr><td>活動レベル</td><td>${healthScore.categories?.activity || 'N/A'}</td></tr>
            <tr><td>食欲</td><td>${healthScore.categories?.appetite || 'N/A'}</td></tr>
            <tr><td>症状</td><td>${healthScore.categories?.symptoms || 'N/A'}</td></tr>
          </table>
        </div>
      `;
    }

    if (nutritionAnalysis) {
      html += `
        <div class="no-break">
          <h2>栄養分析</h2>
          <p><strong>推奨事項:</strong></p>
          <ul>
            ${nutritionAnalysis.recommendations.map((rec: string) => `<li class="recommendation">${rec}</li>`).join('')}
          </ul>
          ${nutritionAnalysis.alerts.length > 0 ? `
            <p><strong>注意事項:</strong></p>
            <ul>
              ${nutritionAnalysis.alerts.map((alert: string) => `<li class="alert">${alert}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `;
    }

    if (behaviorAnalysis) {
      html += `
        <div class="no-break">
          <h2>行動分析</h2>
          <div class="stat-card">
            <h3>行動スコア</h3>
            <div class="score">${behaviorAnalysis.overallAssessment.behaviorHealth}</div>
          </div>
          
          <p><strong>推奨事項:</strong></p>
          <ul>
            ${behaviorAnalysis.recommendations.map((rec: string) => `<li class="recommendation">${rec}</li>`).join('')}
          </ul>
          ${behaviorAnalysis.alerts.length > 0 ? `
            <p><strong>注意事項:</strong></p>
            <ul>
              ${behaviorAnalysis.alerts.map((alert: string) => `<li class="alert">${alert}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `;
    }

    html += `
        <div class="footer">
          <p>生成日時: ${reportData.generatedAt.toLocaleString('ja-JP')}</p>
          <p>猫日記アプリで生成されました</p>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  private static generateCSVReport(reportData: ReportData): string {
    const { entries, period, basicStats, healthScore, nutritionAnalysis, behaviorAnalysis } = reportData;
    
    let csv = '\ufeff'; // BOM for UTF-8
    csv += 'レポート基本情報\n';
    csv += `生成日時,${reportData.generatedAt.toLocaleString('ja-JP')}\n`;
    csv += `期間,${period.label}\n`;
    csv += `総記録数,${basicStats.totalEntries}\n`;
    csv += `週平均記録数,${basicStats.weeklyAverage}\n\n`;

    if (reportData.profile) {
      csv += 'プロフィール情報\n';
      csv += `名前,${reportData.profile.name}\n`;
      if (reportData.profile.breed) csv += `品種,${reportData.profile.breed}\n`;
      if (reportData.profile.birthDate) csv += `生年月日,${new Date(reportData.profile.birthDate).toLocaleDateString('ja-JP')}\n`;
      if (reportData.profile.gender) csv += `性別,${reportData.profile.gender === 'male' ? 'オス' : 'メス'}\n`;
      if (reportData.profile.weight) csv += `体重,${reportData.profile.weight}kg\n`;
      csv += '\n';
    }

    csv += '記録タイプ別統計\n';
    csv += 'タイプ,件数\n';
    csv += `食事,${basicStats.typeDistribution.food || 0}\n`;
    csv += `健康,${basicStats.typeDistribution.health || 0}\n`;
    csv += `行動,${basicStats.typeDistribution.behavior || 0}\n`;
    csv += `自由記録,${basicStats.typeDistribution.free || 0}\n\n`;

    if (healthScore) {
      csv += '健康スコア\n';
      csv += `総合スコア,${healthScore.overall}/10\n`;
      if (healthScore.categories) {
        csv += 'カテゴリ,スコア\n';
        csv += `体重,${healthScore.categories.weight || 'N/A'}\n`;
        csv += `活動レベル,${healthScore.categories.activity || 'N/A'}\n`;
        csv += `食欲,${healthScore.categories.appetite || 'N/A'}\n`;
        csv += `症状,${healthScore.categories.symptoms || 'N/A'}\n`;
      }
      csv += '\n';
    }

    csv += '詳細記録\n';
    csv += '日付,時間,タイプ,詳細,気分\n';
    
    entries.forEach(entry => {
      const date = new Date(entry.date).toLocaleDateString('ja-JP');
      const time = new Date(entry.date).toLocaleTimeString('ja-JP');
      const type = this.getEntryTypeLabel(entry.type);
      const details = this.getEntryDetails(entry);
      csv += `${date},${time},${type},"${details}",${entry.mood}\n`;
    });

    return csv;
  }

  private static getEntryTypeLabel(type: string): string {
    switch (type) {
      case 'food': return '食事';
      case 'health': return '健康';
      case 'behavior': return '行動';
      case 'free': return '自由記録';
      default: return type;
    }
  }

  private static getEntryDetails(entry: DiaryEntry): string {
    switch (entry.type) {
      case 'food':
        const foodData = entry.data as any;
        return `${foodData.foodType} - ${foodData.amount}${foodData.amountUnit} (食欲: ${foodData.appetite})`;
      case 'health':
        const healthData = entry.data as any;
        let details = [];
        if (healthData.weight) details.push(`体重: ${healthData.weight}kg`);
        if (healthData.temperature) details.push(`体温: ${healthData.temperature}°C`);
        if (healthData.symptoms?.length) details.push(`症状: ${healthData.symptoms.join(', ')}`);
        return details.join(' | ') || '健康記録';
      case 'behavior':
        const behaviorData = entry.data as any;
        let behaviorDetails = [`活動レベル: ${behaviorData.activityLevel}`];
        if (behaviorData.sleepHours) behaviorDetails.push(`睡眠: ${behaviorData.sleepHours}時間`);
        if (behaviorData.playTime) behaviorDetails.push(`遊び: ${behaviorData.playTime}時間`);
        return behaviorDetails.join(' | ');
      case 'free':
        const freeData = entry.data as any;
        return `${freeData.title}: ${freeData.content}`;
      default:
        return JSON.stringify(entry.data);
    }
  }

  static getPresetDateRanges(): Array<{ label: string; start: Date; end: Date }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return [
      {
        label: '過去1週間',
        start: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      },
      {
        label: '過去1ヶ月',
        start: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      },
      {
        label: '過去3ヶ月',
        start: new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      },
      {
        label: '今月',
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      },
      {
        label: '先月',
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      }
    ];
  }
}