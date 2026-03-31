import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DictionaryEntry } from '@/data/dictionary';

interface AppContextType {
  favorites: DictionaryEntry[];
  addFavorite: (word: DictionaryEntry) => void;
  removeFavorite: (word: string) => void;
  isFavorite: (word: string) => boolean;
  recentWords: DictionaryEntry[];
  addToRecent: (word: DictionaryEntry) => void;
  quizScore: number;
  incrementScore: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<DictionaryEntry[]>([]);
  const [recentWords, setRecentWords] = useState<DictionaryEntry[]>([]);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const favs = await AsyncStorage.getItem('favorites');
      const recent = await AsyncStorage.getItem('recentWords');
      const score = await AsyncStorage.getItem('quizScore');
      if (favs) setFavorites(JSON.parse(favs));
      if (recent) setRecentWords(JSON.parse(recent));
      if (score) setQuizScore(parseInt(score));
    } catch (e) {}
  }

  const addFavorite = async (word: DictionaryEntry) => {
    const newFavs = [...favorites.filter(f => f.word !== word.word), word];
    setFavorites(newFavs);
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  const removeFavorite = async (word: string) => {
    const newFavs = favorites.filter(f => f.word !== word);
    setFavorites(newFavs);
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  const isFavorite = (word: string) => favorites.some(f => f.word === word);

  const addToRecent = async (word: DictionaryEntry) => {
    const newRecent = [word, ...recentWords.filter(r => r.word !== word.word)].slice(0, 20);
    setRecentWords(newRecent);
    await AsyncStorage.setItem('recentWords', JSON.stringify(newRecent));
  };

  const incrementScore = async () => {
    const newScore = quizScore + 1;
    setQuizScore(newScore);
    await AsyncStorage.setItem('quizScore', newScore.toString());
  };

  return (
    <AppContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, recentWords, addToRecent, quizScore, incrementScore }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
