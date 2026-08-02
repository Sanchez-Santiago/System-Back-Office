import { useState, useEffect } from 'react';
import { AppTab } from '../types';

export type TrackingSubTab = 'AGENDADOS' | 'ENTREGADOS_PORTA' | 'NO_ENTREGADOS_PORTA' | 'NO_ENTREGADOS_LN' | 'PENDIENTE_PIN' | 'RECHAZADOS';

export function useAppTabs() {
  const [activeTab, setActiveTab] = useState<AppTab>(() =>
    (localStorage.getItem('activeTab') as AppTab) || 'GESTIÓN'
  );
  const [trackingSubTab, setTrackingSubTab] = useState<TrackingSubTab>(() =>
    (localStorage.getItem('trackingSubTab') as TrackingSubTab) || 'AGENDADOS'
  );

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('trackingSubTab', trackingSubTab);
  }, [trackingSubTab]);

  return { activeTab, setActiveTab, trackingSubTab, setTrackingSubTab };
}
