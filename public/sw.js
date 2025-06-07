const CACHE_NAME = 'cat-diary-v1';
const STATIC_CACHE_NAME = 'cat-diary-static-v1';
const DYNAMIC_CACHE_NAME = 'cat-diary-dynamic-v1';

// キャッシュするファイルのリスト
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// API関連のURLパターン
const API_PATTERNS = [
  /\/api\//,
  /\/data\//
];

// 画像・メディア関連のURLパターン
const MEDIA_PATTERNS = [
  /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|avi)$/i
];

// Service Workerのインストール
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );
});

// Service Workerのアクティベート
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 静的ファイルの処理（Cache First戦略）
  if (isStaticFile(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
              return response;
            });
        })
        .catch(() => {
          // オフライン時のフォールバック
          if (request.destination === 'document') {
            return caches.match('/');
          }
        })
    );
    return;
  }
  
  // メディアファイルの処理（Cache First戦略）
  if (isMediaFile(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            });
        })
        .catch(() => {
          // オフライン時のプレースホルダー画像
          return new Response('', {
            status: 404,
            statusText: 'Media not available offline'
          });
        })
    );
    return;
  }
  
  // APIリクエストの処理（Network First戦略）
  if (isAPIRequest(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 成功時はキャッシュに保存
          if (response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // オフライン時はキャッシュから返す
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // キャッシュにもない場合はエラーレスポンス
              return new Response(
                JSON.stringify({
                  error: 'Offline - Data not available',
                  offline: true
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({
                    'Content-Type': 'application/json'
                  })
                }
              );
            });
        })
    );
    return;
  }
  
  // その他のリクエスト（Network First戦略）
  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // ドキュメントリクエストの場合はメインページを返す
            if (request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// 背景同期の処理
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'diary-sync') {
    event.waitUntil(
      syncDiaryData()
    );
  }
  
  if (event.tag === 'backup-sync') {
    event.waitUntil(
      syncBackupData()
    );
  }
});

// プッシュ通知の処理
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = {
        title: 'Cat Diary',
        body: event.data.text() || 'New notification',
        icon: '/logo192.png',
        badge: '/logo192.png'
      };
    }
  }
  
  const options = {
    body: notificationData.body || 'You have a new notification',
    icon: notificationData.icon || '/logo192.png',
    badge: notificationData.badge || '/logo192.png',
    data: notificationData.data || {},
    tag: notificationData.tag || 'cat-diary-notification',
    requireInteraction: notificationData.requireInteraction || false,
    actions: notificationData.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'Cat Diary',
      options
    )
  );
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  const notificationData = event.notification.data;
  const action = event.action;
  
  let targetUrl = '/';
  
  if (action === 'view-entry' && notificationData.entryId) {
    targetUrl = `/entry/${notificationData.entryId}`;
  } else if (action === 'open-diary') {
    targetUrl = '/';
  } else if (notificationData.url) {
    targetUrl = notificationData.url;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 既存のウィンドウがあるかチェック
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // 新しいウィンドウを開く
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ヘルパー関数

function isStaticFile(pathname) {
  return STATIC_FILES.some(file => pathname === file) ||
         pathname.startsWith('/static/') ||
         pathname === '/manifest.json' ||
         pathname === '/favicon.ico' ||
         pathname.includes('.js') ||
         pathname.includes('.css');
}

function isMediaFile(pathname) {
  return MEDIA_PATTERNS.some(pattern => pattern.test(pathname));
}

function isAPIRequest(pathname) {
  return API_PATTERNS.some(pattern => pattern.test(pathname));
}

async function syncDiaryData() {
  try {
    console.log('Service Worker: Syncing diary data...');
    
    // IndexedDBから未同期のデータを取得
    const unsyncedData = await getUnsyncedData();
    
    if (unsyncedData.length === 0) {
      console.log('Service Worker: No data to sync');
      return;
    }
    
    // サーバーにデータを送信
    for (const data of unsyncedData) {
      try {
        const response = await fetch('/api/sync/diary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          // 同期成功時にローカルデータを更新
          await markDataAsSynced(data.id);
          console.log('Service Worker: Data synced successfully', data.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync data', data.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
  }
}

async function syncBackupData() {
  try {
    console.log('Service Worker: Creating backup...');
    
    // 全データのバックアップを作成
    const backupData = await createBackup();
    
    // バックアップをサーバーに送信
    const response = await fetch('/api/backup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backupData)
    });
    
    if (response.ok) {
      console.log('Service Worker: Backup created successfully');
    }
  } catch (error) {
    console.error('Service Worker: Backup failed', error);
  }
}

// これらの関数は実際のアプリケーションではIndexedDBとやり取りします
async function getUnsyncedData() {
  // 実装例：IndexedDBから未同期データを取得
  return [];
}

async function markDataAsSynced(id) {
  // 実装例：データを同期済みとしてマーク
  console.log('Marking data as synced:', id);
}

async function createBackup() {
  // 実装例：全データのバックアップを作成
  return {
    timestamp: new Date().toISOString(),
    data: 'backup_data_placeholder'
  };
}