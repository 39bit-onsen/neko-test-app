import { StorageManager } from './storage';
import { DiaryEntry, CatProfile } from '../types';
import { SocialManager } from './socialManager';

export interface BackupData {
  version: string;
  timestamp: string;
  entries: DiaryEntry[];
  profiles: CatProfile[];
  socialData?: {
    vetProfiles: any[];
    familyMembers: any[];
    sharedRecords: any[];
    comments: any[];
    consultations: any[];
    settings: any;
  };
  metadata: {
    entryCount: number;
    profileCount: number;
    size: number;
    checksum: string;
  };
}

export interface BackupOptions {
  includeSocialData?: boolean;
  includeMedia?: boolean;
  compression?: boolean;
}

export class BackupManager {
  private static readonly BACKUP_VERSION = '1.0.0';
  private static readonly MAX_BACKUP_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly BACKUP_STORAGE_KEY = 'cat-diary-backups';

  // フルバックアップの作成
  static async createBackup(options: BackupOptions = {}): Promise<BackupData> {
    try {
      console.log('Creating backup...');
      
      const entries = await StorageManager.getEntries();
      const profiles = await StorageManager.getProfiles();
      
      let socialData;
      if (options.includeSocialData) {
        socialData = {
          vetProfiles: SocialManager.loadVetProfiles(),
          familyMembers: SocialManager.loadFamilyMembers(),
          sharedRecords: SocialManager.loadSharedRecords(),
          comments: SocialManager.loadComments(),
          consultations: SocialManager.loadConsultations(),
          settings: SocialManager.loadSocialSettings()
        };
      }

      const backupData: BackupData = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        entries,
        profiles,
        socialData,
        metadata: {
          entryCount: entries.length,
          profileCount: profiles.length,
          size: 0,
          checksum: ''
        }
      };

      // メタデータの計算
      const dataString = JSON.stringify(backupData);
      backupData.metadata.size = new Blob([dataString]).size;
      backupData.metadata.checksum = await this.calculateChecksum(dataString);

      console.log(`Backup created: ${backupData.metadata.entryCount} entries, ${backupData.metadata.profileCount} profiles`);
      
      return backupData;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error('バックアップの作成に失敗しました');
    }
  }

  // バックアップのダウンロード
  static async downloadBackup(options: BackupOptions = {}): Promise<void> {
    try {
      const backupData = await this.createBackup(options);
      
      if (backupData.metadata.size > this.MAX_BACKUP_SIZE) {
        throw new Error('バックアップサイズが大きすぎます');
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cat-diary-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Backup downloaded successfully');
    } catch (error) {
      console.error('Failed to download backup:', error);
      throw error;
    }
  }

  // バックアップのアップロード・復元
  static async restoreFromBackup(file: File): Promise<void> {
    try {
      console.log('Restoring from backup...');
      
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);
      
      // バックアップの検証
      if (!this.validateBackup(backupData)) {
        throw new Error('無効なバックアップファイルです');
      }

      // チェックサムの検証
      const calculatedChecksum = await this.calculateChecksum(
        JSON.stringify({
          ...backupData,
          metadata: {
            ...backupData.metadata,
            checksum: ''
          }
        })
      );
      
      if (calculatedChecksum !== backupData.metadata.checksum) {
        console.warn('Checksum mismatch - backup may be corrupted');
      }

      // 現在のデータのバックアップを作成
      await this.createLocalBackup();

      // データの復元
      await this.restoreData(backupData);

      console.log('Backup restored successfully');
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }

  // 増分バックアップの作成
  static async createIncrementalBackup(lastBackupTimestamp: string): Promise<BackupData | null> {
    try {
      const entries = await StorageManager.getEntries();
      const lastBackupDate = new Date(lastBackupTimestamp);
      
      const changedEntries = entries.filter(entry => 
        new Date(entry.date) > lastBackupDate
      );

      if (changedEntries.length === 0) {
        console.log('No changes since last backup');
        return null;
      }

      const profiles = await StorageManager.getProfiles();
      
      const backupData: BackupData = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        entries: changedEntries,
        profiles,
        metadata: {
          entryCount: changedEntries.length,
          profileCount: profiles.length,
          size: 0,
          checksum: ''
        }
      };

      const dataString = JSON.stringify(backupData);
      backupData.metadata.size = new Blob([dataString]).size;
      backupData.metadata.checksum = await this.calculateChecksum(dataString);

      console.log(`Incremental backup created: ${changedEntries.length} new/modified entries`);
      
      return backupData;
    } catch (error) {
      console.error('Failed to create incremental backup:', error);
      throw error;
    }
  }

  // 自動バックアップの設定
  static setupAutoBackup(intervalHours: number = 24): void {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    // 前回のバックアップ時間をチェック
    const lastBackup = localStorage.getItem('last-auto-backup');
    const lastBackupTime = lastBackup ? new Date(lastBackup) : new Date(0);
    const now = new Date();
    
    if (now.getTime() - lastBackupTime.getTime() >= intervalMs) {
      // すぐにバックアップを実行
      this.performAutoBackup();
    }

    // 定期的なバックアップのスケジュール
    setInterval(() => {
      this.performAutoBackup();
    }, intervalMs);

    console.log(`Auto backup scheduled every ${intervalHours} hours`);
  }

  // 自動バックアップの実行
  private static async performAutoBackup(): Promise<void> {
    try {
      const lastBackupTimestamp = localStorage.getItem('last-auto-backup') || new Date(0).toISOString();
      const incrementalBackup = await this.createIncrementalBackup(lastBackupTimestamp);
      
      if (incrementalBackup) {
        await this.saveLocalBackup(incrementalBackup);
        localStorage.setItem('last-auto-backup', new Date().toISOString());
        console.log('Auto backup completed');
      }
    } catch (error) {
      console.error('Auto backup failed:', error);
    }
  }

  // ローカルバックアップの保存
  private static async saveLocalBackup(backupData: BackupData): Promise<void> {
    try {
      const backups = this.getLocalBackups();
      backups.push({
        id: `backup_${Date.now()}`,
        timestamp: backupData.timestamp,
        size: backupData.metadata.size,
        entryCount: backupData.metadata.entryCount
      });

      // 最大10個のバックアップを保持
      if (backups.length > 10) {
        backups.splice(0, backups.length - 10);
      }

      localStorage.setItem(this.BACKUP_STORAGE_KEY, JSON.stringify(backups));
      localStorage.setItem(`backup_data_${backupData.timestamp}`, JSON.stringify(backupData));
    } catch (error) {
      console.error('Failed to save local backup:', error);
    }
  }

  // ローカルバックアップの取得
  static getLocalBackups(): Array<{
    id: string;
    timestamp: string;
    size: number;
    entryCount: number;
  }> {
    try {
      const stored = localStorage.getItem(this.BACKUP_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get local backups:', error);
      return [];
    }
  }

  // バックアップの削除
  static deleteLocalBackup(timestamp: string): void {
    try {
      const backups = this.getLocalBackups();
      const updatedBackups = backups.filter(b => b.timestamp !== timestamp);
      
      localStorage.setItem(this.BACKUP_STORAGE_KEY, JSON.stringify(updatedBackups));
      localStorage.removeItem(`backup_data_${timestamp}`);
      
      console.log('Local backup deleted');
    } catch (error) {
      console.error('Failed to delete local backup:', error);
    }
  }

  // データの復元
  private static async restoreData(backupData: BackupData): Promise<void> {
    // エントリの復元
    for (const entry of backupData.entries) {
      await StorageManager.saveEntry(entry);
    }

    // プロファイルの復元
    for (const profile of backupData.profiles) {
      await StorageManager.saveProfile(profile);
    }

    // ソーシャルデータの復元
    if (backupData.socialData) {
      const { socialData } = backupData;
      
      // 各データを復元
      if (socialData.vetProfiles) {
        localStorage.setItem('vet-profiles', JSON.stringify(socialData.vetProfiles));
      }
      if (socialData.familyMembers) {
        localStorage.setItem('family-members', JSON.stringify(socialData.familyMembers));
      }
      if (socialData.sharedRecords) {
        localStorage.setItem('shared-records', JSON.stringify(socialData.sharedRecords));
      }
      if (socialData.comments) {
        localStorage.setItem('comments', JSON.stringify(socialData.comments));
      }
      if (socialData.consultations) {
        localStorage.setItem('vet-consultations', JSON.stringify(socialData.consultations));
      }
      if (socialData.settings) {
        localStorage.setItem('social-settings', JSON.stringify(socialData.settings));
      }
    }
  }

  // バックアップの検証
  private static validateBackup(backupData: any): boolean {
    return (
      backupData &&
      typeof backupData.version === 'string' &&
      typeof backupData.timestamp === 'string' &&
      Array.isArray(backupData.entries) &&
      Array.isArray(backupData.profiles) &&
      backupData.metadata &&
      typeof backupData.metadata.entryCount === 'number' &&
      typeof backupData.metadata.profileCount === 'number'
    );
  }

  // チェックサムの計算
  private static async calculateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // 現在のデータのローカルバックアップ作成
  private static async createLocalBackup(): Promise<void> {
    const backupData = await this.createBackup({ includeSocialData: true });
    await this.saveLocalBackup(backupData);
  }

  // バックアップの統計情報取得
  static getBackupStats(): {
    totalBackups: number;
    totalSize: number;
    latestBackup?: string;
    oldestBackup?: string;
  } {
    const backups = this.getLocalBackups();
    
    if (backups.length === 0) {
      return {
        totalBackups: 0,
        totalSize: 0
      };
    }

    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const timestamps = backups.map(b => b.timestamp).sort();

    return {
      totalBackups: backups.length,
      totalSize,
      latestBackup: timestamps[timestamps.length - 1],
      oldestBackup: timestamps[0]
    };
  }

  // クラウドストレージへのバックアップ（将来の拡張用）
  static async uploadToCloud(backupData: BackupData, provider: 'gdrive' | 'dropbox' | 'onedrive'): Promise<boolean> {
    // 実装は各クラウドプロバイダーのAPIに依存
    console.log(`Cloud backup to ${provider} - Not implemented yet`);
    return false;
  }

  // クラウドからの復元（将来の拡張用）
  static async restoreFromCloud(provider: 'gdrive' | 'dropbox' | 'onedrive', backupId: string): Promise<void> {
    // 実装は各クラウドプロバイダーのAPIに依存
    console.log(`Cloud restore from ${provider} - Not implemented yet`);
    throw new Error('クラウド復元はまだ実装されていません');
  }
}