import React from 'react';
import CatDiary from './components/CatDiary';
import { MultiCatProvider } from './contexts/MultiCatContext';
import './App.css';

function App() {
  return (
    <MultiCatProvider>
      <div className="App">
        <CatDiary />
      </div>
    </MultiCatProvider>
  );
}

export default App;
