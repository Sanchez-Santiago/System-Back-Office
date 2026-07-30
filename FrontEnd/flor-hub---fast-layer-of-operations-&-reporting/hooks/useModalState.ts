import { useState } from 'react';
import { Sale } from '../types';

export function useModalState() {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showNomina, setShowNomina] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormCelulas, setUserFormCelulas] = useState<any[]>([]);
  const [userFormEditingUser, setUserFormEditingUser] = useState<any>(null);
  const [nominaRefreshKey, setNominaRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);

  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [commentingSale, setCommentingSale] = useState<Sale | null>(null);
  const [creatingSale, setCreatingSale] = useState<Partial<Sale> | null>(null);

  const [editingEstadoVenta, setEditingEstadoVenta] = useState<Sale | null>(null);
  const [editingCorreo, setEditingCorreo] = useState<Sale | null>(null);
  const [editingEstadoCorreo, setEditingEstadoCorreo] = useState<{sale: Sale, currentEstado?: string} | null>(null);

  return {
    showAdvancedFilters, setShowAdvancedFilters,
    showNomina, setShowNomina,
    showUserForm, setShowUserForm,
    userFormCelulas, setUserFormCelulas,
    userFormEditingUser, setUserFormEditingUser,
    nominaRefreshKey, setNominaRefreshKey,
    selectedIds, setSelectedIds,
    isUpdatingBulk, setIsUpdatingBulk,
    showCommandPalette, setShowCommandPalette,
    showAIChat, setShowAIChat,
    selectedSale, setSelectedSale,
    commentingSale, setCommentingSale,
    creatingSale, setCreatingSale,
    editingEstadoVenta, setEditingEstadoVenta,
    editingCorreo, setEditingCorreo,
    editingEstadoCorreo, setEditingEstadoCorreo,
  };
}
