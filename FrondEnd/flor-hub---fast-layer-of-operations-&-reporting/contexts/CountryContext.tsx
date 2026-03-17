import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

export type CountryOption = 'Argentina' | 'Uruguay' | 'Paraguay';

interface CountryContextValue {
  /** País seleccionado manualmente (solo admins). Null = ALL */
  selectedCountry: CountryOption | null;
  setSelectedCountry: (country: CountryOption | null) => void;
  /** País base asociado al usuario */
  userCountry: CountryOption | null;
  setUserCountry: (country: CountryOption | null) => void;
  /** Estado de privilegio admin */
  isAdminView: boolean;
  setIsAdminView: (value: boolean) => void;
  /** País efectivo que deben usar los servicios */
  effectiveCountry: CountryOption | null;
  /** Lista de países disponibles */
  countryOptions: CountryOption[];
}

const CountryContext = createContext<CountryContextValue | undefined>(undefined);

const COUNTRY_OPTIONS: CountryOption[] = ['Argentina', 'Uruguay', 'Paraguay'];

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [userCountry, setUserCountry] = useState<CountryOption | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    if (!isAdminView) {
      setSelectedCountry(null);
    }
  }, [isAdminView]);

  const effectiveCountry = useMemo<CountryOption | null>(() => {
    return isAdminView ? selectedCountry : userCountry;
  }, [isAdminView, selectedCountry, userCountry]);

  const value: CountryContextValue = {
    selectedCountry,
    setSelectedCountry,
    userCountry,
    setUserCountry,
    isAdminView,
    setIsAdminView,
    effectiveCountry,
    countryOptions: COUNTRY_OPTIONS,
  };

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
};

export const useCountry = (): CountryContextValue => {
  const ctx = useContext(CountryContext);
  if (!ctx) {
    throw new Error('useCountry debe usarse dentro de CountryProvider');
  }
  return ctx;
};
