import { useState, useEffect } from 'react';

export type ThemeStyle = 'legacy' | 'modern';

export function useAppTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => 
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const [themeStyle, setThemeStyle] = useState<ThemeStyle>(
    () => (localStorage.getItem('themeStyle') as ThemeStyle) || 'modern'
  );

  // Sync de Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Sync de Theme Style (Moderno vs Legado)
  useEffect(() => {
    if (themeStyle === 'modern') {
      document.documentElement.classList.add('theme-modern');
    } else {
      document.documentElement.classList.remove('theme-modern');
    }
    localStorage.setItem('themeStyle', themeStyle);
  }, [themeStyle]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  
  const toggleThemeStyle = () => {
    setThemeStyle(prev => prev === 'modern' ? 'legacy' : 'modern');
  };

  return {
    isDarkMode,
    setIsDarkMode,
    themeStyle,
    setThemeStyle,
    toggleDarkMode,
    toggleThemeStyle
  };
}
