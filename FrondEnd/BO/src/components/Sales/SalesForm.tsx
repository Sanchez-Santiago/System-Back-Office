// src/components/Sales/SalesForm.tsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { salesApi } from '../../services/salesApi';
import type { SaleCreate } from '../../types/sales';

interface SalesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SalesForm: React.FC<SalesFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SaleCreate>>({
    tipo_venta: 'LINEA_NUEVA',
    chip: 'SIM',
    multiple: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This is a simplified form - in reality you'd need to fetch clients, plans, etc.
      const saleData: SaleCreate = {
        sds: formData.sds || '',
        chip: formData.chip || 'SIM',
        tipo_venta: formData.tipo_venta || 'LINEA_NUEVA',
        cliente_id: formData.cliente_id || '',
        plan_id: formData.plan_id || 0,
        empresa_origen_id: formData.empresa_origen_id || 0,
        multiple: formData.multiple || 0,
      };

      await salesApi.createSale(saleData);
      onSuccess();
      onClose();
      setFormData({ tipo_venta: 'LINEA_NUEVA', chip: 'SIM', multiple: 0 });
    } catch (error) {
      console.error('Error creating sale:', error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nueva Venta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="sds">SDS</Label>
            <Input
              id="sds"
              value={formData.sds || ''}
              onChange={(e) => setFormData({ ...formData, sds: e.target.value })}
              placeholder="Identificador único"
              required
            />
          </div>

          <div>
            <Label htmlFor="tipo_venta">Tipo de Venta</Label>
            <Select
              value={formData.tipo_venta}
              onValueChange={(value) => setFormData({ ...formData, tipo_venta: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LINEA_NUEVA">Línea Nueva</SelectItem>
                <SelectItem value="PORTABILIDAD">Portabilidad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="chip">Chip</Label>
            <Select
              value={formData.chip}
              onValueChange={(value) => setFormData({ ...formData, chip: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIM">SIM</SelectItem>
                <SelectItem value="ESIM">eSIM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Simplified - in real app you'd have dropdowns for clients, plans, etc. */}
          <div>
            <Label htmlFor="cliente_id">ID Cliente</Label>
            <Input
              id="cliente_id"
              value={formData.cliente_id || ''}
              onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
              placeholder="UUID del cliente"
              required
            />
          </div>

          <div>
            <Label htmlFor="plan_id">ID Plan</Label>
            <Input
              id="plan_id"
              type="number"
              value={formData.plan_id || ''}
              onChange={(e) => setFormData({ ...formData, plan_id: parseInt(e.target.value) })}
              placeholder="ID del plan"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Venta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};