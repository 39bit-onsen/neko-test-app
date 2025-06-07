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
  catId: string;
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
  microchipId?: string;
  medicalNotes?: string;
  emergencyContact?: string;
  isActive: boolean;
  color?: string;
  adoptionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MultiCatState {
  cats: CatProfile[];
  activeCatId: string | null;
  settings: {
    defaultCat?: string;
    showAllCatsInStats: boolean;
    enableCatComparison: boolean;
  };
}

export type ReminderType = 'food' | 'medication' | 'vet_visit' | 'grooming' | 'weighing' | 'custom';
export type AlertType = 'health' | 'behavior' | 'weight' | 'appetite' | 'activity';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  description?: string;
  time: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  lastTriggered?: Date;
  nextTrigger: Date;
  createdAt: Date;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface AppState {
  currentCat?: CatProfile;
  entries: DiaryEntry[];
  reminders: Reminder[];
  alerts: Alert[];
  isLoading: boolean;
  error?: string;
}