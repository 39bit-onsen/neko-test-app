import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/darkTheme.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { PWAManager, PWAUtils } from './utils/pwaManager';
import { BackupManager } from './utils/backupManager';
import reportWebVitals from './reportWebVitals';

// PWA初期化
const initializePWA = async () => {
  // Service Worker登録
  await PWAManager.registerServiceWorker();
  
  // オフライン処理の初期化
  PWAManager.initializeOfflineHandling();
  
  // 自動バックアップの設定（24時間ごと）
  BackupManager.setupAutoBackup(24);
  
  // インストールプロンプトの処理
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    PWAUtils.showInstallBanner(e);
  });
  
  // オフライン状態の表示
  if (!PWAManager.isAppOnline()) {
    PWAUtils.showOfflineMessage();
  }
  
  console.log('PWA initialized successfully');
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// PWA機能の初期化
initializePWA().catch(error => {
  console.error('Failed to initialize PWA:', error);
});

// パフォーマンス測定
reportWebVitals();
