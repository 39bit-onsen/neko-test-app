import { VetProfile, FamilyMember, SharedRecord, Comment, VetConsultation, SocialSettings } from '../types/social';
import { DiaryEntry } from '../types';

export class SocialManager {
  private static readonly STORAGE_KEYS = {
    VET_PROFILES: 'vet-profiles',
    FAMILY_MEMBERS: 'family-members',
    SHARED_RECORDS: 'shared-records',
    COMMENTS: 'comments',
    CONSULTATIONS: 'vet-consultations',
    SOCIAL_SETTINGS: 'social-settings'
  };

  // Vet Profile Management
  static async saveVetProfile(profile: VetProfile): Promise<void> {
    const profiles = this.loadVetProfiles();
    const existingIndex = profiles.findIndex(p => p.id === profile.id);
    
    if (existingIndex >= 0) {
      profiles[existingIndex] = { ...profile, updatedAt: new Date() };
    } else {
      profiles.push(profile);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.VET_PROFILES, JSON.stringify(profiles));
  }

  static loadVetProfiles(): VetProfile[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.VET_PROFILES);
    if (!stored) return [];
    
    return JSON.parse(stored).map((profile: any) => ({
      ...profile,
      createdAt: new Date(profile.createdAt),
      updatedAt: new Date(profile.updatedAt)
    }));
  }

  static async verifyVetProfile(profileId: string, licenseNumber: string): Promise<boolean> {
    // In a real implementation, this would verify against a medical licensing database
    // For now, we'll simulate verification
    const profiles = this.loadVetProfiles();
    const profile = profiles.find(p => p.id === profileId);
    
    if (profile && profile.licenseNumber === licenseNumber) {
      profile.verified = true;
      profile.updatedAt = new Date();
      await this.saveVetProfile(profile);
      return true;
    }
    
    return false;
  }

  // Family Member Management
  static async inviteFamilyMember(email: string, role: FamilyMember['role'], invitedBy: string): Promise<string> {
    const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real implementation, this would send an email invitation
    // For now, we'll create a pending family member record
    const newMember: FamilyMember = {
      id: inviteId,
      name: '', // Will be filled when they accept
      email,
      role,
      permissions: this.getDefaultPermissions(role),
      invitedBy,
      joinedAt: new Date(0), // Not joined yet
      lastActive: new Date(0),
    };

    const members = this.loadFamilyMembers();
    members.push(newMember);
    localStorage.setItem(this.STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(members));
    
    return inviteId;
  }

  static loadFamilyMembers(): FamilyMember[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.FAMILY_MEMBERS);
    if (!stored) return [];
    
    return JSON.parse(stored).map((member: any) => ({
      ...member,
      joinedAt: new Date(member.joinedAt),
      lastActive: new Date(member.lastActive)
    }));
  }

  static async acceptFamilyInvite(inviteId: string, memberName: string): Promise<boolean> {
    const members = this.loadFamilyMembers();
    const memberIndex = members.findIndex(m => m.id === inviteId);
    
    if (memberIndex >= 0) {
      members[memberIndex].name = memberName;
      members[memberIndex].joinedAt = new Date();
      members[memberIndex].lastActive = new Date();
      
      localStorage.setItem(this.STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(members));
      return true;
    }
    
    return false;
  }

  static async removeFamilyMember(memberId: string): Promise<void> {
    const members = this.loadFamilyMembers();
    const filteredMembers = members.filter(m => m.id !== memberId);
    localStorage.setItem(this.STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(filteredMembers));
  }

  private static getDefaultPermissions(role: FamilyMember['role']) {
    switch (role) {
      case 'owner':
        return {
          canView: true,
          canEdit: true,
          canDelete: true,
          canInvite: true,
          canManageCats: true
        };
      case 'caretaker':
        return {
          canView: true,
          canEdit: true,
          canDelete: false,
          canInvite: false,
          canManageCats: false
        };
      case 'observer':
        return {
          canView: true,
          canEdit: false,
          canDelete: false,
          canInvite: false,
          canManageCats: false
        };
    }
  }

  // Sharing Records
  static async shareEntry(
    entryId: string,
    catId: string,
    sharedBy: string,
    sharedWith: string[],
    shareType: SharedRecord['shareType'],
    message?: string,
    expiresAt?: Date
  ): Promise<string> {
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sharedRecord: SharedRecord = {
      id: shareId,
      entryId,
      catId,
      sharedBy,
      sharedWith,
      shareType,
      permissions: {
        canComment: true,
        canDownload: shareType !== 'public',
        expiresAt
      },
      message,
      createdAt: new Date()
    };

    const records = this.loadSharedRecords();
    records.push(sharedRecord);
    localStorage.setItem(this.STORAGE_KEYS.SHARED_RECORDS, JSON.stringify(records));
    
    return shareId;
  }

  static loadSharedRecords(): SharedRecord[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.SHARED_RECORDS);
    if (!stored) return [];
    
    return JSON.parse(stored).map((record: any) => ({
      ...record,
      createdAt: new Date(record.createdAt),
      permissions: {
        ...record.permissions,
        expiresAt: record.permissions.expiresAt ? new Date(record.permissions.expiresAt) : undefined
      }
    }));
  }

  static getSharedRecordsForUser(userId: string): SharedRecord[] {
    const records = this.loadSharedRecords();
    return records.filter(record => 
      record.sharedWith.includes(userId) &&
      (!record.permissions.expiresAt || record.permissions.expiresAt > new Date())
    );
  }

  // Comments Management
  static async addComment(
    entryId: string,
    authorId: string,
    authorType: Comment['authorType'],
    content: string,
    type: Comment['type'] = 'text',
    replyTo?: string,
    isPrivate: boolean = false
  ): Promise<string> {
    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const comment: Comment = {
      id: commentId,
      entryId,
      authorId,
      authorType,
      content,
      type,
      replyTo,
      isPrivate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const comments = this.loadComments();
    comments.push(comment);
    localStorage.setItem(this.STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    
    return commentId;
  }

  static loadComments(): Comment[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.COMMENTS);
    if (!stored) return [];
    
    return JSON.parse(stored).map((comment: any) => ({
      ...comment,
      createdAt: new Date(comment.createdAt),
      updatedAt: new Date(comment.updatedAt)
    }));
  }

  static getCommentsForEntry(entryId: string): Comment[] {
    const comments = this.loadComments();
    return comments
      .filter(comment => comment.entryId === entryId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  static async updateComment(commentId: string, content: string): Promise<boolean> {
    const comments = this.loadComments();
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex >= 0) {
      comments[commentIndex].content = content;
      comments[commentIndex].updatedAt = new Date();
      localStorage.setItem(this.STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
      return true;
    }
    
    return false;
  }

  static async deleteComment(commentId: string): Promise<boolean> {
    const comments = this.loadComments();
    const filteredComments = comments.filter(c => c.id !== commentId);
    
    if (filteredComments.length < comments.length) {
      localStorage.setItem(this.STORAGE_KEYS.COMMENTS, JSON.stringify(filteredComments));
      return true;
    }
    
    return false;
  }

  // Vet Consultation Management
  static async createConsultation(
    catId: string,
    vetId: string,
    requestedBy: string,
    type: VetConsultation['type'],
    subject: string,
    description: string,
    relatedEntries: string[] = [],
    priority: VetConsultation['priority'] = 'medium'
  ): Promise<string> {
    const consultationId = `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const consultation: VetConsultation = {
      id: consultationId,
      catId,
      vetId,
      requestedBy,
      type,
      status: 'pending',
      subject,
      description,
      relatedEntries,
      priority,
      followUpRequired: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const consultations = this.loadConsultations();
    consultations.push(consultation);
    localStorage.setItem(this.STORAGE_KEYS.CONSULTATIONS, JSON.stringify(consultations));
    
    return consultationId;
  }

  static loadConsultations(): VetConsultation[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.CONSULTATIONS);
    if (!stored) return [];
    
    return JSON.parse(stored).map((consultation: any) => ({
      ...consultation,
      createdAt: new Date(consultation.createdAt),
      updatedAt: new Date(consultation.updatedAt),
      scheduledAt: consultation.scheduledAt ? new Date(consultation.scheduledAt) : undefined,
      completedAt: consultation.completedAt ? new Date(consultation.completedAt) : undefined,
      followUpDate: consultation.followUpDate ? new Date(consultation.followUpDate) : undefined
    }));
  }

  static async updateConsultationStatus(
    consultationId: string,
    status: VetConsultation['status'],
    diagnosis?: string,
    recommendations?: string[]
  ): Promise<boolean> {
    const consultations = this.loadConsultations();
    const consultationIndex = consultations.findIndex(c => c.id === consultationId);
    
    if (consultationIndex >= 0) {
      consultations[consultationIndex].status = status;
      consultations[consultationIndex].updatedAt = new Date();
      
      if (status === 'completed') {
        consultations[consultationIndex].completedAt = new Date();
        if (diagnosis) consultations[consultationIndex].diagnosis = diagnosis;
        if (recommendations) consultations[consultationIndex].recommendations = recommendations;
      }
      
      localStorage.setItem(this.STORAGE_KEYS.CONSULTATIONS, JSON.stringify(consultations));
      return true;
    }
    
    return false;
  }

  static getConsultationsForCat(catId: string): VetConsultation[] {
    const consultations = this.loadConsultations();
    return consultations
      .filter(consultation => consultation.catId === catId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static getConsultationsForVet(vetId: string): VetConsultation[] {
    const consultations = this.loadConsultations();
    return consultations
      .filter(consultation => consultation.vetId === vetId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Social Settings Management
  static saveSocialSettings(settings: SocialSettings): void {
    localStorage.setItem(this.STORAGE_KEYS.SOCIAL_SETTINGS, JSON.stringify(settings));
  }

  static loadSocialSettings(): SocialSettings {
    const stored = localStorage.getItem(this.STORAGE_KEYS.SOCIAL_SETTINGS);
    if (!stored) {
      return this.getDefaultSocialSettings();
    }
    
    return JSON.parse(stored);
  }

  private static getDefaultSocialSettings(): SocialSettings {
    return {
      profileVisibility: 'private',
      allowVetAccess: true,
      allowFamilyInvites: true,
      autoShareHealthAlerts: false,
      vetContactsOnly: true,
      dataRetentionDays: 365,
      notifications: {
        email: true,
        push: true,
        sms: false,
        frequency: 'immediate',
        types: {
          vetComments: true,
          familyComments: true,
          consultationUpdates: true,
          reminderAlerts: true,
          healthAlerts: true
        }
      }
    };
  }

  // Utility Methods
  static generateShareLink(shareId: string): string {
    // In a real implementation, this would generate a proper share link
    return `${window.location.origin}/shared/${shareId}`;
  }

  static async exportEntryForSharing(entry: DiaryEntry): Promise<Blob> {
    const exportData = {
      entry,
      exportedAt: new Date().toISOString(),
      exportedBy: 'Cat Diary App'
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  static validateVetLicense(licenseNumber: string): boolean {
    // Basic validation - in real implementation, would check against official database
    return /^[A-Z]{2}\d{6,10}$/.test(licenseNumber);
  }

  static canUserAccessEntry(
    userId: string,
    userType: 'user' | 'vet' | 'family',
    entryId: string
  ): boolean {
    const sharedRecords = this.loadSharedRecords();
    const relevantShares = sharedRecords.filter(record => 
      record.entryId === entryId &&
      record.sharedWith.includes(userId) &&
      (!record.permissions.expiresAt || record.permissions.expiresAt > new Date())
    );
    
    return relevantShares.length > 0;
  }

  static getNotificationCount(userId: string): number {
    // Count unread comments and consultation updates
    const comments = this.loadComments();
    const consultations = this.loadConsultations();
    
    // This is a simplified version - in a real app, you'd track read status
    const recentComments = comments.filter(comment => 
      comment.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );
    
    const pendingConsultations = consultations.filter(consultation =>
      consultation.requestedBy === userId && consultation.status === 'pending'
    );
    
    return recentComments.length + pendingConsultations.length;
  }

  // Mock data generators for demo purposes
  static generateMockVetProfiles(): VetProfile[] {
    return [
      {
        id: 'vet_1',
        name: '田中 健一',
        clinicName: 'みどり動物病院',
        licenseNumber: 'VT123456',
        specialties: ['内科', '外科', '皮膚科'],
        email: 'tanaka@midori-vet.jp',
        phone: '03-1234-5678',
        address: '東京都渋谷区○○1-2-3',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'vet_2',
        name: '佐藤 美咲',
        clinicName: 'ハート動物クリニック',
        licenseNumber: 'VT789012',
        specialties: ['眼科', '歯科', '予防医学'],
        email: 'sato@heart-clinic.jp',
        phone: '03-9876-5432',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  static initializeMockData(): void {
    if (!localStorage.getItem(this.STORAGE_KEYS.VET_PROFILES)) {
      const mockVets = this.generateMockVetProfiles();
      localStorage.setItem(this.STORAGE_KEYS.VET_PROFILES, JSON.stringify(mockVets));
    }
  }
}