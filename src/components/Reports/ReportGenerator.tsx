import React, { useState } from 'react';
import { DiaryEntry, CatProfile } from '../../types';
import { ReportGenerator as ReportUtil, ReportType, ExportFormat } from '../../utils/reportGenerator';
import './ReportGenerator.css';

interface ReportGeneratorProps {
  entries: DiaryEntry[];
  profile?: CatProfile;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ entries, profile }) => {
  const [reportType, setReportType] = useState<ReportType>('comprehensive');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const presetRanges = ReportUtil.getPresetDateRanges();

  const handlePresetRange = (preset: { start: Date; end: Date }) => {
    setDateRange({
      start: preset.start.toISOString().split('T')[0],
      end: preset.end.toISOString().split('T')[0]
    });
  };

  const generateReportData = () => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end + 'T23:59:59');
    return ReportUtil.generateReportData(entries, reportType, { start, end }, profile);
  };

  const handlePreview = () => {
    setIsGenerating(true);
    try {
      const data = generateReportData();
      setPreviewData(data);
      setShowPreview(true);
    } catch (error) {
      console.error('レポート生成エラー:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (format: ExportFormat) => {
    setIsGenerating(true);
    try {
      const data = generateReportData();
      
      switch (format) {
        case 'pdf':
          ReportUtil.exportToPDF(data);
          break;
        case 'csv':
          ReportUtil.exportToCSV(data);
          break;
        case 'json':
          ReportUtil.exportToJSON(data);
          break;
      }
    } catch (error) {
      console.error('エクスポートエラー:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportTypeLabel = (type: ReportType): string => {
    switch (type) {
      case 'comprehensive': return '📋 総合レポート';
      case 'health': return '🏥 健康レポート';
      case 'nutrition': return '🍽️ 栄養レポート';
      case 'behavior': return '🎾 行動レポート';
      case 'summary': return '📊 サマリーレポート';
    }
  };

  const getReportTypeDescription = (type: ReportType): string => {
    switch (type) {
      case 'comprehensive': return '健康、栄養、行動のすべての分析を含む詳細なレポート';
      case 'health': return '健康状態の詳細分析レポート';
      case 'nutrition': return '食事パターンと栄養状態の分析レポート';
      case 'behavior': return '行動パターンと活動状況の分析レポート';
      case 'summary': return '基本統計のみのシンプルなレポート';
    }
  };

  const getFilteredEntriesCount = (): number => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end + 'T23:59:59');
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    }).length;
  };

  return (
    <div className="report-generator">
      <div className="generator-header">
        <h2>📊 レポート生成</h2>
        <p>期間と種類を選択してレポートを生成・エクスポートできます</p>
      </div>

      <div className="generator-form">
        <div className="form-section">
          <h3>レポート種類</h3>
          <div className="report-type-grid">
            {(['comprehensive', 'health', 'nutrition', 'behavior', 'summary'] as ReportType[]).map(type => (
              <div
                key={type}
                className={`report-type-card ${reportType === type ? 'selected' : ''}`}
                onClick={() => setReportType(type)}
              >
                <div className="type-header">
                  <span className="type-label">{getReportTypeLabel(type)}</span>
                </div>
                <div className="type-description">
                  {getReportTypeDescription(type)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>期間設定</h3>
          <div className="date-range-section">
            <div className="preset-buttons">
              <span className="preset-label">クイック選択:</span>
              {presetRanges.slice(0, 3).map((preset, index) => (
                <button
                  key={index}
                  className="preset-btn"
                  onClick={() => handlePresetRange(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            
            <div className="date-inputs">
              <div className="input-group">
                <label>開始日:</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>終了日:</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>

            <div className="range-info">
              <span className="info-label">対象記録数:</span>
              <span className="info-value">{getFilteredEntriesCount()}件</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>アクション</h3>
          <div className="action-buttons">
            <button
              className="preview-btn"
              onClick={handlePreview}
              disabled={isGenerating || getFilteredEntriesCount() === 0}
            >
              {isGenerating ? '生成中...' : '👁️ プレビュー'}
            </button>
            
            <div className="export-buttons">
              <button
                className="export-btn pdf-btn"
                onClick={() => handleExport('pdf')}
                disabled={isGenerating || getFilteredEntriesCount() === 0}
                title="PDF形式でエクスポート（印刷用）"
              >
                📄 PDF
              </button>
              <button
                className="export-btn csv-btn"
                onClick={() => handleExport('csv')}
                disabled={isGenerating || getFilteredEntriesCount() === 0}
                title="CSV形式でエクスポート（表計算ソフト用）"
              >
                📊 CSV
              </button>
              <button
                className="export-btn json-btn"
                onClick={() => handleExport('json')}
                disabled={isGenerating || getFilteredEntriesCount() === 0}
                title="JSON形式でエクスポート（データバックアップ用）"
              >
                💾 JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPreview && previewData && (
        <div className="preview-section">
          <div className="preview-header">
            <h3>📋 レポートプレビュー</h3>
            <button
              className="close-preview-btn"
              onClick={() => setShowPreview(false)}
            >
              ✕ 閉じる
            </button>
          </div>

          <div className="preview-content">
            <div className="preview-meta">
              <div className="meta-item">
                <span className="meta-label">種類:</span>
                <span className="meta-value">{getReportTypeLabel(reportType)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">期間:</span>
                <span className="meta-value">{previewData.period.label}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">記録数:</span>
                <span className="meta-value">{previewData.entries.length}件</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">生成日時:</span>
                <span className="meta-value">{previewData.generatedAt.toLocaleString('ja-JP')}</span>
              </div>
            </div>

            <div className="preview-stats">
              <h4>基本統計</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">総記録数:</span>
                  <span className="stat-value">{previewData.basicStats.totalEntries}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">週平均:</span>
                  <span className="stat-value">{previewData.basicStats.weeklyAverage}件/週</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">食事記録:</span>
                  <span className="stat-value">{previewData.basicStats.typeDistribution.food || 0}件</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">健康記録:</span>
                  <span className="stat-value">{previewData.basicStats.typeDistribution.health || 0}件</span>
                </div>
              </div>
            </div>

            {previewData.healthScore && (
              <div className="preview-health">
                <h4>健康スコア</h4>
                <div className="health-score-display">
                  <div className="score-circle">
                    <span className="score-number">{previewData.healthScore.overall}</span>
                    <span className="score-max">/10</span>
                  </div>
                  <div className="score-status">
                    {previewData.healthScore.overall >= 7 ? '良好' :
                     previewData.healthScore.overall >= 5 ? '注意' : '要改善'}
                  </div>
                </div>
              </div>
            )}

            {previewData.nutritionAnalysis && (
              <div className="preview-nutrition">
                <h4>栄養分析</h4>
                {previewData.nutritionAnalysis.recommendations.length > 0 && (
                  <div className="recommendations">
                    <h5>推奨事項:</h5>
                    <ul>
                      {previewData.nutritionAnalysis.recommendations.slice(0, 3).map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {previewData.behaviorAnalysis && (
              <div className="preview-behavior">
                <h4>行動分析</h4>
                <div className="behavior-score">
                  <span className="score-label">行動評価:</span>
                  <span className="score-value">{previewData.behaviorAnalysis.overallAssessment.behaviorHealth}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {getFilteredEntriesCount() === 0 && (
        <div className="no-data-warning">
          <p>⚠️ 選択した期間にデータがありません</p>
          <p>期間を調整するか、記録を追加してからレポートを生成してください。</p>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;