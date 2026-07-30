import { useState, useEffect } from 'react';

export function useInspectionMode() {
  const [inspectionMode, setInspectionMode] = useState(() => localStorage.getItem('inspectionMode') === 'true');
  const [logoClickCount, setLogoClickCount] = useState(0);

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount === 5) {
        const newMode = !inspectionMode;
        setInspectionMode(newMode);
        localStorage.setItem('inspectionMode', String(newMode));
        return 0;
      }
      return newCount;
    });
  };

  useEffect(() => {
    if (logoClickCount > 0) {
      const timer = setTimeout(() => setLogoClickCount(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [logoClickCount]);

  const disableInspectionMode = () => {
    setInspectionMode(false);
    localStorage.setItem('inspectionMode', 'false');
  };

  return { inspectionMode, handleLogoClick, logoClickCount, disableInspectionMode };
}
