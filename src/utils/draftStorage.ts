import { EntryType, EntryData } from '../types';

export interface DraftData {
  id: string;
  type: EntryType;
  data: Partial<EntryData>;
  mood: string;
  date: string;
  savedAt: Date;
}

const DRAFT_STORAGE_KEY = 'catDiary_drafts';
const MAX_DRAFTS = 10;

class DraftStorageManager {
  private getDrafts(): DraftData[] {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!stored) return [];
      
      const drafts = JSON.parse(stored);
      return drafts.map((draft: any) => ({
        ...draft,
        savedAt: new Date(draft.savedAt)
      }));
    } catch (error) {
      console.error('Failed to load drafts:', error);
      return [];
    }
  }

  private saveDrafts(drafts: DraftData[]): void {
    try {
      const serializedDrafts = drafts.map(draft => ({
        ...draft,
        savedAt: draft.savedAt.toISOString()
      }));
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(serializedDrafts));
    } catch (error) {
      console.error('Failed to save drafts:', error);
    }
  }

  saveDraft(
    type: EntryType,
    data: Partial<EntryData>,
    mood: string = '😸',
    date: string = new Date().toISOString().split('T')[0]
  ): string {
    const drafts = this.getDrafts();
    const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newDraft: DraftData = {
      id: draftId,
      type,
      data,
      mood,
      date,
      savedAt: new Date()
    };

    // 最新の下書きを先頭に追加
    const updatedDrafts = [newDraft, ...drafts];
    
    // 古い下書きを削除（最大保存数を超えた場合）
    if (updatedDrafts.length > MAX_DRAFTS) {
      updatedDrafts.splice(MAX_DRAFTS);
    }

    this.saveDrafts(updatedDrafts);
    return draftId;
  }

  loadDraft(draftId: string): DraftData | null {
    const drafts = this.getDrafts();
    return drafts.find(draft => draft.id === draftId) || null;
  }

  getAllDrafts(): DraftData[] {
    return this.getDrafts().sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
  }

  deleteDraft(draftId: string): void {
    const drafts = this.getDrafts();
    const filteredDrafts = drafts.filter(draft => draft.id !== draftId);
    this.saveDrafts(filteredDrafts);
  }

  updateDraft(
    draftId: string,
    type: EntryType,
    data: Partial<EntryData>,
    mood: string,
    date: string
  ): void {
    const drafts = this.getDrafts();
    const draftIndex = drafts.findIndex(draft => draft.id === draftId);
    
    if (draftIndex !== -1) {
      drafts[draftIndex] = {
        ...drafts[draftIndex],
        type,
        data,
        mood,
        date,
        savedAt: new Date()
      };
      this.saveDrafts(drafts);
    }
  }

  clearAllDrafts(): void {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  }

  hasDrafts(): boolean {
    return this.getDrafts().length > 0;
  }

  getAutoSaveKey(formId: string): string {
    return `catDiary_autosave_${formId}`;
  }

  autoSave(
    formId: string,
    type: EntryType,
    data: Partial<EntryData>,
    mood: string,
    date: string
  ): void {
    try {
      const autoSaveData = {
        type,
        data,
        mood,
        date,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(this.getAutoSaveKey(formId), JSON.stringify(autoSaveData));
    } catch (error) {
      console.error('Failed to auto-save:', error);
    }
  }

  loadAutoSave(formId: string): DraftData | null {
    try {
      const stored = localStorage.getItem(this.getAutoSaveKey(formId));
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      return {
        id: formId,
        ...data,
        savedAt: new Date(data.savedAt)
      };
    } catch (error) {
      console.error('Failed to load auto-save:', error);
      return null;
    }
  }

  clearAutoSave(formId: string): void {
    localStorage.removeItem(this.getAutoSaveKey(formId));
  }
}

export const draftStorage = new DraftStorageManager();