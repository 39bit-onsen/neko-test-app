import React, { useState, useEffect } from 'react';
import { DiaryEntry } from '../../types';
import { VetProfile, VetConsultation, Comment } from '../../types/social';
import { SocialManager } from '../../utils/socialManager';
import { useMultiCat } from '../../contexts/MultiCatContext';
import './VetSharingPanel.css';

interface VetSharingPanelProps {
  entry: DiaryEntry;
  onClose: () => void;
}

const VetSharingPanel: React.FC<VetSharingPanelProps> = ({ entry, onClose }) => {
  const { activeCat } = useMultiCat();
  const [vets, setVets] = useState<VetProfile[]>([]);
  const [selectedVet, setSelectedVet] = useState<string>('');
  const [consultationType, setConsultationType] = useState<VetConsultation['type']>('routine');
  const [priority, setPriority] = useState<VetConsultation['priority']>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'consult'>('share');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadVets();
    loadComments();
    SocialManager.initializeMockData();
  }, []);

  const loadVets = () => {
    const vetProfiles = SocialManager.loadVetProfiles();
    setVets(vetProfiles.filter(vet => vet.verified));
  };

  const loadComments = () => {
    const entryComments = SocialManager.getCommentsForEntry(entry.id);
    setComments(entryComments);
  };

  const handleShareWithVet = async () => {
    if (!selectedVet || !activeCat) return;

    setIsSharing(true);
    try {
      // Share the entry
      await SocialManager.shareEntry(
        entry.id,
        activeCat.id,
        'current_user', // In real app, this would be the actual user ID
        [selectedVet],
        'vet',
        shareMessage
      );

      // Add a comment if message is provided
      if (shareMessage.trim()) {
        await SocialManager.addComment(
          entry.id,
          'current_user',
          'user',
          `記録を共有しました: ${shareMessage}`,
          'text',
          undefined,
          false
        );
      }

      alert('獣医師に記録を共有しました。');
      onClose();
    } catch (error) {
      console.error('Failed to share with vet:', error);
      alert('共有に失敗しました。');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCreateConsultation = async () => {
    if (!selectedVet || !activeCat || !subject.trim()) return;

    setIsSharing(true);
    try {
      await SocialManager.createConsultation(
        activeCat.id,
        selectedVet,
        'current_user',
        consultationType,
        subject,
        description,
        [entry.id],
        priority
      );

      alert('獣医師への相談を作成しました。');
      onClose();
    } catch (error) {
      console.error('Failed to create consultation:', error);
      alert('相談の作成に失敗しました。');
    } finally {
      setIsSharing(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await SocialManager.addComment(
        entry.id,
        'current_user',
        'user',
        newComment,
        'text',
        undefined,
        false
      );

      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const getVetById = (vetId: string) => {
    return vets.find(vet => vet.id === vetId);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('ja-JP');
  };

  const getAuthorName = (comment: Comment) => {
    if (comment.authorType === 'user') return 'あなた';
    if (comment.authorType === 'vet') {
      const vet = getVetById(comment.authorId);
      return vet ? `Dr. ${vet.name}` : '獣医師';
    }
    return '家族';
  };

  const getPriorityLabel = (priority: VetConsultation['priority']) => {
    const labels = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '緊急'
    };
    return labels[priority];
  };

  const getConsultationTypeLabel = (type: VetConsultation['type']) => {
    const labels = {
      urgent: '緊急相談',
      routine: '定期相談',
      follow_up: 'フォローアップ'
    };
    return labels[type];
  };

  return (
    <div className="vet-sharing-panel">
      <div className="panel-header">
        <h3>🏥 獣医師との連携</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="panel-tabs">
        <button
          className={`tab-btn ${activeTab === 'share' ? 'active' : ''}`}
          onClick={() => setActiveTab('share')}
        >
          📤 記録共有
        </button>
        <button
          className={`tab-btn ${activeTab === 'consult' ? 'active' : ''}`}
          onClick={() => setActiveTab('consult')}
        >
          💬 相談作成
        </button>
      </div>

      <div className="panel-content">
        {activeTab === 'share' && (
          <div className="share-tab">
            <div className="entry-preview">
              <h4>共有する記録</h4>
              <div className="entry-summary">
                <div className="entry-header">
                  <span className="entry-type">{getEntryTypeLabel(entry.type)}</span>
                  <span className="entry-date">{formatDate(entry.date)}</span>
                </div>
                <div className="entry-details">
                  {renderEntryPreview(entry)}
                </div>
              </div>
            </div>

            <div className="vet-selection">
              <h4>共有先の獣医師</h4>
              {vets.length === 0 ? (
                <div className="no-vets">
                  <p>登録済みの獣医師がいません。</p>
                  <p>まず獣医師を登録してください。</p>
                </div>
              ) : (
                <select
                  value={selectedVet}
                  onChange={(e) => setSelectedVet(e.target.value)}
                  className="vet-select"
                >
                  <option value="">獣医師を選択してください</option>
                  {vets.map(vet => (
                    <option key={vet.id} value={vet.id}>
                      Dr. {vet.name} - {vet.clinicName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedVet && (
              <div className="vet-details">
                {(() => {
                  const vet = getVetById(selectedVet);
                  return vet ? (
                    <div className="vet-info">
                      <h5>Dr. {vet.name}</h5>
                      <p>{vet.clinicName}</p>
                      <p>専門: {vet.specialties.join('、')}</p>
                      {vet.phone && <p>電話: {vet.phone}</p>}
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <div className="share-message">
              <h4>メッセージ（任意）</h4>
              <textarea
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="獣医師へのメッセージや質問を入力してください"
                rows={3}
              />
            </div>

            <div className="share-actions">
              <button
                className="share-btn"
                onClick={handleShareWithVet}
                disabled={!selectedVet || isSharing}
              >
                {isSharing ? '共有中...' : '📤 記録を共有する'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'consult' && (
          <div className="consult-tab">
            <div className="consultation-form">
              <div className="form-group">
                <label>獣医師</label>
                <select
                  value={selectedVet}
                  onChange={(e) => setSelectedVet(e.target.value)}
                  className="vet-select"
                >
                  <option value="">獣医師を選択してください</option>
                  {vets.map(vet => (
                    <option key={vet.id} value={vet.id}>
                      Dr. {vet.name} - {vet.clinicName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>相談タイプ</label>
                  <select
                    value={consultationType}
                    onChange={(e) => setConsultationType(e.target.value as VetConsultation['type'])}
                  >
                    <option value="routine">定期相談</option>
                    <option value="urgent">緊急相談</option>
                    <option value="follow_up">フォローアップ</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>優先度</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as VetConsultation['priority'])}
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="urgent">緊急</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>件名</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="相談の件名を入力してください"
                />
              </div>

              <div className="form-group">
                <label>詳細</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="症状や気になる点を詳しく記載してください"
                  rows={4}
                />
              </div>

              <div className="consultation-actions">
                <button
                  className="consult-btn"
                  onClick={handleCreateConsultation}
                  disabled={!selectedVet || !subject.trim() || isSharing}
                >
                  {isSharing ? '作成中...' : '💬 相談を作成する'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="comments-section">
          <h4>💬 コメント</h4>
          
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">まだコメントはありません。</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className={`comment ${comment.authorType}`}>
                  <div className="comment-header">
                    <span className="comment-author">{getAuthorName(comment)}</span>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  </div>
                  <div className="comment-content">
                    {comment.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="add-comment">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="コメントを追加..."
              rows={2}
            />
            <button
              className="add-comment-btn"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              追加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const getEntryTypeLabel = (type: string): string => {
  const labels = {
    food: '🍽️ 食事',
    health: '🏥 健康',
    behavior: '🎾 行動',
    free: '📝 自由記録'
  };
  return labels[type as keyof typeof labels] || type;
};

const renderEntryPreview = (entry: DiaryEntry): React.ReactNode => {
  switch (entry.type) {
    case 'health':
      const healthData = entry.data as any;
      return (
        <div>
          {healthData.weight && <p>体重: {healthData.weight}kg</p>}
          {healthData.temperature && <p>体温: {healthData.temperature}°C</p>}
          {healthData.symptoms.length > 0 && (
            <p>症状: {healthData.symptoms.join(', ')}</p>
          )}
        </div>
      );
    case 'food':
      const foodData = entry.data as any;
      return (
        <div>
          <p>食事: {foodData.foodType}</p>
          <p>量: {foodData.amount}{foodData.amountUnit}</p>
          <p>食欲: {foodData.appetite}</p>
        </div>
      );
    case 'behavior':
      const behaviorData = entry.data as any;
      return (
        <div>
          <p>活動レベル: {behaviorData.activityLevel}</p>
          {behaviorData.sleepHours && <p>睡眠時間: {behaviorData.sleepHours}時間</p>}
          {behaviorData.specialBehaviors.length > 0 && (
            <p>特別な行動: {behaviorData.specialBehaviors.join(', ')}</p>
          )}
        </div>
      );
    default:
      const freeData = entry.data as any;
      return (
        <div>
          <p>{freeData.title}</p>
          <p>{freeData.content}</p>
        </div>
      );
  }
};

export default VetSharingPanel;