const af = {
  // Algemeen
  common: {
    save: 'Stoor',
    cancel: 'Kanselleer',
    delete: 'Verwyder',
    edit: 'Wysig',
    add: 'Voeg by',
    close: 'Sluit',
    confirm: 'Bevestig',
    loading: 'Laai...',
    success: 'Sukses',
    error: 'Fout',
    yes: 'Ja',
    no: 'Nee',
    search: 'Soek',
    filter: 'Filter',
    sort: 'Sorteer',
    refresh: 'Verfris',
    back: 'Terug',
    next: 'Volgende',
    previous: 'Vorige',
    submit: 'Dien in',
    reset: 'Herstel',
  },

  // Navigasie
  navigation: {
    dashboard: 'Paneelbord',
    entries: 'Rekords',
    analytics: 'Analitiek',
    advancedAnalytics: 'KI Voorspelling',
    behaviorAnalysis: 'Gedragsanalise',
    catComparison: 'Kat Vergelyking',
    catProfile: 'Kat Profiel',
    socialHub: 'Sosiale Hub',
    vetSharing: 'Veearts Deel',
    familyManager: 'Gesinsbeheer',
    notifications: 'Kennisgewings',
    reminders: 'Herinneringe',
    reports: 'Verslae',
    
    // Kategorieë
    basicFunctions: 'Basiese Funksies',
    multiCatManagement: 'Multi-Kat Bestuur',
    advancedAnalysisCategory: 'Gevorderde Analise',
    socialSharing: 'Sosiale Deel',
    toolsSettings: 'Gereedskap & Instellings',
    
    // Beskrywings
    dashboardDesc: 'Gesondheidsoorsia & statistieke',
    entriesDesc: 'Dagboekinskrywing bestuur',
    analyticsDesc: 'Statistieke & grafieke',
    advancedAnalyticsDesc: 'KI gesondheidsvoorspellings',
    behaviorAnalysisDesc: 'Gedetailleerde gedragsanalise',
    catComparisonDesc: 'Multi-kat vergelyking',
    catProfileDesc: 'Kat profiel bestuur',
    socialHubDesc: 'Geïntegreerde sosiale kenmerke',
    vetSharingDesc: 'Deel rekords met veeartse',
    familyManagerDesc: 'Gesinslid bestuur',
    notificationsDesc: 'PWA kennisgewings & waarskuwings',
    remindersDesc: 'Gesondheidsorg herinneringe',
    reportsDesc: 'PDF & CSV uitvoer',
  },

  // Inskrywings
  entries: {
    newEntry: 'Nuwe Rekord',
    editEntry: 'Wysig Rekord',
    deleteEntry: 'Verwyder Rekord',
    entryTypes: {
      food: 'Kos',
      health: 'Gesondheid',
      behavior: 'Gedrag',
      free: 'Vrye Nota',
    },
    
    // Kos rekords
    food: {
      foodType: 'Kos Tipe',
      amount: 'Hoeveelheid',
      appetite: 'Aptyt',
      feedingTime: 'Voertyd',
      appetiteOptions: {
        excellent: 'Uitstekend',
        good: 'Goed',
        normal: 'Normaal',
        poor: 'Swak',
        none: 'Geen',
      },
    },
    
    // Gesondheidsrekords
    health: {
      weight: 'Gewig',
      temperature: 'Temperatuur',
      symptoms: 'Simptome',
      medication: 'Medikasie',
      vetVisit: 'Veearts Besoek',
      notes: 'Notas',
    },
    
    // Gedragsrekords
    behavior: {
      activityLevel: 'Aktiwiteit Vlak',
      sleepHours: 'Slaap Ure',
      playTime: 'Speeltyd',
      specialBehaviors: 'Spesiale Gedrag',
      location: 'Ligging',
      mood: 'Stemming',
      activityOptions: {
        veryActive: 'Baie Aktief',
        active: 'Aktief',
        normal: 'Normaal',
        calm: 'Kalm',
        lethargic: 'Lethargies',
      },
    },
    
    // Vrye rekords
    free: {
      title: 'Titel',
      content: 'Inhoud',
      tags: 'Etikette',
    },
  },

  // Analitiek
  analytics: {
    title: 'Analitiek',
    summary: 'Opsomming',
    charts: 'Grafieke',
    trends: 'Tendense',
    insights: 'Insigte',
    
    // KI Analitiek
    aiAnalytics: 'KI Analitiek',
    healthPrediction: 'Gesondheidsvoorspelling',
    behaviorPrediction: 'Gedragsvoorspelling',
    weightPrediction: 'Gewigvoorspelling',
    weatherImpact: 'Weer Impak',
    
    // Statistieke
    totalEntries: 'Totale Rekords',
    weeklyAverage: 'Weeklikse Gemiddeld',
    period: 'Periode',
    riskLevel: 'Risiko Vlak',
    confidence: 'Vertroue',
    recommendations: 'Aanbevelings',
    
    // Risiko vlakke
    riskLevels: {
      low: 'Lae Risiko',
      medium: 'Medium Risiko',
      high: 'Hoë Risiko',
      critical: 'Kritiek',
    },
    
    // Tydperke
    periods: {
      oneWeek: '1 Week',
      oneMonth: '1 Maand',
      threeMonths: '3 Maande',
      all: 'Alles',
    },
  },

  // Sosiale kenmerke
  social: {
    // Sosiale hub
    hub: {
      title: 'Sosiale Kenmerke',
      description: 'Verbind met veeartse en gesin om jou kat se gesondheidsbestuur te deel',
      overview: 'Oorsig',
      recentActivity: 'Onlangse Aktiwiteit',
      quickActions: 'Vinnige Aksies',
    },
    
    // Veearts deel
    vet: {
      title: 'Veearts Deel',
      shareRecord: 'Deel Rekord',
      createConsultation: 'Skep Konsultasie',
      shareWithVet: 'Deel met Veearts',
      consultationTypes: {
        urgent: 'Dringend',
        routine: 'Roetine',
        followUp: 'Opvolg',
      },
      priority: {
        low: 'Laag',
        medium: 'Medium',
        high: 'Hoog',
        urgent: 'Dringend',
      },
    },
    
    // Gesinsbeheer
    family: {
      title: 'Gesinslid Bestuur',
      description: 'Deel kat rekords met gesin en vriende vir samewerkende sorg',
      inviteMember: 'Nooi Lid',
      roles: {
        owner: 'Eienaar',
        caretaker: 'Versorger',
        observer: 'Waarnemer',
      },
      permissions: {
        view: 'Bekyk',
        edit: 'Wysig',
        delete: 'Verwyder',
        invite: 'Nooi',
        manage: 'Bestuur Katte',
      },
    },
  },

  // Instellings
  settings: {
    language: 'Taal',
    theme: 'Tema',
    notifications: 'Kennisgewings',
    privacy: 'Privaatheid',
    backup: 'Rugsteun',
    
    // Taal opsies
    languages: {
      ja: '日本語',
      en: 'English',
      zh: '中文',
      ko: '한국어',
      af: 'Afrikaans',
    },
  },

  // Boodskappe
  messages: {
    // Sukses boodskappe
    success: {
      entrySaved: 'Rekord suksesvol gestoor',
      entryDeleted: 'Rekord suksesvol verwyder',
      settingsSaved: 'Instellings suksesvol gestoor',
      memberInvited: 'Lid suksesvol genooi',
      recordShared: 'Rekord suksesvol gedeel',
    },
    
    // Fout boodskappe
    error: {
      saveFailed: 'Kon nie stoor nie',
      loadFailed: 'Kon nie laai nie',
      deleteFailed: 'Kon nie verwyder nie',
      networkError: 'Netwerk fout',
      invalidData: 'Ongeldige data',
    },
    
    // Bevestiging boodskappe
    confirm: {
      deleteEntry: 'Verwyder hierdie rekord?',
      deleteMember: 'Verwyder hierdie lid?',
      discardChanges: 'Gooi veranderinge weg?',
    },
  },

  // Vorms
  forms: {
    required: 'Hierdie veld is vereis',
    invalid: 'Ongeldige waarde',
    tooShort: 'Te kort',
    tooLong: 'Te lank',
    emailInvalid: 'Ongeldige e-pos adres',
    
    placeholders: {
      enterText: 'Voer teks in',
      selectOption: 'Kies \'n opsie',
      enterEmail: 'Voer e-pos adres in',
      enterMessage: 'Voer boodskap in',
    },
  },
};

export default af;