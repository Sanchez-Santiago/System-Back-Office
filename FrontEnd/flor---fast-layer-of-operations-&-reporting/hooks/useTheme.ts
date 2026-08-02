import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const [themeStyle, setThemeStyle] = useState<'legacy' | 'modern'>(
    () => (localStorage.getItem('themeStyle') as 'legacy' | 'modern') || 'modern'
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (themeStyle === 'modern') {
      document.documentElement.classList.add('theme-modern');
    } else {
      document.documentElement.classList.remove('theme-modern');
    }
    localStorage.setItem('themeStyle', themeStyle);
  }, [themeStyle]);

  return { isDarkMode, setIsDarkMode, themeStyle, setThemeStyle };
}
