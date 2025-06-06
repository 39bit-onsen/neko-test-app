export type EntryType = 'food' | 'health' | 'behavior' | 'free';

export type Mood = '😸' | '😻' | '😿' | '😾' | '🙀' | '😺' | '😹' | '😼';

export interface BaseEntryData {
  notes?: string;
}

export interface FoodData extends BaseEntryData {
  time: string;
  foodType: string;
  amount: number;
  amountUnit: 'g' | 'ml' | 'pieces';
  appetite: 'excellent' | 'good' | 'fair' | 'poor' | 'none';
  finished: boolean;
}

export interface HealthData extends BaseEntryData {
  weight?: number;
  temperature?: number;
  symptoms: string[];
  medication?: {
    name: string;
    dosage: string;
    time: string;
  }[];
  vetVisit?: boolean;
  vetNotes?: string;
}

export interface BehaviorData extends BaseEntryData {
  activityLevel: 'very_active' | 'active' | 'normal' | 'calm' | 'lethargic';
  sleepHours?: number;
  playTime?: number;
  litterBoxUses?: number;
  specialBehaviors: string[];
  location: string[];
}

export interface FreeData extends BaseEntryData {
  title: string;
  content: string;
  tags: string[];
}

export type EntryData = FoodData | HealthData | BehaviorData | FreeData;

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video';
  url: string;
  file?: File;
  caption?: string;
  size: number;
  fileName: string;
  mimeType: string;
  thumbnail?: string;
}

export interface DiaryEntry {
  id: string;
  type: EntryType;
  date: Date;
  data: EntryData;
  media: MediaAttachment[];
  mood: Mood;
  weather?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CatProfile {
  id: string;
  name: string;
  breed?: string;
  birthDate?: Date;
  gender?: 'male' | 'female';
  neutered?: boolean;
  weight?: number;
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  currentCat?: CatProfile;
  entries: DiaryEntry[];
  isLoading: boolean;
  error?: string;
}