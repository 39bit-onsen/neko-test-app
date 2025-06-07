import React from 'react';
import CatDiary from './components/CatDiary';
import { MultiCatProvider } from './contexts/MultiCatContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './utils/i18n'; // i18n設定を初期化
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <MultiCatProvider>
        <div className="App">
          <CatDiary />
        </div>
      </MultiCatProvider>
    </LanguageProvider>
  );
}

export default App;
