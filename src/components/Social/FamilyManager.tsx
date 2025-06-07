import React, { useState, useEffect } from 'react';
import { FamilyMember, SocialSettings } from '../../types/social';
import { SocialManager } from '../../utils/socialManager';
import './FamilyManager.css';

const FamilyManager: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [settings, setSettings] = useState<SocialSettings>(SocialManager.loadSocialSettings());
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'caretaker' as FamilyMember['role']
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = () => {
    const familyMembers = SocialManager.loadFamilyMembers();
    setMembers(familyMembers);
  };

  const handleInviteMember = async () => {
    if (!inviteForm.email.trim()) return;

    setIsLoading(true);
    try {
      const inviteId = await SocialManager.inviteFamilyMember(
        inviteForm.email,
        inviteForm.role,
        'current_user' // In real app, this would be the actual user ID
      );

      alert(`招待を送信しました。招待ID: ${inviteId}`);
      setInviteForm({ email: '', role: 'caretaker' });
      setShowInviteForm(false);
      loadFamilyMembers();
    } catch (error) {
      console.error('Failed to invite member:', error);
      alert('招待の送信に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('このメンバーを削除しますか？')) return;

    try {
      await SocialManager.removeFamilyMember(memberId);
      loadFamilyMembers();
      alert('メンバーを削除しました。');
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('メンバーの削除に失敗しました。');
    }
  };

  const handleUpdateSettings = (updates: Partial<SocialSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    SocialManager.saveSocialSettings(newSettings);
  };

  const getRoleLabel = (role: FamilyMember['role']): string => {
    const labels = {
      owner: '👑 オーナー',
      caretaker: '👥 ケアテイカー',
      observer: '👁️ 観察者'
    };
    return labels[role];
  };

  const getRoleDescription = (role: FamilyMember['role']): string => {
    const descriptions = {
      owner: '全ての操作が可能',
      caretaker: '記録の閲覧・編集が可能',
      observer: '記録の閲覧のみ可能'
    };
    return descriptions[role];
  };

  const formatDate = (date: Date): string => {
    if (date.getTime() === 0) return '招待中';
    return date.toLocaleDateString('ja-JP');
  };

  const getStatusBadge = (member: FamilyMember) => {
    if (member.joinedAt.getTime() === 0) {
      return <span className="status-badge pending">招待中</span>;
    }
    
    const daysSinceActive = Math.floor(
      (Date.now() - member.lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceActive === 0) {
      return <span className="status-badge active">アクティブ</span>;
    } else if (daysSinceActive <= 7) {
      return <span className="status-badge recent">{daysSinceActive}日前</span>;
    } else {
      return <span className="status-badge inactive">非アクティブ</span>;
    }
  };

  return (
    <div className="family-manager">
      <div className="manager-header">
        <h2>👥 家族メンバー管理</h2>
        <p>家族や友人と猫の記録を共有し、一緒にケアできます</p>
      </div>

      <div className="settings-section">
        <h3>共有設定</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.allowFamilyInvites}
                onChange={(e) => handleUpdateSettings({ allowFamilyInvites: e.target.checked })}
              />
              家族招待を許可
            </label>
            <p className="setting-description">他のユーザーを家族メンバーとして招待できます</p>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.autoShareHealthAlerts}
                onChange={(e) => handleUpdateSettings({ autoShareHealthAlerts: e.target.checked })}
              />
              健康アラートの自動共有
            </label>
            <p className="setting-description">重要な健康アラートを自動的に家族と共有します</p>
          </div>

          <div className="setting-item">
            <label className="setting-label">プロフィール表示設定</label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => handleUpdateSettings({ 
                profileVisibility: e.target.value as SocialSettings['profileVisibility'] 
              })}
              className="setting-select"
            >
              <option value="private">プライベート</option>
              <option value="family">家族のみ</option>
              <option value="public">公開</option>
            </select>
            <p className="setting-description">プロフィール情報の表示範囲を設定します</p>
          </div>
        </div>
      </div>

      <div className="members-section">
        <div className="section-header">
          <h3>家族メンバー一覧</h3>
          {settings.allowFamilyInvites && (
            <button
              className="invite-btn"
              onClick={() => setShowInviteForm(true)}
            >
              + メンバーを招待
            </button>
          )}
        </div>

        {showInviteForm && (
          <div className="invite-form">
            <h4>新しいメンバーを招待</h4>
            <div className="form-row">
              <div className="form-group">
                <label>メールアドレス</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="example@email.com"
                />
              </div>
              <div className="form-group">
                <label>役割</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ 
                    ...inviteForm, 
                    role: e.target.value as FamilyMember['role'] 
                  })}
                >
                  <option value="caretaker">ケアテイカー</option>
                  <option value="observer">観察者</option>
                </select>
              </div>
            </div>
            <div className="role-description">
              <p>{getRoleDescription(inviteForm.role)}</p>
            </div>
            <div className="form-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowInviteForm(false)}
              >
                キャンセル
              </button>
              <button
                className="send-invite-btn"
                onClick={handleInviteMember}
                disabled={!inviteForm.email.trim() || isLoading}
              >
                {isLoading ? '送信中...' : '招待を送信'}
              </button>
            </div>
          </div>
        )}

        <div className="members-list">
          {members.length === 0 ? (
            <div className="no-members">
              <span className="icon">👥</span>
              <h4>まだ家族メンバーがいません</h4>
              <p>家族や友人を招待して、一緒に猫のケアを管理しましょう</p>
            </div>
          ) : (
            members.map(member => (
              <div key={member.id} className="member-card">
                <div className="member-info">
                  <div className="member-avatar">
                    {member.profilePhoto ? (
                      <img src={member.profilePhoto} alt={member.name} />
                    ) : (
                      <span className="avatar-placeholder">👤</span>
                    )}
                  </div>
                  <div className="member-details">
                    <div className="member-header">
                      <h4 className="member-name">
                        {member.name || member.email}
                      </h4>
                      {getStatusBadge(member)}
                    </div>
                    <div className="member-role">
                      {getRoleLabel(member.role)}
                    </div>
                    <div className="member-meta">
                      <span>招待日: {formatDate(member.joinedAt)}</span>
                      {member.joinedAt.getTime() > 0 && (
                        <span>最終アクティブ: {formatDate(member.lastActive)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="member-permissions">
                  <h5>権限</h5>
                  <div className="permissions-list">
                    {member.permissions.canView && (
                      <span className="permission-badge view">👁️ 閲覧</span>
                    )}
                    {member.permissions.canEdit && (
                      <span className="permission-badge edit">✏️ 編集</span>
                    )}
                    {member.permissions.canDelete && (
                      <span className="permission-badge delete">🗑️ 削除</span>
                    )}
                    {member.permissions.canInvite && (
                      <span className="permission-badge invite">➕ 招待</span>
                    )}
                    {member.permissions.canManageCats && (
                      <span className="permission-badge manage">🐱 猫管理</span>
                    )}
                  </div>
                </div>

                <div className="member-actions">
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveMember(member.id)}
                    title="メンバーを削除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="notification-settings">
        <h3>通知設定</h3>
        <div className="notification-grid">
          <div className="notification-item">
            <label className="notification-label">
              <input
                type="checkbox"
                checked={settings.notifications.types.familyComments}
                onChange={(e) => handleUpdateSettings({
                  notifications: {
                    ...settings.notifications,
                    types: {
                      ...settings.notifications.types,
                      familyComments: e.target.checked
                    }
                  }
                })}
              />
              家族のコメント通知
            </label>
          </div>

          <div className="notification-item">
            <label className="notification-label">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => handleUpdateSettings({
                  notifications: {
                    ...settings.notifications,
                    email: e.target.checked
                  }
                })}
              />
              メール通知
            </label>
          </div>

          <div className="notification-item">
            <label className="notification-label">
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => handleUpdateSettings({
                  notifications: {
                    ...settings.notifications,
                    push: e.target.checked
                  }
                })}
              />
              プッシュ通知
            </label>
          </div>

          <div className="notification-item">
            <label className="notification-label">通知頻度</label>
            <select
              value={settings.notifications.frequency}
              onChange={(e) => handleUpdateSettings({
                notifications: {
                  ...settings.notifications,
                  frequency: e.target.value as any
                }
              })}
              className="notification-select"
            >
              <option value="immediate">即座</option>
              <option value="daily">日次</option>
              <option value="weekly">週次</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyManager;