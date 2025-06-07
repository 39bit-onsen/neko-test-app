import React, { useState, useEffect } from 'react';
import { Reminder, Alert } from '../../types';
import { ReminderManager } from '../../utils/reminderManager';
import './NotificationCenter.css';

interface NotificationCenterProps {
  reminders: Reminder[];
  alerts: Alert[];
  onUpdateReminders: (reminders: Reminder[]) => void;
  onUpdateAlerts: (alerts: Alert[]) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  reminders,
  alerts,
  onUpdateReminders,
  onUpdateAlerts
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dueReminders, setDueReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const checkReminders = () => {
      const due = ReminderManager.checkDueReminders(reminders);
      setDueReminders(due);
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [reminders]);

  const handleSnoozeReminder = (reminderId: string) => {
    const reminder = dueReminders.find(r => r.id === reminderId);
    if (!reminder) return;

    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + 15);
    
    const updatedReminders = reminders.map(r =>
      r.id === reminderId ? { ...r, nextTrigger: snoozeTime } : r
    );
    
    onUpdateReminders(updatedReminders);
    ReminderManager.saveReminders(updatedReminders);
  };

  const handleCompleteReminder = (reminderId: string) => {
    const reminder = dueReminders.find(r => r.id === reminderId);
    if (!reminder) return;

    const updatedReminder = ReminderManager.updateReminderAfterTrigger(reminder);
    const updatedReminders = reminders.map(r =>
      r.id === reminderId ? updatedReminder : r
    );
    
    onUpdateReminders(updatedReminders);
    ReminderManager.saveReminders(updatedReminders);
  };

  const handleDismissAlert = (alertId: string) => {
    const updatedAlerts = ReminderManager.markAlertAsRead(alerts, alertId);
    onUpdateAlerts(updatedAlerts);
    ReminderManager.saveAlerts(updatedAlerts);
  };

  const unreadAlertsCount = ReminderManager.getUnreadAlertsCount(alerts);
  const totalNotifications = dueReminders.length + unreadAlertsCount;

  const getAlertIcon = (severity: string): string => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getReminderTypeIcon = (type: string): string => {
    switch (type) {
      case 'food': return '🍽️';
      case 'medication': return '💊';
      case 'vet_visit': return '🏥';
      case 'grooming': return '✂️';
      case 'weighing': return '⚖️';
      default: return '📝';
    }
  };

  return (
    <div className="notification-center">
      <button
        className={`notification-trigger ${totalNotifications > 0 ? 'has-notifications' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="通知センター"
      >
        🔔
        {totalNotifications > 0 && (
          <span className="notification-badge">{totalNotifications}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>通知センター</h3>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="notification-content">
            {totalNotifications === 0 ? (
              <div className="no-notifications">
                <p>新しい通知はありません</p>
              </div>
            ) : (
              <>
                {dueReminders.length > 0 && (
                  <div className="notification-section">
                    <h4>⏰ 期限のリマインダー</h4>
                    {dueReminders.map(reminder => (
                      <div key={reminder.id} className="notification-item reminder-item">
                        <div className="notification-icon">
                          {getReminderTypeIcon(reminder.type)}
                        </div>
                        <div className="notification-text">
                          <div className="notification-title">{reminder.title}</div>
                          {reminder.description && (
                            <div className="notification-description">{reminder.description}</div>
                          )}
                          <div className="notification-time">
                            {reminder.time} - {reminder.frequency === 'daily' ? '毎日' : 
                             reminder.frequency === 'weekly' ? '毎週' :
                             reminder.frequency === 'monthly' ? '毎月' : '一回のみ'}
                          </div>
                        </div>
                        <div className="notification-actions">
                          <button
                            className="snooze-btn"
                            onClick={() => handleSnoozeReminder(reminder.id)}
                            title="15分後に再通知"
                          >
                            ⏰
                          </button>
                          <button
                            className="complete-btn"
                            onClick={() => handleCompleteReminder(reminder.id)}
                            title="完了"
                          >
                            ✓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {unreadAlertsCount > 0 && (
                  <div className="notification-section">
                    <h4>🚨 アラート</h4>
                    {alerts
                      .filter(alert => !alert.isRead)
                      .slice(0, 5)
                      .map(alert => (
                        <div
                          key={alert.id}
                          className={`notification-item alert-item ${alert.severity}`}
                        >
                          <div className="notification-icon">
                            {getAlertIcon(alert.severity)}
                          </div>
                          <div className="notification-text">
                            <div className="notification-title">{alert.title}</div>
                            <div className="notification-description">{alert.message}</div>
                            <div className="notification-time">
                              {alert.createdAt.toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="notification-actions">
                            <button
                              className="dismiss-btn"
                              onClick={() => handleDismissAlert(alert.id)}
                              title="既読にする"
                            >
                              ✓
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="notification-footer">
            <button
              className="view-all-btn"
              onClick={() => {
                setIsOpen(false);
                // ここでリマインダー管理画面に遷移するロジックを追加
              }}
            >
              すべて表示
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;