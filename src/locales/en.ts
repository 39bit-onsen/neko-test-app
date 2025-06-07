const en = {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    confirm: 'Confirm',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    yes: 'Yes',
    no: 'No',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    reset: 'Reset',
  },

  // Navigation
  navigation: {
    dashboard: 'Dashboard',
    entries: 'Records',
    analytics: 'Analytics',
    advancedAnalytics: 'AI Prediction',
    behaviorAnalysis: 'Behavior Analysis',
    catComparison: 'Cat Comparison',
    catProfile: 'Cat Profile',
    socialHub: 'Social Hub',
    vetSharing: 'Vet Sharing',
    familyManager: 'Family Manager',
    notifications: 'Notifications',
    reminders: 'Reminders',
    reports: 'Reports',
    
    // Categories
    basicFunctions: 'Basic Functions',
    multiCatManagement: 'Multi-Cat Management',
    advancedAnalysisCategory: 'Advanced Analysis',
    socialSharing: 'Social & Sharing',
    toolsSettings: 'Tools & Settings',
    
    // Descriptions
    dashboardDesc: 'Health overview & statistics',
    entriesDesc: 'Diary entry management',
    analyticsDesc: 'Statistics & charts',
    advancedAnalyticsDesc: 'AI health predictions',
    behaviorAnalysisDesc: 'Detailed behavior analysis',
    catComparisonDesc: 'Multi-cat comparison',
    catProfileDesc: 'Cat profile management',
    socialHubDesc: 'Integrated social features',
    vetSharingDesc: 'Share records with veterinarians',
    familyManagerDesc: 'Family member management',
    notificationsDesc: 'PWA notifications & alerts',
    remindersDesc: 'Health care reminders',
    reportsDesc: 'PDF & CSV export',
  },

  // Entries
  entries: {
    newEntry: 'New Record',
    editEntry: 'Edit Record',
    deleteEntry: 'Delete Record',
    entryTypes: {
      food: 'Food',
      health: 'Health',
      behavior: 'Behavior',
      free: 'Free Note',
    },
    
    // Food records
    food: {
      foodType: 'Food Type',
      amount: 'Amount',
      appetite: 'Appetite',
      feedingTime: 'Feeding Time',
      appetiteOptions: {
        excellent: 'Excellent',
        good: 'Good',
        normal: 'Normal',
        poor: 'Poor',
        none: 'None',
      },
    },
    
    // Health records
    health: {
      weight: 'Weight',
      temperature: 'Temperature',
      symptoms: 'Symptoms',
      medication: 'Medication',
      vetVisit: 'Vet Visit',
      notes: 'Notes',
    },
    
    // Behavior records
    behavior: {
      activityLevel: 'Activity Level',
      sleepHours: 'Sleep Hours',
      playTime: 'Play Time',
      specialBehaviors: 'Special Behaviors',
      location: 'Location',
      mood: 'Mood',
      activityOptions: {
        veryActive: 'Very Active',
        active: 'Active',
        normal: 'Normal',
        calm: 'Calm',
        lethargic: 'Lethargic',
      },
    },
    
    // Free records
    free: {
      title: 'Title',
      content: 'Content',
      tags: 'Tags',
    },
  },

  // Analytics
  analytics: {
    title: 'Analytics',
    summary: 'Summary',
    charts: 'Charts',
    trends: 'Trends',
    insights: 'Insights',
    
    // AI Analytics
    aiAnalytics: 'AI Analytics',
    healthPrediction: 'Health Prediction',
    behaviorPrediction: 'Behavior Prediction',
    weightPrediction: 'Weight Prediction',
    weatherImpact: 'Weather Impact',
    
    // Statistics
    totalEntries: 'Total Records',
    weeklyAverage: 'Weekly Average',
    period: 'Period',
    riskLevel: 'Risk Level',
    confidence: 'Confidence',
    recommendations: 'Recommendations',
    
    // Risk levels
    riskLevels: {
      low: 'Low Risk',
      medium: 'Medium Risk',
      high: 'High Risk',
      critical: 'Critical',
    },
    
    // Time periods
    periods: {
      oneWeek: '1 Week',
      oneMonth: '1 Month',
      threeMonths: '3 Months',
      all: 'All',
    },
  },

  // Social features
  social: {
    // Social hub
    hub: {
      title: 'Social Features',
      description: 'Connect with veterinarians and family to share your cat\'s health management',
      overview: 'Overview',
      recentActivity: 'Recent Activity',
      quickActions: 'Quick Actions',
    },
    
    // Veterinarian sharing
    vet: {
      title: 'Veterinarian Sharing',
      shareRecord: 'Share Record',
      createConsultation: 'Create Consultation',
      shareWithVet: 'Share with Vet',
      consultationTypes: {
        urgent: 'Urgent',
        routine: 'Routine',
        followUp: 'Follow-up',
      },
      priority: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent',
      },
    },
    
    // Family management
    family: {
      title: 'Family Member Management',
      description: 'Share cat records with family and friends for collaborative care',
      inviteMember: 'Invite Member',
      roles: {
        owner: 'Owner',
        caretaker: 'Caretaker',
        observer: 'Observer',
      },
      permissions: {
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        invite: 'Invite',
        manage: 'Manage Cats',
      },
    },
  },

  // Settings
  settings: {
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    privacy: 'Privacy',
    backup: 'Backup',
    
    // Language options
    languages: {
      ja: '日本語',
      en: 'English',
      zh: '中文',
      ko: '한국어',
      af: 'Afrikaans',
    },
  },

  // Messages
  messages: {
    // Success messages
    success: {
      entrySaved: 'Record saved successfully',
      entryDeleted: 'Record deleted successfully',
      settingsSaved: 'Settings saved successfully',
      memberInvited: 'Member invited successfully',
      recordShared: 'Record shared successfully',
    },
    
    // Error messages
    error: {
      saveFailed: 'Failed to save',
      loadFailed: 'Failed to load',
      deleteFailed: 'Failed to delete',
      networkError: 'Network error occurred',
      invalidData: 'Invalid data',
    },
    
    // Confirmation messages
    confirm: {
      deleteEntry: 'Delete this record?',
      deleteMember: 'Remove this member?',
      discardChanges: 'Discard changes?',
    },
  },

  // Forms
  forms: {
    required: 'This field is required',
    invalid: 'Invalid value',
    tooShort: 'Too short',
    tooLong: 'Too long',
    emailInvalid: 'Invalid email address',
    
    placeholders: {
      enterText: 'Enter text',
      selectOption: 'Select an option',
      enterEmail: 'Enter email address',
      enterMessage: 'Enter message',
    },
  },
};

export default en;