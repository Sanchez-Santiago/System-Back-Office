import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { Sale, SaleStatus, LogisticStatus } from '../types';

export function useBulkUpdateViewModel(
  selectedIds: Set<string>,
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>,
  sales: Sale[],
  selectedSale: Sale | null,
) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);

  const handleUpdateStatus = useCallback(async (status: SaleStatus) => {
    if (selectedIds.size === 0) return;
    setIsUpdatingBulk(true);
    try {
      const estadosToUpdate = Array.from(selectedIds).map((id: string) => ({
        venta_id: Number(id.replace('V-', '')),
        estado: status,
        descripcion: 'Actualización masiva desde UI'
      }));

      const response = await api.post('/estados/bulk', { estados: estadosToUpdate });

      if (response.success) {
        addToast({
          type: 'success',
          title: 'Estados de Venta Actualizados',
          message: response.message || `Se actualizaron ${selectedIds.size} ventas`
        });
        queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          message: response.message || 'No se pudieron actualizar los estados de venta'
        });
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Error de conexión al actualizar estados de venta'
      });
    } finally {
      setSelectedIds(new Set());
      setIsUpdatingBulk(false);
    }
  }, [selectedIds, queryClient, addToast, setSelectedIds]);

  const handleUpdateLogistic = useCallback(async (status: LogisticStatus) => {
    if (selectedIds.size === 0) return;
    setIsUpdatingBulk(true);
    try {
      const ventasConCorreos = sales.filter(s => selectedIds.has(s.id) && s.sap);
      const correosToUpdate = ventasConCorreos.map(venta => ({
        sap_id: venta.sap,
        estado: status,
        descripcion: 'Actualización masiva desde UI'
      }));

      if (correosToUpdate.length === 0) {
        addToast({
          type: 'warning',
          title: 'Advertencia',
          message: 'No se encontraron correos válidos para actualizar.'
        });
        setIsUpdatingBulk(false);
        setSelectedIds(new Set());
        return;
      }

      const response = await api.post('/estados-correo/bulk', { estados: correosToUpdate });

      if (response.success) {
        addToast({
          type: 'success',
          title: 'Estados de Correo Actualizados',
          message: response.message || `Se actualizaron ${correosToUpdate.length} correos`
        });
        queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          message: response.message || 'No se pudieron actualizar los estados de correo'
        });
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Error de conexión al actualizar estados de correo'
      });
    } finally {
      setSelectedIds(new Set());
      setIsUpdatingBulk(false);
    }
  }, [selectedIds, sales, queryClient, addToast, setSelectedIds]);

  const handleUpdateBoth = useCallback(async (saleStatus: SaleStatus | null, logisticStatus: LogisticStatus | null) => {
    if (selectedIds.size === 0) return;
    if (!saleStatus && !logisticStatus) return;

    setIsUpdatingBulk(true);
    const results: { ventas?: any; correos?: any } = {};
    const errors: string[] = [];

    try {
      if (saleStatus) {
        const estadosToUpdate = Array.from(selectedIds).map((id: string) => ({
          venta_id: Number(id.replace('V-', '')),
          estado: saleStatus,
          descripcion: 'Actualización masiva desde UI'
        }));

        try {
          const response = await api.post('/estados/bulk', { estados: estadosToUpdate });
          if (response.success) {
            results.ventas = response;
          } else {
            errors.push(`Venta: ${response.message || 'Error desconocido'}`);
          }
        } catch (error: any) {
          errors.push(`Venta: ${error.message || 'Error de conexión'}`);
        }
      }

      if (logisticStatus) {
        const ventasConCorreos = sales.filter(s => selectedIds.has(s.id) && s.sap);
        const correosToUpdate = ventasConCorreos.map(venta => ({
          sap_id: venta.sap,
          estado: logisticStatus,
          descripcion: 'Actualización masiva desde UI'
        }));

        if (correosToUpdate.length > 0) {
          try {
            const response = await api.post('/estados-correo/bulk', { estados: correosToUpdate });
            if (response.success) {
              results.correos = response;
            } else {
              errors.push(`Correo: ${response.message || 'Error desconocido'}`);
            }
          } catch (error: any) {
            errors.push(`Correo: ${error.message || 'Error de conexión'}`);
          }
        }
      }

      if (errors.length === 0) {
        const messages = [];
        if (results.ventas) messages.push(`${selectedIds.size} ventas`);
        if (results.correos) messages.push(`${results.correos.count || 'varios'} correos`);

        addToast({
          type: 'success',
          title: 'Actualización Exitosa',
          message: `Se actualizaron ${messages.join(' y ')} correctamente`
        });
        queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
      } else if (results.ventas || results.correos) {
        addToast({
          type: 'warning',
          title: 'Actualización Parcial',
          message: `Algunas actualizaciones fallaron: ${errors.join(', ')}`
        });
        queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          message: `No se pudieron realizar las actualizaciones: ${errors.join(', ')}`
        });
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Error de conexión al actualizar'
      });
    } finally {
      setSelectedIds(new Set());
      setIsUpdatingBulk(false);
    }
  }, [selectedIds, sales, queryClient, addToast, setSelectedIds]);

  const handleSingleUpdateStatus = useCallback(async (status: SaleStatus, comment: string) => {
    if (!selectedSale) return;
    try {
      const ventaId = String(selectedSale.id).replace('V-', '');

      const response = await api.post('/estados/bulk', {
        estados: [{
          venta_id: Number(ventaId),
          estado: status,
          descripcion: comment
        }]
      });

      if (response.success) {
        addToast({ type: 'success', title: 'Estado Actualizado', message: 'El estado de la venta se ha actualizado correctamente' });
        await queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
        await queryClient.invalidateQueries({ queryKey: ['ventaDetalleCompleto', ventaId] });
      } else {
        throw new Error(response.message || 'No se pudo actualizar el estado');
      }
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Error al actualizar el estado' });
      throw error;
    }
  }, [selectedSale, queryClient, addToast]);

  const handleSingleUpdateLogistic = useCallback(async (status: LogisticStatus, comment: string) => {
    if (!selectedSale) return;
    try {
      const sapId = selectedSale.sap;
      if (!sapId) {
        addToast({ type: 'error', title: 'Error', message: 'Esta venta no tiene un código SAP asignado' });
        return;
      }

      const response = await api.post('/estados-correo/bulk', {
        estados: [{
          sap_id: sapId,
          estado: status,
          descripcion: comment
        }]
      });

      if (response.success) {
        addToast({ type: 'success', title: 'Estado Logístico Actualizado', message: 'El estado del envío se ha actualizado correctamente' });
        await queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
        const ventaId = String(selectedSale.id).replace('V-', '');
        await queryClient.invalidateQueries({ queryKey: ['ventaDetalleCompleto', ventaId] });
      } else {
        throw new Error(response.message || 'No se pudo actualizar el estado logístico');
      }
    } catch (error: any) {
      addToast({ type: 'error', title: 'Error', message: error.message || 'Error al actualizar el estado logístico' });
      throw error;
    }
  }, [selectedSale, queryClient, addToast]);

  const handleUpdateSale = useCallback(async (updatedSale: any) => {
    try {
      const ventaId = String(updatedSale.id).replace('V-', '');

      const ventaData = {
        sds: updatedSale.sds,
        chip: updatedSale.chip,
        stl: updatedSale.stl,
        tipo_venta: updatedSale.tipoVenta,
        sap: updatedSale.sap,
        cliente_id: updatedSale.cliente?.id,
        plan_id: updatedSale.plan?.id || updatedSale.plan_id,
        promocion_id: updatedSale.promocion?.id || updatedSale.promocion_id,
        empresa_origen_id: updatedSale.empresa_origen_id
      };

      const response = await api.put(`/ventas/${ventaId}`, ventaData);

      if (response.success) {
        addToast({
          type: 'success',
          title: 'Venta Actualizada',
          message: 'Los cambios se han guardado correctamente'
        });
        queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          message: response.message || 'No se pudieron guardar los cambios'
        });
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Error de conexión al actualizar la venta'
      });
    }
  }, [queryClient, addToast]);

  return {
    state: { isUpdatingBulk },
    actions: {
      handleUpdateStatus,
      handleUpdateLogistic,
      handleUpdateBoth,
      handleSingleUpdateStatus,
      handleSingleUpdateLogistic,
      handleUpdateSale,
    },
  };
}
