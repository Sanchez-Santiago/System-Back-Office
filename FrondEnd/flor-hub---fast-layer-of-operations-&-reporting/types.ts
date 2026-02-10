
export enum SaleStatus {
  INICIAL = 'INICIAL',
  EN_PROCESO = 'EN_PROCESO',
  PENDIENTE_DOCUMENTACION = 'PENDIENTE_DOCUMENTACION',
  APROBADO = 'APROBADO',
  ACTIVADO = 'ACTIVADO',
  RECHAZADO = 'RECHAZADO',
  CANCELADO = 'CANCELADO'
}

export enum LogisticStatus {
  INICIAL = 'INICIAL',
  ASIGNADO = 'ASIGNADO',
  DEVUELTO_CLIENTE = 'DEVUELTO AL CLIENTE',
  EN_DEVOLUCION = 'EN DEVOLUCION',
  EN_TRANSITO = 'EN TRANSITO',
  ENTREGADO = 'ENTREGADO',
  INGRESADO_LOGISTICO = 'INGRESADO CENTRO LOGISTICO - ECOMMERCE',
  INGRESADO_AGENCIA = 'INGRESADO EN AGENCIA',
  INGRESADO_PICKUP = 'INGRESADO PICK UP CENTER UES',
  NO_ENTREGADO = 'NO ENTREGADO',
  PIEZA_EXTRAVIADA = 'PIEZA EXTRAVIADA',
  RENDIDO_AL_CLIENTE = 'RENDIDO AL CLIENTE'
}

export enum LineStatus {
  PENDIENTE_PRECARGA = 'PENDIENTE PRECARGA',
  PRECARGADA = 'PRECARGADA',
  AUDITORIA_OK = 'AUDITORIA OK',
  PENDIENTE_PORTABILIDAD = 'PENDIENTE PORTABILIDAD',
  ERROR_TECNICO = 'ERROR TÉCNICO',
  ACTIVA = 'ACTIVA'
}

export enum ProductType {
  PORTABILITY = 'PORTABILIDAD',
  NEW_LINE = 'LÍNEA NUEVA',
  BAF = 'BAF',
  FIBER = 'FIBRA'
}

export enum OriginMarket {
  PREPAGO = 'PREPAGO',
  CONTRAFACTURA = 'CONTRAFACTURA'
}

export interface Comment {
  id: string;
  title: string;
  text: string;
  date: string;
  author: string;
}

export interface Sale {
  id: string;
  customerName: string;
  dni: string;
  phoneNumber: string;
  status: SaleStatus;
  logisticStatus: LogisticStatus;
  lineStatus: LineStatus;
  productType: ProductType;
  originMarket: OriginMarket;
  originCompany?: string;
  plan: string;
  promotion: string;
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
  date: string;
  amount: number;
  comments: Comment[];
  advisor: string;
  supervisor: string;
}

export interface Seller {
  legajo: string;
  exa: string;
  name: string;
  email: string;
  dni: string;
  supervisor: string;
  status: 'ACTIVO' | 'INACTIVO';
}

export interface Notification {
  id: string;
  type: 'CRITICAL' | 'RECENT';
  title: string;
  message: string;
  timestamp: string;
}

export type AppTab = 'GESTIÓN' | 'SEGUIMIENTO' | 'REPORTES' | 'OFERTAS';
