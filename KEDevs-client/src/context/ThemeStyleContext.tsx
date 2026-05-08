'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeStyle = 'catppuccin' | 'material';

interface ThemeStyleContextType {
  style: ThemeStyle;
  setStyle: (style: ThemeStyle) => void;
}

const ThemeStyleContext = createContext<ThemeStyleContextType | undefined>(undefined);

export function ThemeStyleProvider({ children }: { children: React.ReactNode }) {
  const [style, setStyle] = useState<ThemeStyle>('catppuccin');

  useEffect(() => {
    const savedStyle = localStorage.getItem('theme-style') as ThemeStyle;
    if (savedStyle) {
      setStyle(savedStyle);
    }
  }, []);

  const handleSetStyle = (newStyle: ThemeStyle) => {
    setStyle(newStyle);
    localStorage.setItem('theme-style', newStyle);
  };

  return (
    <ThemeStyleContext.Provider value={{ style, setStyle: handleSetStyle }}>
      {children}
    </ThemeStyleContext.Provider>
  );
}

export function useThemeStyle() {
  const context = useContext(ThemeStyleContext);
  if (context === undefined) {
    throw new Error('useThemeStyle must be used within a ThemeStyleProvider');
  }
  return context;
}
