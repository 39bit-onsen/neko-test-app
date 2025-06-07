const ko = {
  // 공통
  common: {
    save: '저장',
    cancel: '취소',
    delete: '삭제',
    edit: '편집',
    add: '추가',
    close: '닫기',
    confirm: '확인',
    loading: '로딩 중...',
    success: '성공',
    error: '오류',
    yes: '예',
    no: '아니요',
    search: '검색',
    filter: '필터',
    sort: '정렬',
    refresh: '새로고침',
    back: '뒤로',
    next: '다음',
    previous: '이전',
    submit: '제출',
    reset: '초기화',
  },

  // 내비게이션
  navigation: {
    dashboard: '대시보드',
    entries: '기록 목록',
    analytics: '기본 분석',
    advancedAnalytics: 'AI 예측 분석',
    behaviorAnalysis: '행동 분석',
    catComparison: '고양이 비교',
    catProfile: '고양이 프로필',
    socialHub: '소셜 허브',
    vetSharing: '수의사 공유',
    familyManager: '가족 관리',
    notifications: '알림 센터',
    reminders: '리마인더',
    reports: '보고서 생성',
    
    // 카테고리
    basicFunctions: '기본 기능',
    multiCatManagement: '다중 고양이 관리',
    advancedAnalysisCategory: '고급 분석',
    socialSharing: '소셜 공유',
    toolsSettings: '도구 및 설정',
    
    // 설명
    dashboardDesc: '건강 개요 및 통계',
    entriesDesc: '일기 엔트리 관리',
    analyticsDesc: '통계 및 차트',
    advancedAnalyticsDesc: 'AI 건강 예측',
    behaviorAnalysisDesc: '상세 행동 분석',
    catComparisonDesc: '다중 고양이 비교 분석',
    catProfileDesc: '고양이 기본 정보 관리',
    socialHubDesc: '통합 소셜 기능',
    vetSharingDesc: '수의사와 기록 공유',
    familyManagerDesc: '가족 구성원 초대 및 관리',
    notificationsDesc: 'PWA 알림 및 경고 관리',
    remindersDesc: '건강 관리 리마인더',
    reportsDesc: 'PDF 및 CSV 내보내기',
  },

  // 엔트리
  entries: {
    newEntry: '새 기록',
    editEntry: '기록 편집',
    deleteEntry: '기록 삭제',
    entryTypes: {
      food: '음식',
      health: '건강',
      behavior: '행동',
      free: '자유 기록',
    },
    
    // 음식 기록
    food: {
      foodType: '음식 유형',
      amount: '양',
      appetite: '식욕',
      feedingTime: '급식 시간',
      appetiteOptions: {
        excellent: '매우 좋음',
        good: '좋음',
        normal: '보통',
        poor: '나쁨',
        none: '없음',
      },
    },
    
    // 건강 기록
    health: {
      weight: '체중',
      temperature: '체온',
      symptoms: '증상',
      medication: '투약',
      vetVisit: '수의사 방문',
      notes: '메모',
    },
    
    // 행동 기록
    behavior: {
      activityLevel: '활동 수준',
      sleepHours: '수면 시간',
      playTime: '놀이 시간',
      specialBehaviors: '특별한 행동',
      location: '위치',
      mood: '기분',
      activityOptions: {
        veryActive: '매우 활발',
        active: '활발',
        normal: '보통',
        calm: '차분',
        lethargic: '무기력',
      },
    },
    
    // 자유 기록
    free: {
      title: '제목',
      content: '내용',
      tags: '태그',
    },
  },

  // 분석
  analytics: {
    title: '통계 분석',
    summary: '요약',
    charts: '차트',
    trends: '트렌드',
    insights: '인사이트',
    
    // AI 분석
    aiAnalytics: 'AI 분석',
    healthPrediction: '건강 예측',
    behaviorPrediction: '행동 예측',
    weightPrediction: '체중 예측',
    weatherImpact: '날씨 영향',
    
    // 통계 항목
    totalEntries: '총 기록 수',
    weeklyAverage: '주 평균',
    period: '기간',
    riskLevel: '위험 수준',
    confidence: '신뢰도',
    recommendations: '권장사항',
    
    // 위험 수준
    riskLevels: {
      low: '낮은 위험',
      medium: '중간 위험',
      high: '높은 위험',
      critical: '긴급',
    },
    
    // 시간 기간
    periods: {
      oneWeek: '1주',
      oneMonth: '1개월',
      threeMonths: '3개월',
      all: '전체',
    },
  },

  // 소셜 기능
  social: {
    // 소셜 허브
    hub: {
      title: '소셜 기능',
      description: '수의사 및 가족과 협력하여 사랑하는 고양이의 건강 관리를 공유하세요',
      overview: '개요',
      recentActivity: '최근 활동',
      quickActions: '빠른 작업',
    },
    
    // 수의사 공유
    vet: {
      title: '수의사 공유',
      shareRecord: '기록 공유',
      createConsultation: '상담 생성',
      shareWithVet: '수의사와 공유',
      consultationTypes: {
        urgent: '긴급 상담',
        routine: '정기 상담',
        followUp: '후속 조치',
      },
      priority: {
        low: '낮음',
        medium: '중간',
        high: '높음',
        urgent: '긴급',
      },
    },
    
    // 가족 관리
    family: {
      title: '가족 구성원 관리',
      description: '가족 및 친구와 고양이 기록을 공유하여 함께 돌볼 수 있습니다',
      inviteMember: '구성원 초대',
      roles: {
        owner: '소유자',
        caretaker: '돌봄이',
        observer: '관찰자',
      },
      permissions: {
        view: '보기',
        edit: '편집',
        delete: '삭제',
        invite: '초대',
        manage: '고양이 관리',
      },
    },
  },

  // 설정
  settings: {
    language: '언어',
    theme: '테마',
    notifications: '알림',
    privacy: '개인정보',
    backup: '백업',
    
    // 언어 옵션
    languages: {
      ja: '日本語',
      en: 'English',
      zh: '中文',
      ko: '한국어',
      af: 'Afrikaans',
    },
  },

  // 메시지
  messages: {
    // 성공 메시지
    success: {
      entrySaved: '기록이 저장되었습니다',
      entryDeleted: '기록이 삭제되었습니다',
      settingsSaved: '설정이 저장되었습니다',
      memberInvited: '구성원이 초대되었습니다',
      recordShared: '기록이 공유되었습니다',
    },
    
    // 오류 메시지
    error: {
      saveFailed: '저장에 실패했습니다',
      loadFailed: '로드에 실패했습니다',
      deleteFailed: '삭제에 실패했습니다',
      networkError: '네트워크 오류가 발생했습니다',
      invalidData: '잘못된 데이터입니다',
    },
    
    // 확인 메시지
    confirm: {
      deleteEntry: '이 기록을 삭제하시겠습니까?',
      deleteMember: '이 구성원을 제거하시겠습니까?',
      discardChanges: '변경사항을 취소하시겠습니까?',
    },
  },

  // 폼
  forms: {
    required: '필수 입력 항목입니다',
    invalid: '잘못된 값입니다',
    tooShort: '너무 짧습니다',
    tooLong: '너무 깁니다',
    emailInvalid: '잘못된 이메일 주소입니다',
    
    placeholders: {
      enterText: '텍스트를 입력하세요',
      selectOption: '옵션을 선택하세요',
      enterEmail: '이메일 주소를 입력하세요',
      enterMessage: '메시지를 입력하세요',
    },
  },
};

export default ko;