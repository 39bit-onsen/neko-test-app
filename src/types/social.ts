export interface VetProfile {
  id: string;
  name: string;
  clinicName: string;
  licenseNumber: string;
  specialties: string[];
  email: string;
  phone?: string;
  address?: string;
  verified: boolean;
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'caretaker' | 'observer';
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
    canManageCats: boolean;
  };
  invitedBy: string;
  joinedAt: Date;
  lastActive: Date;
  profilePhoto?: string;
}

export interface SharedRecord {
  id: string;
  entryId: string;
  catId: string;
  sharedBy: string;
  sharedWith: string[];
  shareType: 'vet' | 'family' | 'public';
  permissions: {
    canComment: boolean;
    canDownload: boolean;
    expiresAt?: Date;
  };
  message?: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  entryId: string;
  authorId: string;
  authorType: 'user' | 'vet' | 'family';
  content: string;
  type: 'text' | 'voice' | 'image';
  attachments?: MediaAttachment[];
  replyTo?: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'audio' | 'document';
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface VetConsultation {
  id: string;
  catId: string;
  vetId: string;
  requestedBy: string;
  type: 'urgent' | 'routine' | 'follow_up';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  subject: string;
  description: string;
  relatedEntries: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: Date;
  completedAt?: Date;
  diagnosis?: string;
  recommendations?: string[];
  prescription?: {
    medication: string;
    dosage: string;
    duration: string;
    instructions: string;
  }[];
  followUpRequired: boolean;
  followUpDate?: Date;
  cost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  types: {
    vetComments: boolean;
    familyComments: boolean;
    consultationUpdates: boolean;
    reminderAlerts: boolean;
    healthAlerts: boolean;
  };
}

export interface SocialSettings {
  profileVisibility: 'private' | 'family' | 'public';
  allowVetAccess: boolean;
  allowFamilyInvites: boolean;
  autoShareHealthAlerts: boolean;
  vetContactsOnly: boolean;
  dataRetentionDays: number;
  notifications: NotificationPreferences;
}