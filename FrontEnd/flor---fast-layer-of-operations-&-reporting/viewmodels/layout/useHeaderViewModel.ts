import { useState, useEffect, useCallback } from 'react';
import { mensajesService } from '../../services/mensajes';

export function useHeaderViewModel() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPermissionsTooltip, setShowPermissionsTooltip] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    mensajesService.getNoLeidos()
      .then(res => { if (res.success) setUnreadCount(res.count); })
      .catch(() => {});
  }, []);

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(prev => !prev);
    setShowProfileMenu(false);
  };

  const toggleProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileMenu(prev => !prev);
    setShowNotifications(false);
  };

  const closeMenus = () => {
    setShowNotifications(false);
    setShowProfileMenu(false);
  };

  const state = {
    showNotifications, showProfileMenu, showPermissionsTooltip,
    showCountryDropdown, unreadCount,
  };

  const actions = {
    setShowPermissionsTooltip, setShowCountryDropdown, setShowNotifications, setShowProfileMenu,
    toggleNotifications, toggleProfile, closeMenus, handleUnreadCountChange,
  };

  return { state, actions };
}
