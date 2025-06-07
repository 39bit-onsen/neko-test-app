export class PWAManager {
  private static swRegistration: ServiceWorkerRegistration | null = null;
  private static isOnline = navigator.onLine;
  private static onlineCallbacks: (() => void)[] = [];
  private static offlineCallbacks: (() => void)[] = [];

  // Service Worker登録
  static async registerServiceWorker(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = registration;
        
        console.log('Service Worker registered successfully');
        
        // Service Workerの更新チェック
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // 新しいService Workerが利用可能
                  this.notifyUpdate();
                }
              }
            });
          }
        });

        return true;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return false;
      }
    }
    return false;
  }

  // プッシュ通知の許可を要求
  static async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // プッシュ通知の購読
  static async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.error('Service Worker not registered');
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY || 'demo-key'
        )
      });
      
      console.log('Push subscription successful');
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  // プッシュ通知送信
  static async sendNotification(
    title: string,
    options: NotificationOptions = {}
  ): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/logo192.png',
          badge: '/logo192.png',
          ...options
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }
  }

  // リマインダー通知のスケジュール
  static scheduleNotification(
    title: string,
    body: string,
    delay: number, // ミリ秒
    options: NotificationOptions = {}
  ): number {
    return window.setTimeout(() => {
      this.sendNotification(title, {
        body,
        tag: 'cat-diary-reminder',
        requireInteraction: true,
        ...options
      });
    }, delay);
  }

  // 背景同期のスケジュール
  static async scheduleBackgroundSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        await this.swRegistration?.sync.register(tag);
        console.log(`Background sync scheduled: ${tag}`);
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  // オフライン状態の監視
  static initializeOfflineHandling(): void {
    // オンライン/オフライン状態の監視
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onlineCallbacks.forEach(callback => callback());
      console.log('App is back online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.offlineCallbacks.forEach(callback => callback());
      console.log('App is offline');
    });

    // ページ可視性の変更を監視
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        // アプリがフォアグラウンドに戻った時の処理
        this.checkForUpdates();
      }
    });
  }

  // オンライン状態のコールバック登録
  static onOnline(callback: () => void): void {
    this.onlineCallbacks.push(callback);
  }

  // オフライン状態のコールバック登録
  static onOffline(callback: () => void): void {
    this.offlineCallbacks.push(callback);
  }

  // オンライン状態の確認
  static isAppOnline(): boolean {
    return this.isOnline;
  }

  // インストール可能性の確認
  static async isInstallable(): Promise<boolean> {
    return 'beforeinstallprompt' in window;
  }

  // アプリのインストールプロンプト
  static async showInstallPrompt(event?: Event): Promise<boolean> {
    if (event) {
      try {
        (event as any).prompt();
        const result = await (event as any).userChoice;
        return result.outcome === 'accepted';
      } catch (error) {
        console.error('Install prompt failed:', error);
        return false;
      }
    }
    return false;
  }

  // キャッシュ管理
  static async clearCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('All caches cleared');
      } catch (error) {
        console.error('Failed to clear caches:', error);
      }
    }
  }

  // キャッシュサイズの取得
  static async getCacheSize(): Promise<number> {
    if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
      } catch (error) {
        console.error('Failed to get cache size:', error);
        return 0;
      }
    }
    return 0;
  }

  // アプリの更新チェック
  static async checkForUpdates(): Promise<void> {
    if (this.swRegistration) {
      try {
        await this.swRegistration.update();
        console.log('Checked for Service Worker updates');
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    }
  }

  // ネットワーク品質の測定
  static async measureNetworkQuality(): Promise<{
    downlink: number;
    effectiveType: string;
    rtt: number;
  }> {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        downlink: connection.downlink || 0,
        effectiveType: connection.effectiveType || 'unknown',
        rtt: connection.rtt || 0
      };
    }
    return {
      downlink: 0,
      effectiveType: 'unknown',
      rtt: 0
    };
  }

  // デバイス情報の取得
  static getDeviceInfo(): {
    userAgent: string;
    standalone: boolean;
    orientation: string;
    screen: { width: number; height: number };
  } {
    return {
      userAgent: navigator.userAgent,
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      orientation: screen.orientation?.type || 'unknown',
      screen: {
        width: screen.width,
        height: screen.height
      }
    };
  }

  // アプリのパフォーマンス測定
  static measurePerformance(): {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
  } {
    const performance = window.performance;
    const timing = performance.timing;
    
    return {
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
    };
  }

  // プライベートメソッド
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private static notifyUpdate(): void {
    // ユーザーにアップデートが利用可能であることを通知
    this.sendNotification('アップデートが利用可能', {
      body: '新しいバージョンの猫日記が利用可能です。ページを更新してください。',
      tag: 'app-update',
      requireInteraction: true,
      actions: [
        {
          action: 'update',
          title: '更新'
        },
        {
          action: 'dismiss',
          title: '後で'
        }
      ]
    });
  }
}

// PWA関連のユーティリティ関数
export const PWAUtils = {
  // Service Workerメッセージの送信
  sendMessageToSW: async (message: any): Promise<void> => {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  },

  // プッシュ通知のテスト
  testPushNotification: async (): Promise<void> => {
    await PWAManager.sendNotification('テスト通知', {
      body: 'プッシュ通知が正常に動作しています。',
      tag: 'test-notification'
    });
  },

  // オフライン状態の表示
  showOfflineMessage: (): void => {
    const message = document.createElement('div');
    message.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f59e0b;
        color: white;
        text-align: center;
        padding: 0.5rem;
        z-index: 9999;
        font-size: 0.9rem;
      ">
        📡 オフラインモードです。一部の機能が制限される場合があります。
      </div>
    `;
    document.body.appendChild(message);

    PWAManager.onOnline(() => {
      message.remove();
    });
  },

  // インストールバナーの表示
  showInstallBanner: (event: Event): void => {
    const banner = document.createElement('div');
    banner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
        background: #6366f1;
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <div>
          <div style="font-weight: 600; margin-bottom: 0.25rem;">
            猫日記をインストール
          </div>
          <div style="font-size: 0.9rem; opacity: 0.9;">
            ホーム画面に追加して簡単にアクセス
          </div>
        </div>
        <div>
          <button id="install-btn" style="
            background: white;
            color: #6366f1;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            font-weight: 600;
            cursor: pointer;
            margin-right: 0.5rem;
          ">
            インストール
          </button>
          <button id="dismiss-btn" style="
            background: transparent;
            color: white;
            border: 1px solid white;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
          ">
            後で
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);

    banner.querySelector('#install-btn')?.addEventListener('click', async () => {
      const installed = await PWAManager.showInstallPrompt(event);
      if (installed) {
        banner.remove();
      }
    });

    banner.querySelector('#dismiss-btn')?.addEventListener('click', () => {
      banner.remove();
    });
  }
};