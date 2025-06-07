import React, { useState, useEffect } from 'react';
import { Reminder, Alert, ReminderType } from '../../types';
import { ReminderManager as ReminderUtil } from '../../utils/reminderManager';
import './ReminderManager.css';

interface ReminderManagerProps {
  reminders: Reminder[];
  alerts: Alert[];
  onUpdateReminders: (reminders: Reminder[]) => void;
  onUpdateAlerts: (alerts: Alert[]) => void;
}

const ReminderManager: React.FC<ReminderManagerProps> = ({
  reminders,
  alerts,
  onUpdateReminders,
  onUpdateAlerts
}) => {
  const [activeTab, setActiveTab] = useState<'reminders' | 'alerts'>('reminders');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type: 'food' as ReminderType,
    title: '',
    description: '',
    time: '08:00',
    frequency: 'daily' as 'once' | 'daily' | 'weekly' | 'monthly'
  });

  const unreadAlertsCount = ReminderUtil.getUnreadAlertsCount(alerts);

  const handleAddReminder = () => {
    if (!newReminder.title.trim()) return;

    const reminder = ReminderUtil.createReminder(
      newReminder.type,
      newReminder.title,
      newReminder.time,
      newReminder.frequency,
      newReminder.description
    );

    const updatedReminders = [...reminders, reminder];
    onUpdateReminders(updatedReminders);
    ReminderUtil.saveReminders(updatedReminders);

    setNewReminder({
      type: 'food',
      title: '',
      description: '',
      time: '08:00',
      frequency: 'daily'
    });
    setShowAddForm(false);
  };

  const handleToggleReminder = (reminderId: string) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === reminderId
        ? { ...reminder, enabled: !reminder.enabled }
        : reminder
    );
    onUpdateReminders(updatedReminders);
    ReminderUtil.saveReminders(updatedReminders);
  };

  const handleDeleteReminder = (reminderId: string) => {
    const updatedReminders = reminders.filter(r => r.id !== reminderId);
    onUpdateReminders(updatedReminders);
    ReminderUtil.saveReminders(updatedReminders);
  };

  const handleMarkAlertAsRead = (alertId: string) => {
    const updatedAlerts = ReminderUtil.markAlertAsRead(alerts, alertId);
    onUpdateAlerts(updatedAlerts);
    ReminderUtil.saveAlerts(updatedAlerts);
  };

  const formatNextTrigger = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return '期限切れ';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}日後`;
    if (hours > 0) return `${hours}時間後`;
    return '1時間以内';
  };

  const getReminderTypeLabel = (type: ReminderType): string => {
    switch (type) {
      case 'food': return '🍽️ 食事';
      case 'medication': return '💊 薬';
      case 'vet_visit': return '🏥 病院';
      case 'grooming': return '✂️ グルーミング';
      case 'weighing': return '⚖️ 体重測定';
      case 'custom': return '📝 カスタム';
    }
  };

  const getAlertIcon = (severity: string): string => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getAlertClass = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'alert-critical';
      case 'warning': return 'alert-warning';
      case 'info': return 'alert-info';
      default: return 'alert-info';
    }
  };

  return (
    <div className="reminder-manager">
      <div className="manager-header">
        <h2>🔔 リマインダー・アラート</h2>
        
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'reminders' ? 'active' : ''}`}
            onClick={() => setActiveTab('reminders')}
          >
            ⏰ リマインダー ({reminders.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            🚨 アラート ({unreadAlertsCount})
          </button>
        </div>
      </div>

      {activeTab === 'reminders' ? (
        <div className="reminders-section">
          <div className="section-header">
            <h3>リマインダー管理</h3>
            <button
              className="add-btn"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? '✕ キャンセル' : '+ 追加'}
            </button>
          </div>

          {showAddForm && (
            <div className="add-reminder-form">
              <h4>新しいリマインダー</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>種類:</label>
                  <select
                    value={newReminder.type}
                    onChange={(e) => setNewReminder({
                      ...newReminder,
                      type: e.target.value as ReminderType
                    })}
                  >
                    <option value="food">🍽️ 食事</option>
                    <option value="medication">💊 薬</option>
                    <option value="vet_visit">🏥 病院</option>
                    <option value="grooming">✂️ グルーミング</option>
                    <option value="weighing">⚖️ 体重測定</option>
                    <option value="custom">📝 カスタム</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>タイトル:</label>
                  <input
                    type="text"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({
                      ...newReminder,
                      title: e.target.value
                    })}
                    placeholder="リマインダーのタイトル"
                  />
                </div>

                <div className="form-group">
                  <label>時間:</label>
                  <input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({
                      ...newReminder,
                      time: e.target.value
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>頻度:</label>
                  <select
                    value={newReminder.frequency}
                    onChange={(e) => setNewReminder({
                      ...newReminder,
                      frequency: e.target.value as any
                    })}
                  >
                    <option value="once">一回のみ</option>
                    <option value="daily">毎日</option>
                    <option value="weekly">毎週</option>
                    <option value="monthly">毎月</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>説明 (任意):</label>
                  <textarea
                    value={newReminder.description}
                    onChange={(e) => setNewReminder({
                      ...newReminder,
                      description: e.target.value
                    })}
                    placeholder="リマインダーの詳細説明"
                    rows={2}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="save-btn" onClick={handleAddReminder}>
                  保存
                </button>
              </div>
            </div>
          )}

          <div className="reminders-list">
            {reminders.length === 0 ? (
              <div className="no-reminders">
                <p>リマインダーが設定されていません。</p>
                <p>上の「+ 追加」ボタンから新しいリマインダーを作成しましょう。</p>
              </div>
            ) : (
              reminders.map(reminder => (
                <div
                  key={reminder.id}
                  className={`reminder-card ${!reminder.enabled ? 'disabled' : ''}`}
                >
                  <div className="reminder-header">
                    <div className="reminder-type">
                      {getReminderTypeLabel(reminder.type)}
                    </div>
                    <div className="reminder-actions">
                      <button
                        className={`toggle-btn ${reminder.enabled ? 'enabled' : 'disabled'}`}
                        onClick={() => handleToggleReminder(reminder.id)}
                        title={reminder.enabled ? '無効にする' : '有効にする'}
                      >
                        {reminder.enabled ? '🔔' : '🔕'}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteReminder(reminder.id)}
                        title="削除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="reminder-content">
                    <h4>{reminder.title}</h4>
                    {reminder.description && (
                      <p className="reminder-description">{reminder.description}</p>
                    )}
                    
                    <div className="reminder-details">
                      <span className="reminder-time">⏰ {reminder.time}</span>
                      <span className="reminder-frequency">
                        🔄 {reminder.frequency === 'daily' ? '毎日' :
                           reminder.frequency === 'weekly' ? '毎週' :
                           reminder.frequency === 'monthly' ? '毎月' : '一回のみ'}
                      </span>
                      <span className="next-trigger">
                        ⏳ {formatNextTrigger(reminder.nextTrigger)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="alerts-section">
          <div className="section-header">
            <h3>アラート一覧</h3>
            {unreadAlertsCount > 0 && (
              <span className="unread-count">{unreadAlertsCount}件未読</span>
            )}
          </div>

          <div className="alerts-list">
            {alerts.length === 0 ? (
              <div className="no-alerts">
                <p>現在アラートはありません。</p>
                <p>健康状態や行動パターンに問題がある場合、自動的にアラートが表示されます。</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`alert-card ${getAlertClass(alert.severity)} ${alert.isRead ? 'read' : 'unread'}`}
                >
                  <div className="alert-header">
                    <div className="alert-icon">
                      {getAlertIcon(alert.severity)}
                    </div>
                    <div className="alert-title">
                      <h4>{alert.title}</h4>
                      <span className="alert-time">
                        {alert.createdAt.toLocaleDateString()} {alert.createdAt.toLocaleTimeString()}
                      </span>
                    </div>
                    {!alert.isRead && (
                      <button
                        className="mark-read-btn"
                        onClick={() => handleMarkAlertAsRead(alert.id)}
                        title="既読にする"
                      >
                        ✓
                      </button>
                    )}
                  </div>

                  <div className="alert-content">
                    <p>{alert.message}</p>
                    {alert.data && (
                      <div className="alert-data">
                        <small>
                          {JSON.stringify(alert.data, null, 2).replace(/[{},"]/g, '').trim()}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderManager;