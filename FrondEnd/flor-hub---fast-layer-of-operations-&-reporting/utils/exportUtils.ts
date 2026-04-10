import { Sale } from '../types';

export const exportToCSV = (data: Sale[], filename: string) => {
  const headers = ['ID', 'Cliente', 'DNI', 'Teléfono', 'Estado', 'Logística', 'Producto', 'Mercado', 'Plan', 'Asesor', 'Supervisor', 'Fecha', 'Monto'];
  const csvContent = [
    headers.join(','),
    ...data.map(s => [
      s.id,
      `"${s.customerName}"`,
      s.dni,
      s.phoneNumber,
      s.status,
      `"${s.logisticStatus}"`,
      s.productType,
      `"${s.originMarket}"`,
      `"${s.plan}"`,
      `"${s.advisor}"`,
      `"${s.supervisor}"`,
      s.date,
      s.amount
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
