import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const supportedLanguages: Language[] = [
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
];

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (languageCode: string) => void;
  supportedLanguages: Language[];
  getCurrentLanguage: () => Language;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language || 'ja');

  useEffect(() => {
    // 初期化時にローカルストレージから言語設定を読み込み
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
      changeLanguage(savedLanguage);
    } else {
      // デフォルト言語を日本語に設定
      changeLanguage('ja');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // i18nextの言語変更を監視
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      localStorage.setItem('i18nextLng', languageCode);
      
      // HTMLのlang属性も更新
      document.documentElement.lang = languageCode;
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const getCurrentLanguage = (): Language => {
    return supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
  };

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    supportedLanguages,
    getCurrentLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;