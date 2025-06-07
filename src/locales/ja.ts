const ja = {
  // 共通
  common: {
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    add: '追加',
    close: '閉じる',
    confirm: '確認',
    loading: '読み込み中...',
    success: '成功',
    error: 'エラー',
    yes: 'はい',
    no: 'いいえ',
    search: '検索',
    filter: 'フィルター',
    sort: 'ソート',
    refresh: '更新',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    submit: '送信',
    reset: 'リセット',
  },

  // ナビゲーション
  navigation: {
    dashboard: 'ダッシュボード',
    entries: '記録一覧',
    analytics: '基本分析',
    advancedAnalytics: 'AI予測分析',
    behaviorAnalysis: '行動分析',
    catComparison: '猫間比較',
    catProfile: '猫プロファイル',
    socialHub: 'ソーシャルハブ',
    vetSharing: '獣医師連携',
    familyManager: '家族管理',
    notifications: '通知センター',
    reminders: 'リマインダー',
    reports: 'レポート生成',
    
    // カテゴリ
    basicFunctions: '基本機能',
    multiCatManagement: '多頭飼い管理',
    advancedAnalysisCategory: '高度分析',
    socialSharing: 'ソーシャル・共有',
    toolsSettings: 'ツール・設定',
    
    // 説明
    dashboardDesc: 'ヘルス概要・統計表示',
    entriesDesc: '日記エントリーの管理',
    analyticsDesc: '統計・グラフ表示',
    advancedAnalyticsDesc: 'AI による健康予測',
    behaviorAnalysisDesc: '行動パターン詳細分析',
    catComparisonDesc: '複数猫の比較分析',
    catProfileDesc: '猫の基本情報管理',
    socialHubDesc: '統合ソーシャル機能',
    vetSharingDesc: '獣医師との記録共有',
    familyManagerDesc: '家族メンバー招待・管理',
    notificationsDesc: 'PWA通知・アラート管理',
    remindersDesc: '健康管理リマインダー',
    reportsDesc: 'PDF・CSV出力',
  },

  // エントリー
  entries: {
    newEntry: '新しい記録',
    editEntry: '記録を編集',
    deleteEntry: '記録を削除',
    entryTypes: {
      food: '食事',
      health: '健康',
      behavior: '行動',
      free: '自由記録',
    },
    
    // 食事記録
    food: {
      foodType: '食事の種類',
      amount: '量',
      appetite: '食欲',
      feedingTime: '食事時間',
      appetiteOptions: {
        excellent: '非常に良い',
        good: '良い',
        normal: '普通',
        poor: '悪い',
        none: 'なし',
      },
    },
    
    // 健康記録
    health: {
      weight: '体重',
      temperature: '体温',
      symptoms: '症状',
      medication: '投薬',
      vetVisit: '獣医師診察',
      notes: 'メモ',
    },
    
    // 行動記録
    behavior: {
      activityLevel: '活動レベル',
      sleepHours: '睡眠時間',
      playTime: '遊び時間',
      specialBehaviors: '特別な行動',
      location: '場所',
      mood: '機嫌',
      activityOptions: {
        veryActive: '非常に活発',
        active: '活発',
        normal: '普通',
        calm: '落ち着いている',
        lethargic: '無気力',
      },
    },
    
    // 自由記録
    free: {
      title: 'タイトル',
      content: '内容',
      tags: 'タグ',
    },
  },

  // 統計・分析
  analytics: {
    title: '統計・分析',
    summary: 'サマリー',
    charts: 'グラフ',
    trends: 'トレンド',
    insights: 'インサイト',
    
    // AI分析
    aiAnalytics: 'AI分析',
    healthPrediction: '健康予測',
    behaviorPrediction: '行動予測',
    weightPrediction: '体重予測',
    weatherImpact: '天候影響分析',
    
    // 統計項目
    totalEntries: '総記録数',
    weeklyAverage: '週平均',
    period: '期間',
    riskLevel: 'リスク レベル',
    confidence: '確率',
    recommendations: '推奨事項',
    
    // リスクレベル
    riskLevels: {
      low: '低リスク',
      medium: '中リスク',
      high: '高リスク',
      critical: '緊急',
    },
    
    // 期間選択
    periods: {
      oneWeek: '1週間',
      oneMonth: '1ヶ月',
      threeMonths: '3ヶ月',
      all: 'すべて',
    },
  },

  // ソーシャル機能
  social: {
    // ソーシャルハブ
    hub: {
      title: 'ソーシャル機能',
      description: '獣医師や家族と連携して、愛猫の健康管理を共有しましょう',
      overview: '概要',
      recentActivity: '最近の共有活動',
      quickActions: 'クイックアクション',
    },
    
    // 獣医師連携
    vet: {
      title: '獣医師連携',
      shareRecord: '記録共有',
      createConsultation: '相談作成',
      shareWithVet: '獣医師と共有',
      consultationTypes: {
        urgent: '緊急相談',
        routine: '定期相談',
        followUp: 'フォローアップ',
      },
      priority: {
        low: '低',
        medium: '中',
        high: '高',
        urgent: '緊急',
      },
    },
    
    // 家族管理
    family: {
      title: '家族メンバー管理',
      description: '家族や友人と猫の記録を共有し、一緒にケアできます',
      inviteMember: 'メンバーを招待',
      roles: {
        owner: 'オーナー',
        caretaker: 'ケアテイカー',
        observer: '観察者',
      },
      permissions: {
        view: '閲覧',
        edit: '編集',
        delete: '削除',
        invite: '招待',
        manage: '猫管理',
      },
    },
  },

  // 設定
  settings: {
    language: '言語',
    theme: 'テーマ',
    notifications: '通知',
    privacy: 'プライバシー',
    backup: 'バックアップ',
    
    // 言語選択
    languages: {
      ja: '日本語',
      en: 'English',
      zh: '中文',
      ko: '한국어',
      af: 'Afrikaans',
    },
  },

  // メッセージ
  messages: {
    // 成功メッセージ
    success: {
      entrySaved: '記録を保存しました',
      entryDeleted: '記録を削除しました',
      settingsSaved: '設定を保存しました',
      memberInvited: 'メンバーを招待しました',
      recordShared: '記録を共有しました',
    },
    
    // エラーメッセージ
    error: {
      saveFailed: '保存に失敗しました',
      loadFailed: '読み込みに失敗しました',
      deleteFailed: '削除に失敗しました',
      networkError: 'ネットワークエラーが発生しました',
      invalidData: '無効なデータです',
    },
    
    // 確認メッセージ
    confirm: {
      deleteEntry: 'この記録を削除しますか？',
      deleteMember: 'このメンバーを削除しますか？',
      discardChanges: '変更を破棄しますか？',
    },
  },

  // フォーム
  forms: {
    required: '必須項目です',
    invalid: '無効な値です',
    tooShort: '短すぎます',
    tooLong: '長すぎます',
    emailInvalid: '無効なメールアドレスです',
    
    placeholders: {
      enterText: 'テキストを入力してください',
      selectOption: 'オプションを選択してください',
      enterEmail: 'メールアドレスを入力してください',
      enterMessage: 'メッセージを入力してください',
    },
  },
};

export default ja;