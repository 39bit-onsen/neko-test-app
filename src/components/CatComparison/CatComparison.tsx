import React, { useState, useEffect } from 'react';
import { DiaryEntry } from '../../types';
import { useMultiCat } from '../../contexts/MultiCatContext';
import { storageManager } from '../../utils/storage';
import { BasicStats } from '../../utils/analytics';
import { HealthScoreCalculator } from '../../utils/healthScore';
import { NutritionAnalyzer } from '../../utils/nutritionAnalyzer';
import { BehaviorAnalyzer } from '../../utils/behaviorAnalyzer';
import './CatComparison.css';

const CatComparison: React.FC = () => {
  const { cats, getActiveCats } = useMultiCat();
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<Record<string, {
    entries: DiaryEntry[];
    basicStats: any;
    healthScore: any;
    nutritionInsights: any;
    behaviorInsights: any;
  }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'1week' | '1month' | '3months' | 'all'>('1month');

  const activeCats = getActiveCats();

  useEffect(() => {
    if (selectedCats.length > 0) {
      loadComparisonData();
    }
  }, [selectedCats, timeRange]);

  const loadComparisonData = async () => {
    setIsLoading(true);
    try {
      const data: Record<string, any> = {};
      
      for (const catId of selectedCats) {
        const entries = await storageManager.getEntriesByCat(catId);
        const filteredEntries = filterEntriesByTimeRange(entries, timeRange);
        
        data[catId] = {
          entries: filteredEntries,
          basicStats: BasicStats.calculateBasicStats(filteredEntries),
          healthScore: HealthScoreCalculator.calculateOverallScore(filteredEntries),
          nutritionInsights: NutritionAnalyzer.generateNutritionInsights(filteredEntries),
          behaviorInsights: BehaviorAnalyzer.generateBehaviorInsights(filteredEntries)
        };
      }
      
      setComparisonData(data);
    } catch (error) {
      console.error('Failed to load comparison data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEntriesByTimeRange = (entries: DiaryEntry[], range: string): DiaryEntry[] => {
    if (range === 'all') return entries;
    
    const now = new Date();
    const daysMap = {
      '1week': 7,
      '1month': 30,
      '3months': 90
    };
    const days = daysMap[range as keyof typeof daysMap];
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return entries.filter(entry => new Date(entry.date) >= cutoff);
  };

  const handleCatSelection = (catId: string, selected: boolean) => {
    if (selected) {
      if (selectedCats.length < 5) {
        setSelectedCats(prev => [...prev, catId]);
      }
    } else {
      setSelectedCats(prev => prev.filter(id => id !== catId));
    }
  };

  const getCatById = (catId: string) => {
    return cats.find(cat => cat.id === catId);
  };

  const getComparisonInsights = () => {
    if (selectedCats.length < 2) return [];
    
    const insights: string[] = [];
    const healthScores = selectedCats.map(catId => ({
      catId,
      score: comparisonData[catId]?.healthScore?.overall || 0,
      name: getCatById(catId)?.name || ''
    }));
    
    // Health comparison
    const bestHealth = healthScores.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    const worstHealth = healthScores.reduce((worst, current) => 
      current.score < worst.score ? current : worst
    );
    
    if (bestHealth.catId !== worstHealth.catId) {
      insights.push(`${bestHealth.name}が最も健康状態が良好です（スコア: ${bestHealth.score}/10）`);
      if (worstHealth.score < 5) {
        insights.push(`${worstHealth.name}の健康状態に注意が必要です（スコア: ${worstHealth.score}/10）`);
      }
    }
    
    // Activity comparison
    const activityLevels = selectedCats.map(catId => {
      const behaviorData = comparisonData[catId]?.behaviorInsights;
      return {
        catId,
        level: behaviorData?.overallAssessment?.activityLevel || 'normal',
        name: getCatById(catId)?.name || ''
      };
    });
    
    const highActivityCats = activityLevels.filter(cat => cat.level === 'high');
    const lowActivityCats = activityLevels.filter(cat => cat.level === 'low');
    
    if (highActivityCats.length > 0) {
      insights.push(`${highActivityCats.map(cat => cat.name).join('、')}は活動レベルが高めです`);
    }
    if (lowActivityCats.length > 0) {
      insights.push(`${lowActivityCats.map(cat => cat.name).join('、')}は活動レベルが低めです`);
    }
    
    return insights;
  };

  const getTimeRangeLabel = (range: string) => {
    const labels = {
      '1week': '1週間',
      '1month': '1ヶ月',
      '3months': '3ヶ月',
      'all': 'すべて'
    };
    return labels[range as keyof typeof labels];
  };

  return (
    <div className="cat-comparison">
      <div className="comparison-header">
        <h2>🔍 猫比較分析</h2>
        <p>複数の猫のデータを比較して、健康状態や行動パターンの違いを分析できます</p>
      </div>

      <div className="comparison-controls">
        <div className="cat-selection">
          <h3>比較する猫を選択</h3>
          <p className="selection-hint">最大5匹まで選択できます（現在: {selectedCats.length}/5）</p>
          
          <div className="cats-grid">
            {activeCats.map(cat => (
              <label key={cat.id} className={`cat-checkbox ${selectedCats.includes(cat.id) ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat.id)}
                  onChange={(e) => handleCatSelection(cat.id, e.target.checked)}
                  disabled={!selectedCats.includes(cat.id) && selectedCats.length >= 5}
                />
                <div className="cat-option">
                  <div className="cat-avatar">
                    {cat.profilePhoto ? (
                      <img src={cat.profilePhoto} alt={cat.name} />
                    ) : (
                      <span className="cat-icon">🐱</span>
                    )}
                  </div>
                  <div className="cat-info">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-details">
                      {cat.breed && `${cat.breed} • `}
                      {cat.gender === 'male' ? 'オス' : 'メス'}
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {selectedCats.length > 0 && (
          <div className="time-range-selection">
            <label>比較期間:</label>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}>
              <option value="1week">過去1週間</option>
              <option value="1month">過去1ヶ月</option>
              <option value="3months">過去3ヶ月</option>
              <option value="all">全期間</option>
            </select>
          </div>
        )}
      </div>

      {selectedCats.length === 0 && (
        <div className="no-selection">
          <div className="no-selection-content">
            <span className="icon">📊</span>
            <h3>猫を選択してください</h3>
            <p>2匹以上の猫を選択すると、詳細な比較分析が表示されます</p>
          </div>
        </div>
      )}

      {selectedCats.length === 1 && (
        <div className="single-selection">
          <div className="single-selection-content">
            <span className="icon">👆</span>
            <h3>もう1匹選択してください</h3>
            <p>比較分析には最低2匹の猫が必要です</p>
          </div>
        </div>
      )}

      {selectedCats.length >= 2 && (
        <div className="comparison-results">
          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>比較データを読み込み中...</p>
            </div>
          ) : (
            <>
              <div className="comparison-summary">
                <h3>比較サマリー ({getTimeRangeLabel(timeRange)})</h3>
                <div className="insights">
                  {getComparisonInsights().map((insight, index) => (
                    <div key={index} className="insight-item">
                      <span className="insight-icon">💡</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="comparison-tables">
                <div className="comparison-table">
                  <h4>基本統計</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>猫</th>
                        <th>記録数</th>
                        <th>週平均</th>
                        <th>食事記録</th>
                        <th>健康記録</th>
                        <th>行動記録</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCats.map(catId => {
                        const cat = getCatById(catId);
                        const stats = comparisonData[catId]?.basicStats;
                        return (
                          <tr key={catId}>
                            <td className="cat-cell">
                              <div className="cat-info">
                                <div className="cat-avatar">
                                  {cat?.profilePhoto ? (
                                    <img src={cat.profilePhoto} alt={cat.name} />
                                  ) : (
                                    <span className="cat-icon">🐱</span>
                                  )}
                                </div>
                                <span>{cat?.name}</span>
                              </div>
                            </td>
                            <td>{stats?.totalEntries || 0}</td>
                            <td>{stats?.weeklyAverage || 0}</td>
                            <td>{stats?.typeDistribution?.food || 0}</td>
                            <td>{stats?.typeDistribution?.health || 0}</td>
                            <td>{stats?.typeDistribution?.behavior || 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="comparison-table">
                  <h4>健康スコア</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>猫</th>
                        <th>総合スコア</th>
                        <th>体重</th>
                        <th>活動レベル</th>
                        <th>食欲</th>
                        <th>症状</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCats.map(catId => {
                        const cat = getCatById(catId);
                        const health = comparisonData[catId]?.healthScore;
                        return (
                          <tr key={catId}>
                            <td className="cat-cell">
                              <div className="cat-info">
                                <div className="cat-avatar">
                                  {cat?.profilePhoto ? (
                                    <img src={cat.profilePhoto} alt={cat.name} />
                                  ) : (
                                    <span className="cat-icon">🐱</span>
                                  )}
                                </div>
                                <span>{cat?.name}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`score ${getScoreClass(health?.overall || 0)}`}>
                                {health?.overall || 0}/10
                              </span>
                            </td>
                            <td>{health?.categories?.weight || 'N/A'}</td>
                            <td>{health?.categories?.activity || 'N/A'}</td>
                            <td>{health?.categories?.appetite || 'N/A'}</td>
                            <td>{health?.categories?.symptoms || 'N/A'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="comparison-table">
                  <h4>行動評価</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>猫</th>
                        <th>行動健康度</th>
                        <th>活動レベル</th>
                        <th>ストレスレベル</th>
                        <th>アラート数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCats.map(catId => {
                        const cat = getCatById(catId);
                        const behavior = comparisonData[catId]?.behaviorInsights;
                        return (
                          <tr key={catId}>
                            <td className="cat-cell">
                              <div className="cat-info">
                                <div className="cat-avatar">
                                  {cat?.profilePhoto ? (
                                    <img src={cat.profilePhoto} alt={cat.name} />
                                  ) : (
                                    <span className="cat-icon">🐱</span>
                                  )}
                                </div>
                                <span>{cat?.name}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`status ${getStatusClass(behavior?.overallAssessment?.behaviorHealth)}`}>
                                {translateBehaviorHealth(behavior?.overallAssessment?.behaviorHealth)}
                              </span>
                            </td>
                            <td>{translateActivityLevel(behavior?.overallAssessment?.activityLevel)}</td>
                            <td>{translateStressLevel(behavior?.overallAssessment?.stressLevel)}</td>
                            <td>{behavior?.alerts?.length || 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const getScoreClass = (score: number): string => {
  if (score >= 7) return 'good';
  if (score >= 5) return 'warning';
  return 'critical';
};

const getStatusClass = (status?: string): string => {
  switch (status) {
    case 'excellent': return 'excellent';
    case 'good': return 'good';
    case 'concerning': return 'warning';
    case 'poor': return 'critical';
    default: return 'unknown';
  }
};

const translateBehaviorHealth = (health?: string): string => {
  switch (health) {
    case 'excellent': return '非常に良い';
    case 'good': return '良い';
    case 'concerning': return '注意';
    case 'poor': return '要改善';
    default: return 'データなし';
  }
};

const translateActivityLevel = (level?: string): string => {
  switch (level) {
    case 'high': return '高い';
    case 'normal': return '普通';
    case 'low': return '低い';
    default: return 'データなし';
  }
};

const translateStressLevel = (level?: string): string => {
  switch (level) {
    case 'low': return '低い';
    case 'medium': return '普通';
    case 'high': return '高い';
    default: return 'データなし';
  }
};

export default CatComparison;