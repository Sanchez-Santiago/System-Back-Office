import React from 'react';
import { Sale, SaleStatus, LogisticStatus, ProductType, AppTab } from '../../types';
import { UpdateMenu } from './UpdateMenu';
import { EstadoVentaFormModal } from '../modals/EstadoVentaFormModal';
import { CorreoFormModal } from '../modals/CorreoFormModal';
import { EstadoCorreoFormModal } from '../modals/EstadoCorreoFormModal';
import { SaleFormModal } from '../modals/SaleFormModal';
import { NominaModal } from '../modals/NominaModal';
import { UserFormModal } from '../modals/UserFormModal';
import { SaleModal } from '../sale/SaleModal';
import { CommandPalette } from './CommandPalette';
import { AIChatModal } from './AIChatModal';
import { CommentModal } from '../modals/CommentModal';

interface AppModalsProps {
  selectedIds: Set<string>;
  filteredSales: Sale[];
  selectAllChecked: boolean;
  handleToggleSelectAll: () => void;
  isUpdatingBulk: boolean;
  handleUpdateBoth: (saleStatus: SaleStatus | null, logisticStatus: LogisticStatus | null) => void;
  onClearSelection: () => void;
  editingEstadoVenta: Sale | null;
  setEditingEstadoVenta: (v: Sale | null) => void;
  editingCorreo: Sale | null;
  setEditingCorreo: (v: Sale | null) => void;
  editingEstadoCorreo: { sale: Sale; currentEstado?: string } | null;
  setEditingEstadoCorreo: (v: { sale: Sale; currentEstado?: string } | null) => void;
  creatingSale: Partial<Sale> | null;
  setCreatingSale: (v: Partial<Sale> | null) => void;
  showNomina: boolean;
  setShowNomina: (v: boolean) => void;
  showUserForm: boolean;
  setShowUserForm: (v: boolean) => void;
  userFormCelulas: any[];
  setUserFormCelulas: (v: any[]) => void;
  userFormEditingUser: any;
  setUserFormEditingUser: (v: any) => void;
  nominaRefreshKey: number;
  setNominaRefreshKey: (v: number | ((k: number) => number)) => void;
  selectedSale: Sale | null;
  setSelectedSale: (v: Sale | null) => void;
  commentingSale: Sale | null;
  setCommentingSale: (v: Sale | null) => void;
  handleUpdateSale: (data: any) => Promise<void>;
  handleSingleUpdateStatus: (status: SaleStatus, comment: string) => Promise<void>;
  handleSingleUpdateLogistic: (status: LogisticStatus, comment: string) => Promise<void>;
  showCommandPalette: boolean;
  setShowCommandPalette: (v: boolean) => void;
  showAIChat: boolean;
  setShowAIChat: (v: boolean) => void;
  activeTab: AppTab;
  setActiveTab: (v: AppTab) => void;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  authUser: any;
  queryClient: any;
}

export const AppModals: React.FC<AppModalsProps> = ({
  selectedIds, filteredSales, selectAllChecked, handleToggleSelectAll,
  isUpdatingBulk, handleUpdateBoth, onClearSelection,
  editingEstadoVenta, setEditingEstadoVenta,
  editingCorreo, setEditingCorreo,
  editingEstadoCorreo, setEditingEstadoCorreo,
  creatingSale, setCreatingSale,
  showNomina, setShowNomina,
  showUserForm, setShowUserForm,
  userFormCelulas, setUserFormCelulas,
  userFormEditingUser, setUserFormEditingUser,
  nominaRefreshKey, setNominaRefreshKey,
  selectedSale, setSelectedSale,
  commentingSale, setCommentingSale,
  handleUpdateSale, handleSingleUpdateStatus, handleSingleUpdateLogistic,
  showCommandPalette, setShowCommandPalette,
  showAIChat, setShowAIChat,
  activeTab, setActiveTab, isDarkMode, setIsDarkMode,
  searchQuery, setSearchQuery, authUser, queryClient,
}) => {
  return (
    <>
      {selectedIds.size > 0 && (
        <UpdateMenu
          selectedCount={selectedIds.size}
          onUpdateBoth={handleUpdateBoth}
          onClear={onClearSelection}
          isUpdating={isUpdatingBulk}
          selectAllChecked={selectAllChecked}
          onToggleSelectAll={handleToggleSelectAll}
          visibleCount={filteredSales.length}
        />
      )}

      {editingEstadoVenta && (
        <EstadoVentaFormModal
          sale={editingEstadoVenta}
          onClose={() => setEditingEstadoVenta(null)}
          onSubmit={() => setEditingEstadoVenta(null)}
        />
      )}

      {editingCorreo && (
        <CorreoFormModal
          sale={editingCorreo}
          onClose={() => setEditingCorreo(null)}
          onSubmit={() => setEditingCorreo(null)}
        />
      )}

      {editingEstadoCorreo && (
        <EstadoCorreoFormModal
          sapId={editingEstadoCorreo.sale.id}
          currentEstado={editingEstadoCorreo.currentEstado}
          onClose={() => setEditingEstadoCorreo(null)}
          onSubmit={() => setEditingEstadoCorreo(null)}
        />
      )}

      {creatingSale && (
        <SaleFormModal
          initialData={creatingSale}
          onClose={() => setCreatingSale(null)}
          onVentaCreada={() => {
            setCreatingSale(null);
            queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
          }}
        />
      )}

      {showNomina && (
        <NominaModal
          onClose={() => setShowNomina(false)}
          user={authUser}
          refreshKey={nominaRefreshKey}
          onOpenUserForm={(celulas: any[], editingUser?: any) => {
            setUserFormCelulas(celulas);
            setUserFormEditingUser(editingUser || null);
            setShowUserForm(true);
          }}
        />
      )}

      {showUserForm && (
        <UserFormModal
          onClose={() => { setShowUserForm(false); setUserFormEditingUser(null); }}
          onSuccess={() => { setShowUserForm(false); setUserFormEditingUser(null); setNominaRefreshKey(k => k + 1); }}
          celulas={userFormCelulas}
          editingUser={userFormEditingUser}
        />
      )}

      {selectedSale && (
        <SaleModal
          sale={selectedSale as any}
          onClose={() => setSelectedSale(null)}
          onUpdate={handleUpdateSale}
          onUpdateStatus={handleSingleUpdateStatus}
          onUpdateLogistic={handleSingleUpdateLogistic}
        />
      )}

      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onNavigate={(tab) => { setActiveTab(tab); setShowCommandPalette(false); }}
          onSearch={(q) => { setSearchQuery(q); setShowCommandPalette(false); }}
          onAction={(action) => {
            if (action === 'NEW_SALE') setCreatingSale({ productType: ProductType.PORTABILITY });
            if (action === 'TOGGLE_THEME') setIsDarkMode(!isDarkMode);
            setShowCommandPalette(false);
          }}
        />
      )}

      {showAIChat && (
        <AIChatModal onClose={() => setShowAIChat(false)} />
      )}

      {commentingSale && (
        <CommentModal
          ventaId={Number(commentingSale.id.replace('V-', ''))}
          customerName={commentingSale.customerName}
          onClose={() => setCommentingSale(null)}
          onSuccess={() => {
            setCommentingSale(null);
            queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
          }}
        />
      )}
    </>
  );
};
