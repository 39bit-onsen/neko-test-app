import React, { useState, useEffect } from 'react';
import { PWAManager } from '../../utils/pwaManager';
import { ReminderManager } from '../../utils/reminderManager';
import { Reminder, Alert } from '../../types';
import './NotificationCenter.css';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
}

interface NotificationCenterProps {
  reminders?: Reminder[];
  alerts?: Alert[];
  onUpdateReminders?: (reminders: Reminder[]) => void;
  onUpdateAlerts?: (alerts: Alert[]) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  reminders = [],
  alerts = [],
  onUpdateReminders,
  onUpdateAlerts
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isOnline, setIsOnline] = useState(PWAManager.isAppOnline());
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [dueReminders, setDueReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    initializeNotifications();
    setupPWAEventListeners();
    loadStoredNotifications();
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      const due = ReminderManager.checkDueReminders(reminders);
      setDueReminders(due);
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [reminders]);

  const initializeNotifications = async () => {
    const permission = await PWAManager.requestNotificationPermission();
    setIsPermissionGranted(permission);
    
    if (!permission) {
      setShowPermissionPrompt(true);
    }
  };

  const setupPWAEventListeners = () => {
    PWAManager.onOnline(() => {
      setIsOnline(true);
      addNotification({
        title: 'オンライン復帰',
        message: 'インターネット接続が復旧しました。',
        type: 'success'
      });
    });

    PWAManager.onOffline(() => {
      setIsOnline(false);
      addNotification({
        title: 'オフライン',
        message: 'オフラインモードに切り替わりました。',
        type: 'warning'
      });
    });

    // Service Workerからのメッセージを監視
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data } = event.data;
        
        if (type === 'SYNC_COMPLETE') {
          addNotification({
            title: 'データ同期完了',
            message: 'オフライン中の変更がサーバーに同期されました。',
            type: 'success'
          });
        } else if (type === 'CACHE_UPDATED') {
          addNotification({
            title: 'アプリ更新',
            message: '新しいバージョンがダウンロードされました。',
            type: 'info',
            actions: [
              {
                id: 'reload',
                label: '今すぐ更新',
                action: () => window.location.reload()
              }
            ]
          });
        }
      });
    }
  };

  const loadStoredNotifications = () => {
    const stored = localStorage.getItem('cat-diary-notifications');
    if (stored) {
      try {
        const parsedNotifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsedNotifications);
      } catch (error) {
        console.error('Failed to load stored notifications:', error);
      }
    }
  };

  const saveNotifications = (newNotifications: Notification[]) => {
    localStorage.setItem('cat-diary-notifications', JSON.stringify(newNotifications));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    const updatedNotifications = [newNotification, ...notifications].slice(0, 50); // 最大50件
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);

    // システム通知も送信
    if (isPermissionGranted) {
      PWAManager.sendNotification(notification.title, {
        body: notification.message,
        tag: newNotification.id,
        icon: '/logo192.png'
      });
    }
  };

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const deleteNotification = (id: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== id);
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const requestPermission = async () => {
    const permission = await PWAManager.requestNotificationPermission();
    setIsPermissionGranted(permission);
    setShowPermissionPrompt(!permission);
    
    if (permission) {
      addNotification({
        title: '通知が有効になりました',
        message: '重要な更新やリマインダーを受け取れます。',
        type: 'success'
      });
    }
  };

  const testNotification = () => {
    addNotification({
      title: 'テスト通知',
      message: '通知機能が正常に動作しています。',
      type: 'info'
    });
  };

  const handleSnoozeReminder = (reminderId: string) => {
    const reminder = dueReminders.find(r => r.id === reminderId);
    if (!reminder || !onUpdateReminders) return;

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
    if (!reminder || !onUpdateReminders) return;

    const updatedReminder = ReminderManager.updateReminderAfterTrigger(reminder);
    const updatedReminders = reminders.map(r =>
      r.id === reminderId ? updatedReminder : r
    );
    
    onUpdateReminders(updatedReminders);
    ReminderManager.saveReminders(updatedReminders);
  };

  const handleDismissAlert = (alertId: string) => {
    if (!onUpdateAlerts) return;
    
    const updatedAlerts = ReminderManager.markAlertAsRead(alerts, alertId);
    onUpdateAlerts(updatedAlerts);
    ReminderManager.saveAlerts(updatedAlerts);
  };

  const scheduleHealthReminder = () => {
    const reminderTime = new Date();
    reminderTime.setHours(reminderTime.getHours() + 1);
    
    PWAManager.scheduleNotification(
      '健康チェックのリマインダー',
      '愛猫の健康状態をチェックする時間です。',
      60 * 60 * 1000, // 1時間後
      {
        tag: 'health-reminder',
        requireInteraction: true,
        actions: [
          {
            action: 'check-health',
            title: '健康チェック'
          },
          {
            action: 'snooze',
            title: '後で'
          }
        ]
      }
    );

    addNotification({
      title: 'リマインダー設定',
      message: '1時間後に健康チェックの通知をお送りします。',
      type: 'info'
    });
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      info: '💬',
      warning: '⚠️',
      error: '❌',
      success: '✅'
    };
    return icons[type];
  };

  const getNotificationTypeClass = (type: Notification['type']) => {
    return `notification-${type}`;
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

  const getAlertIcon = (severity: string): string => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const unreadAlertsCount = ReminderManager.getUnreadAlertsCount(alerts);
  const totalNotifications = unreadCount + dueReminders.length + unreadAlertsCount;

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h2>🔔 通知センター</h2>
        <div className="header-actions">
          {totalNotifications > 0 && (
            <span className="unread-badge">{totalNotifications}</span>
          )}
          <button
            className="action-btn"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            すべて既読
          </button>
          <button
            className="action-btn danger"
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
          >
            すべて削除
          </button>
        </div>
      </div>

      {showPermissionPrompt && (
        <div className="permission-prompt">
          <div className="prompt-content">
            <span className="prompt-icon">🔔</span>
            <div className="prompt-text">
              <h4>通知を有効にしますか？</h4>
              <p>重要な更新やリマインダーを受け取るために通知を許可してください。</p>
            </div>
            <div className="prompt-actions">
              <button className="allow-btn" onClick={requestPermission}>
                許可
              </button>
              <button
                className="deny-btn"
                onClick={() => setShowPermissionPrompt(false)}
              >
                後で
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="notification-controls">
        <div className="status-indicator">
          <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
          <span className="status-text">
            {isOnline ? 'オンライン' : 'オフライン'}
          </span>
        </div>
        
        <div className="control-buttons">
          <button className="control-btn" onClick={testNotification}>
            🧪 テスト通知
          </button>
          <button className="control-btn" onClick={scheduleHealthReminder}>
            ⏰ 健康リマインダー
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {/* リマインダーセクション */}
        {dueReminders.length > 0 && (
          <div className="notification-section">
            <h3>⏰ 期限のリマインダー</h3>
            {dueReminders.map(reminder => (
              <div key={`reminder-${reminder.id}`} className="notification-item reminder-item">
                <div className="notification-icon">
                  {getReminderTypeIcon(reminder.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{reminder.title}</div>
                  {reminder.description && (
                    <div className="notification-message">{reminder.description}</div>
                  )}
                  <div className="notification-timestamp">
                    {reminder.time} - {reminder.frequency === 'daily' ? '毎日' : 
                     reminder.frequency === 'weekly' ? '毎週' :
                     reminder.frequency === 'monthly' ? '毎月' : '一回のみ'}
                  </div>
                </div>
                <div className="notification-controls">
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

        {/* アラートセクション */}
        {unreadAlertsCount > 0 && (
          <div className="notification-section">
            <h3>🚨 アラート</h3>
            {alerts
              .filter(alert => !alert.isRead)
              .slice(0, 5)
              .map(alert => (
                <div key={`alert-${alert.id}`} className={`notification-item alert-item ${alert.severity}`}>
                  <div className="notification-icon">
                    {getAlertIcon(alert.severity)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{alert.title}</div>
                    <div className="notification-message">{alert.message}</div>
                    <div className="notification-timestamp">
                      {alert.createdAt.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="notification-controls">
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

        {/* PWA通知セクション */}
        {notifications.length === 0 && dueReminders.length === 0 && unreadAlertsCount === 0 ? (
          <div className="no-notifications">
            <span className="no-notifications-icon">📭</span>
            <h4>通知はありません</h4>
            <p>新しい通知が届くとここに表示されます。</p>
          </div>
        ) : (
          <>
            {notifications.length > 0 && (
              <div className="notification-section">
                <h3>📱 システム通知</h3>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${getNotificationTypeClass(notification.type)} ${
                      !notification.read ? 'unread' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-timestamp">
                        {formatTimestamp(notification.timestamp)}
                      </div>
                      
                      {notification.actions && notification.actions.length > 0 && (
                        <div className="notification-actions">
                          {notification.actions.map((action) => (
                            <button
                              key={action.id}
                              className="notification-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                action.action();
                              }}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="notification-controls">
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        title="削除"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;