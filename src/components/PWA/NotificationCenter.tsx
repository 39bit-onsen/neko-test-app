import React, { useState, useEffect } from 'react';
import { PWAManager, PWAUtils } from '../../utils/pwaManager';
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

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isOnline, setIsOnline] = useState(PWAManager.isAppOnline());
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  useEffect(() => {
    initializeNotifications();
    setupPWAEventListeners();
    loadStoredNotifications();
  }, []);

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

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h2>🔔 通知センター</h2>
        <div className="header-actions">
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
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
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <span className="no-notifications-icon">📭</span>
            <h4>通知はありません</h4>
            <p>新しい通知が届くとここに表示されます。</p>
          </div>
        ) : (
          notifications.map((notification) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;