const zh = {
  // 常用
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    close: '关闭',
    confirm: '确认',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    yes: '是',
    no: '否',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    refresh: '刷新',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    submit: '提交',
    reset: '重置',
  },

  // 导航
  navigation: {
    dashboard: '仪表板',
    entries: '记录列表',
    analytics: '基础分析',
    advancedAnalytics: 'AI预测分析',
    behaviorAnalysis: '行为分析',
    catComparison: '猫咪对比',
    catProfile: '猫咪档案',
    socialHub: '社交中心',
    vetSharing: '兽医分享',
    familyManager: '家庭管理',
    notifications: '通知中心',
    reminders: '提醒事项',
    reports: '报告生成',
    
    // 分类
    basicFunctions: '基础功能',
    multiCatManagement: '多猫管理',
    advancedAnalysisCategory: '高级分析',
    socialSharing: '社交分享',
    toolsSettings: '工具设置',
    
    // 描述
    dashboardDesc: '健康概览和统计',
    entriesDesc: '日记条目管理',
    analyticsDesc: '统计图表',
    advancedAnalyticsDesc: 'AI健康预测',
    behaviorAnalysisDesc: '详细行为分析',
    catComparisonDesc: '多猫对比分析',
    catProfileDesc: '猫咪基本信息管理',
    socialHubDesc: '集成社交功能',
    vetSharingDesc: '与兽医分享记录',
    familyManagerDesc: '家庭成员邀请管理',
    notificationsDesc: 'PWA通知警报管理',
    remindersDesc: '健康护理提醒',
    reportsDesc: 'PDF和CSV导出',
  },

  // 记录
  entries: {
    newEntry: '新记录',
    editEntry: '编辑记录',
    deleteEntry: '删除记录',
    entryTypes: {
      food: '饮食',
      health: '健康',
      behavior: '行为',
      free: '自由记录',
    },
    
    // 饮食记录
    food: {
      foodType: '食物类型',
      amount: '数量',
      appetite: '食欲',
      feedingTime: '喂食时间',
      appetiteOptions: {
        excellent: '极佳',
        good: '良好',
        normal: '正常',
        poor: '较差',
        none: '无',
      },
    },
    
    // 健康记录
    health: {
      weight: '体重',
      temperature: '体温',
      symptoms: '症状',
      medication: '用药',
      vetVisit: '兽医检查',
      notes: '备注',
    },
    
    // 行为记录
    behavior: {
      activityLevel: '活动水平',
      sleepHours: '睡眠时间',
      playTime: '游戏时间',
      specialBehaviors: '特殊行为',
      location: '地点',
      mood: '情绪',
      activityOptions: {
        veryActive: '非常活跃',
        active: '活跃',
        normal: '正常',
        calm: '平静',
        lethargic: '嗜睡',
      },
    },
    
    // 自由记录
    free: {
      title: '标题',
      content: '内容',
      tags: '标签',
    },
  },

  // 分析
  analytics: {
    title: '分析统计',
    summary: '摘要',
    charts: '图表',
    trends: '趋势',
    insights: '洞察',
    
    // AI分析
    aiAnalytics: 'AI分析',
    healthPrediction: '健康预测',
    behaviorPrediction: '行为预测',
    weightPrediction: '体重预测',
    weatherImpact: '天气影响',
    
    // 统计项目
    totalEntries: '总记录数',
    weeklyAverage: '周平均',
    period: '时期',
    riskLevel: '风险等级',
    confidence: '置信度',
    recommendations: '建议',
    
    // 风险等级
    riskLevels: {
      low: '低风险',
      medium: '中风险',
      high: '高风险',
      critical: '紧急',
    },
    
    // 时间周期
    periods: {
      oneWeek: '1周',
      oneMonth: '1个月',
      threeMonths: '3个月',
      all: '全部',
    },
  },

  // 社交功能
  social: {
    // 社交中心
    hub: {
      title: '社交功能',
      description: '与兽医和家人合作，共同管理您爱猫的健康',
      overview: '概览',
      recentActivity: '最近活动',
      quickActions: '快速操作',
    },
    
    // 兽医分享
    vet: {
      title: '兽医分享',
      shareRecord: '分享记录',
      createConsultation: '创建咨询',
      shareWithVet: '与兽医分享',
      consultationTypes: {
        urgent: '紧急咨询',
        routine: '常规咨询',
        followUp: '跟进',
      },
      priority: {
        low: '低',
        medium: '中',
        high: '高',
        urgent: '紧急',
      },
    },
    
    // 家庭管理
    family: {
      title: '家庭成员管理',
      description: '与家人朋友分享猫咪记录，共同照顾',
      inviteMember: '邀请成员',
      roles: {
        owner: '主人',
        caretaker: '照护者',
        observer: '观察者',
      },
      permissions: {
        view: '查看',
        edit: '编辑',
        delete: '删除',
        invite: '邀请',
        manage: '管理猫咪',
      },
    },
  },

  // 设置
  settings: {
    language: '语言',
    theme: '主题',
    notifications: '通知',
    privacy: '隐私',
    backup: '备份',
    
    // 语言选项
    languages: {
      ja: '日本語',
      en: 'English',
      zh: '中文',
      ko: '한국어',
      af: 'Afrikaans',
    },
  },

  // 消息
  messages: {
    // 成功消息
    success: {
      entrySaved: '记录保存成功',
      entryDeleted: '记录删除成功',
      settingsSaved: '设置保存成功',
      memberInvited: '成员邀请成功',
      recordShared: '记录分享成功',
    },
    
    // 错误消息
    error: {
      saveFailed: '保存失败',
      loadFailed: '加载失败',
      deleteFailed: '删除失败',
      networkError: '网络错误',
      invalidData: '无效数据',
    },
    
    // 确认消息
    confirm: {
      deleteEntry: '删除此记录？',
      deleteMember: '移除此成员？',
      discardChanges: '放弃更改？',
    },
  },

  // 表单
  forms: {
    required: '此字段为必填项',
    invalid: '无效值',
    tooShort: '太短',
    tooLong: '太长',
    emailInvalid: '无效的邮箱地址',
    
    placeholders: {
      enterText: '输入文本',
      selectOption: '选择选项',
      enterEmail: '输入邮箱地址',
      enterMessage: '输入消息',
    },
  },
};

export default zh;