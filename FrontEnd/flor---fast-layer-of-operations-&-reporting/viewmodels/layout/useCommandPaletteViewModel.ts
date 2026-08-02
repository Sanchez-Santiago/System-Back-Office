import { useState, useEffect, useRef } from 'react';
import { AppTab } from '../../types';

interface CommandPaletteViewModelProps {
  onClose: () => void;
  onNavigate: (tab: AppTab) => void;
  onSearch: (query: string) => void;
  onAction: (action: string) => void;
}

export function useCommandPaletteViewModel({ onClose, onNavigate, onSearch, onAction }: CommandPaletteViewModelProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { id: 'gestion', label: 'Ir a Gestión', icon: '📋', category: 'Navegación', action: () => onNavigate('GESTIÓN') },
    { id: 'seguimiento', label: 'Ir a Seguimiento', icon: '🚚', category: 'Navegación', action: () => onNavigate('SEGUIMIENTO') },
    { id: 'reportes', label: 'Ir a Reportes', icon: '📊', category: 'Navegación', action: () => onNavigate('REPORTES') },
    { id: 'ofertas', label: 'Ir a Ofertas', icon: '🔥', category: 'Navegación', action: () => onNavigate('OFERTAS') },
    { id: 'nueva_venta', label: 'Nueva Venta', icon: '➕', category: 'Acciones', action: () => onAction('NEW_SALE') },
    { id: 'dark_mode', label: 'Cambiar Tema', icon: '🌓', category: 'Sistema', action: () => onAction('TOGGLE_THEME') },
  ];

  const filteredCommands = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  };

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      if (e.key === 'ArrowUp') setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      if (e.key === 'Enter') {
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        } else if (query) {
          onSearch(query);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, filteredCommands, selectedIndex, query, onSearch]);

  const state = { query, selectedIndex, filteredCommands, inputRef };
  const actions = { setSelectedIndex, handleQueryChange };

  return { state, actions };
}
