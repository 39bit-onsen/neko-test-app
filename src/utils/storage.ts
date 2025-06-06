import { DiaryEntry, CatProfile } from '../types';

const DB_NAME = 'CatDiaryDB';
const DB_VERSION = 1;
const ENTRIES_STORE = 'entries';
const PROFILES_STORE = 'profiles';

class StorageManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
          const entriesStore = db.createObjectStore(ENTRIES_STORE, { keyPath: 'id' });
          entriesStore.createIndex('date', 'date', { unique: false });
          entriesStore.createIndex('type', 'type', { unique: false });
          entriesStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(PROFILES_STORE)) {
          const profilesStore = db.createObjectStore(PROFILES_STORE, { keyPath: 'id' });
          profilesStore.createIndex('name', 'name', { unique: false });
        }
      };
    });
  }

  async saveEntry(entry: DiaryEntry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const entryToSave = {
      ...entry,
      date: entry.date.toISOString(),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ENTRIES_STORE], 'readwrite');
      const store = transaction.objectStore(ENTRIES_STORE);
      const request = store.put(entryToSave);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getEntries(): Promise<DiaryEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ENTRIES_STORE], 'readonly');
      const store = transaction.objectStore(ENTRIES_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entries = request.result.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt)
        }));
        
        entries.sort((a: DiaryEntry, b: DiaryEntry) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
        
        resolve(entries);
      };
    });
  }

  async getEntry(id: string): Promise<DiaryEntry | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ENTRIES_STORE], 'readonly');
      const store = transaction.objectStore(ENTRIES_STORE);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result) {
          const entry = {
            ...request.result,
            date: new Date(request.result.date),
            createdAt: new Date(request.result.createdAt),
            updatedAt: new Date(request.result.updatedAt)
          };
          resolve(entry);
        } else {
          resolve(null);
        }
      };
    });
  }

  async updateEntry(entry: DiaryEntry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const entryToUpdate = {
      ...entry,
      date: entry.date.toISOString(),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ENTRIES_STORE], 'readwrite');
      const store = transaction.objectStore(ENTRIES_STORE);
      const request = store.put(entryToUpdate);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async deleteEntry(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ENTRIES_STORE], 'readwrite');
      const store = transaction.objectStore(ENTRIES_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async saveCatProfile(profile: CatProfile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const profileToSave = {
      ...profile,
      birthDate: profile.birthDate?.toISOString(),
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PROFILES_STORE], 'readwrite');
      const store = transaction.objectStore(PROFILES_STORE);
      const request = store.put(profileToSave);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getCatProfiles(): Promise<CatProfile[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PROFILES_STORE], 'readonly');
      const store = transaction.objectStore(PROFILES_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const profiles = request.result.map((profile: any) => ({
          ...profile,
          birthDate: profile.birthDate ? new Date(profile.birthDate) : undefined,
          createdAt: new Date(profile.createdAt),
          updatedAt: new Date(profile.updatedAt)
        }));
        resolve(profiles);
      };
    });
  }
}

export const storageManager = new StorageManager();