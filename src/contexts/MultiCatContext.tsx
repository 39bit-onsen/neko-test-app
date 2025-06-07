import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CatProfile, MultiCatState } from '../types';
import { storageManager } from '../utils/storage';

interface MultiCatContextType {
  cats: CatProfile[];
  activeCat: CatProfile | null;
  activeCatId: string | null;
  settings: MultiCatState['settings'];
  isLoading: boolean;
  error: string | null;
  
  // Cat management
  addCat: (cat: Omit<CatProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCat: (id: string, updates: Partial<CatProfile>) => Promise<void>;
  deleteCat: (id: string) => Promise<void>;
  setActiveCat: (catId: string | null) => void;
  
  // Settings
  updateSettings: (settings: Partial<MultiCatState['settings']>) => void;
  
  // Utilities
  refreshCats: () => Promise<void>;
  getCatById: (id: string) => CatProfile | undefined;
  getActiveCats: () => CatProfile[];
}

const MultiCatContext = createContext<MultiCatContextType | undefined>(undefined);

const STORAGE_KEY = 'multi-cat-state';

export const useMultiCat = () => {
  const context = useContext(MultiCatContext);
  if (context === undefined) {
    throw new Error('useMultiCat must be used within a MultiCatProvider');
  }
  return context;
};

interface MultiCatProviderProps {
  children: ReactNode;
}

export const MultiCatProvider: React.FC<MultiCatProviderProps> = ({ children }) => {
  const [cats, setCats] = useState<CatProfile[]>([]);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [settings, setSettings] = useState<MultiCatState['settings']>({
    showAllCatsInStats: false,
    enableCatComparison: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Load cats from IndexedDB
        const storedCats = await storageManager.getCatProfiles();
        setCats(storedCats);
        
        // Load settings from localStorage
        const storedState = localStorage.getItem(STORAGE_KEY);
        if (storedState) {
          const parsed = JSON.parse(storedState);
          setActiveCatId(parsed.activeCatId);
          setSettings({ ...settings, ...parsed.settings });
        }
        
        // Set default active cat if none selected
        if (!activeCatId && storedCats.length > 0) {
          const defaultCat = storedCats.find(cat => cat.isActive) || storedCats[0];
          setActiveCatId(defaultCat.id);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    const state: MultiCatState = {
      cats: [],
      activeCatId,
      settings
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [activeCatId, settings]);

  const addCat = async (catData: Omit<CatProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date();
      const newCat: CatProfile = {
        ...catData,
        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isActive: true,
        createdAt: now,
        updatedAt: now
      };

      await storageManager.saveCatProfile(newCat);
      setCats(prev => [...prev, newCat]);
      
      // Set as active cat if it's the first one
      if (cats.length === 0) {
        setActiveCatId(newCat.id);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '猫の追加に失敗しました');
      throw err;
    }
  };

  const updateCat = async (id: string, updates: Partial<CatProfile>) => {
    try {
      const existingCat = cats.find(cat => cat.id === id);
      if (!existingCat) {
        throw new Error('Cat not found');
      }

      const updatedCat: CatProfile = {
        ...existingCat,
        ...updates,
        updatedAt: new Date()
      };

      await storageManager.saveCatProfile(updatedCat);
      setCats(prev => prev.map(cat => cat.id === id ? updatedCat : cat));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '猫の更新に失敗しました');
      throw err;
    }
  };

  const deleteCat = async (id: string) => {
    try {
      await storageManager.deleteCatProfile(id);
      setCats(prev => prev.filter(cat => cat.id !== id));
      
      // If deleting active cat, switch to another
      if (activeCatId === id) {
        const remainingCats = cats.filter(cat => cat.id !== id);
        setActiveCatId(remainingCats.length > 0 ? remainingCats[0].id : null);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '猫の削除に失敗しました');
      throw err;
    }
  };

  const setActiveCat = (catId: string | null) => {
    setActiveCatId(catId);
  };

  const updateSettings = (newSettings: Partial<MultiCatState['settings']>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const refreshCats = async () => {
    try {
      const storedCats = await storageManager.getCatProfiles();
      setCats(storedCats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの更新に失敗しました');
      throw err;
    }
  };

  const getCatById = (id: string): CatProfile | undefined => {
    return cats.find(cat => cat.id === id);
  };

  const getActiveCats = (): CatProfile[] => {
    return cats.filter(cat => cat.isActive);
  };

  const activeCat = activeCatId ? getCatById(activeCatId) || null : null;

  const value: MultiCatContextType = {
    cats,
    activeCat,
    activeCatId,
    settings,
    isLoading,
    error,
    addCat,
    updateCat,
    deleteCat,
    setActiveCat,
    updateSettings,
    refreshCats,
    getCatById,
    getActiveCats
  };

  return (
    <MultiCatContext.Provider value={value}>
      {children}
    </MultiCatContext.Provider>
  );
};