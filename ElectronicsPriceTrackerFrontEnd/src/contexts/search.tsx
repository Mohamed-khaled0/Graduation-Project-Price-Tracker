import React, { createContext, useContext, useState, useEffect } from 'react';

interface SearchContextType {
  currentSearch: string;
  searchHistory: string[];
  setCurrentSearch: (search: string) => void;
  addToHistory: (search: string) => void;
  clearHistory: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const addToHistory = (search: string) => {
    if (search.trim()) {
      setSearchHistory(prev => {
        const filtered = prev.filter(s => s !== search);
        return [search, ...filtered].slice(0, 5); // Keep last 5 searches
      });
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <SearchContext.Provider value={{
      currentSearch,
      searchHistory,
      setCurrentSearch,
      addToHistory,
      clearHistory
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}; 