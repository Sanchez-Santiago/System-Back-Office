// src/components/Sales/SalesForm.tsx
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { handleSubmitWithErrorHandling } from '../../hooks/useFormValidation';
import { useSaleForm } from '../../hooks/useSaleForm';
import { plansApi } from '../../services/plansApi';
import { validatedSalesApi } from '../../services/validatedServices';
import { Loader2 } from 'lucide-react';
import type { SaleCreateRequest } from '../../schemas';

interface SalesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SalesForm: React.FC<SalesFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const form = useSaleForm();
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

// Cargar planes al montar el componente
  useEffect(() => {
    const loadPlans = async () => {
      setLoadingPlans(true);
      try {
        const activePlans = await plansApi.fetchActivePlans();
        setPlans(activePlans);
      } catch (error) {
        console.error('Error loading plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    };

    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const handleCreateSale = async (data: SaleCreateRequest) => {
    await validatedSalesApi.createSale(data);
    onSuccess();
    onClose();
    form.reset();
  };

  const onSubmit = handleSubmitWithErrorHandling(form, handleCreateSale);

return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-md border border-slate-200/50">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 -mx-6 px-6 py-4 text-white">
          <DialogTitle className="text-xl font-semibold">Crear Nueva Venta</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="venta" className="flex-1">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <TabsTrigger value="venta" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">Datos de Venta</TabsTrigger>
            <TabsTrigger value="correo" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">Datos de Envío</TabsTrigger>
            {form.watch('venta.tipo_venta') === 'PORTABILIDAD' && (
              <TabsTrigger value="portabilidad" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">Portabilidad</TabsTrigger>
            )}
          </TabsList>

          <form onSubmit={onSubmit} className="mt-4">
            <TabsContent value="venta" className="space-y-4 mt-4">
              <Card className="backdrop-blur-sm bg-white/90 border border-slate-200/50">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="text-slate-900">Información de la Venta</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <FormField
                    control={form.control}
                    name="venta.sds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SDS *</FormLabel>
                        <FormControl>
                          <Input placeholder="Identificador único" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venta.stl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>STL</FormLabel>
                        <FormControl>
                          <Input placeholder="STL (opcional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venta.sap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SAP</FormLabel>
                        <FormControl>
                          <Input placeholder="SAP (opcional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venta.cliente_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Cliente *</FormLabel>
                        <FormControl>
                          <Input placeholder="UUID del cliente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venta.tipo_venta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Venta *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LINEA_NUEVA">Línea Nueva</SelectItem>
                            <SelectItem value="PORTABILIDAD">Portabilidad</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venta.chip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Chip *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione chip" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SIM">SIM</SelectItem>
                            <SelectItem value="ESIM">eSIM</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venta.plan_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan *</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loadingPlans ? "Cargando planes..." : "Seleccionar plan"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {plans.map((plan) => (
                              <SelectItem key={plan.plan_id} value={plan.plan_id.toString()}>
                                {plan.nombre} - {plansApi.formatPrice(plan.precio)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venta.empresa_origen_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa Origen *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="ID empresa origen" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venta.multiple"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="0" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="correo" className="space-y-4 mt-4">
              <Card className="backdrop-blur-sm bg-white/90 border border-slate-200/50">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="text-slate-900">Información de Envío</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <FormField
                    control={form.control}
                    name="correo.destinatario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destinatario *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre completo del destinatario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correo.telefono_contacto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono de Contacto *</FormLabel>
                        <FormControl>
                          <Input placeholder="+34 600 000 000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correo.telefono_alternativo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono Alternativo</FormLabel>
                        <FormControl>
                          <Input placeholder="+34 600 000 001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correo.persona_autorizada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Persona Autorizada</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre si aplica" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correo.direccion"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Dirección *</FormLabel>
                        <FormControl>
                          <Input placeholder="Calle/Avenida" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correo.numero_casa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="123" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correo.entre_calles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entre Calles</FormLabel>
                        <FormControl>
                          <Input placeholder="Calle A y Calle B" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correo.barrio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barrio</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del barrio" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correo.localidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localidad *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ciudad" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correo.departamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento *</FormLabel>
                        <FormControl>
                          <Input placeholder="Departamento/Provincia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correo.codigo_postal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Postal *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="28001" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {form.watch('venta.tipo_venta') === 'PORTABILIDAD' && (
              <TabsContent value="portabilidad" className="space-y-4 mt-4">
                <Card className="backdrop-blur-sm bg-white/90 border border-slate-200/50">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardTitle className="text-slate-900">Datos de Portabilidad</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <FormField
                      control={form.control}
                      name="portabilidad.spn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SPN *</FormLabel>
                          <FormControl>
                            <Input placeholder="SPN del cliente" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="portabilidad.empresa_origen_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa Origen *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="ID empresa origen" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="portabilidad.mercado_origen"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mercado Origen *</FormLabel>
                          <FormControl>
                            <Input placeholder="Mercado de origen" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="portabilidad.numero_porta"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número a Portar *</FormLabel>
                          <FormControl>
                            <Input placeholder="+34 600 000 000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="portabilidad.pin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PIN *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="PIN de portabilidad" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

<div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200/50">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:bg-slate-100"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Venta'
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};