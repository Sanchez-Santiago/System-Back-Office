
import { Sale, SaleStatus, LogisticStatus, LineStatus, ProductType, OriginMarket, Notification, Comment, Seller } from './types';

const ADVISORS = ['Juan Pérez', 'Elena Blanco', 'Carlos Ruiz', 'Sofía Vega', 'David Sanz', 'Lucía Méndez'];
const SUPERVISORS = ['Marta García', 'Alberto Gómez'];
const PLANS = ['GIGA_MAX 50GB', 'BASICO 10GB', 'PREMIUM ILIMITADO', 'BAF 300MB', 'FIBRA 1GB'];
const PROMOTIONS = ['DESCUENTO 50% 12M', 'BONO BIENVENIDA', 'SIN PROMO', 'DUPLICA GIGAS', 'KIDS PACK'];
const OPERATORS = ['Movistar', 'Vodafone', 'Orange', 'Yoigo', 'Digi', 'Pepephone'];

const getRandomDate = () => {
  const start = new Date(2024, 3, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

export const MOCK_SELLERS: Seller[] = ADVISORS.map((name, i) => ({
  legajo: `L-${1000 + i}`,
  exa: `EXA-${500 + i}`,
  name: name,
  email: `${name.toLowerCase().replace(' ', '.')}@florhub.com`,
  dni: `${Math.floor(10000000 + Math.random() * 90000000)}${String.fromCharCode(65 + i)}`,
  supervisor: SUPERVISORS[i % SUPERVISORS.length],
  status: Math.random() > 0.1 ? 'ACTIVO' : 'INACTIVO'
}));

export const MOCK_SALES: Sale[] = [
  {
    id: 'V-10234',
    customerName: 'Alejandro Martínez Soler',
    dni: '12345678X',
    phoneNumber: '600123456',
    status: SaleStatus.ACTIVADO,
    logisticStatus: LogisticStatus.ENTREGADO,
    lineStatus: LineStatus.ACTIVA,
    productType: ProductType.PORTABILITY,
    originMarket: OriginMarket.CONTRAFACTURA,
    originCompany: 'Movistar',
    plan: 'PREMIUM ILIMITADO',
    promotion: 'DESCUENTO 50% 12M',
    priority: 'ALTA',
    date: '2024-05-15',
    amount: 45.99,
    comments: [
      { id: 'c1', title: 'Cierre Exitoso', text: 'Cliente conforme con la instalación.', date: '2024-05-15 14:00', author: 'Juan Pérez' }
    ],
    advisor: 'Juan Pérez',
    supervisor: 'Marta García'
  },
  ...Array.from({ length: 99 }).map((_, i) => {
    const id = `V-${10235 + i}`;
    const advisor = ADVISORS[Math.floor(Math.random() * ADVISORS.length)];
    const status = Object.values(SaleStatus)[Math.floor(Math.random() * Object.values(SaleStatus).length)];
    const logistic = Object.values(LogisticStatus)[Math.floor(Math.random() * Object.values(LogisticStatus).length)];
    const line = Object.values(LineStatus)[Math.floor(Math.random() * Object.values(LineStatus).length)];
    const product = Object.values(ProductType)[Math.floor(Math.random() * Object.values(ProductType).length)];
    const market = Object.values(OriginMarket)[Math.floor(Math.random() * Object.values(OriginMarket).length)];
    const plan = PLANS[Math.floor(Math.random() * PLANS.length)];
    const promo = PROMOTIONS[Math.floor(Math.random() * PROMOTIONS.length)];
    
    return {
      id,
      customerName: `Cliente Genérico ${i + 1}`,
      dni: `${Math.floor(10000000 + Math.random() * 90000000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      phoneNumber: `6${Math.floor(10000000 + Math.random() * 90000000)}`,
      status,
      logisticStatus: logistic,
      lineStatus: line,
      productType: product,
      originMarket: market,
      originCompany: product === ProductType.PORTABILITY ? OPERATORS[Math.floor(Math.random() * OPERATORS.length)] : undefined,
      plan,
      promotion: promo,
      priority: (['ALTA', 'MEDIA', 'BAJA'][Math.floor(Math.random() * 3)]) as any,
      date: getRandomDate(),
      amount: parseFloat((15 + Math.random() * 80).toFixed(2)),
      comments: [],
      advisor,
      supervisor: SUPERVISORS[Math.floor(Math.random() * SUPERVISORS.length)]
    };
  })
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'CRITICAL', title: 'Pieza Extraviada', message: 'La portabilidad V-10242 requiere atención inmediata por logística.', timestamp: 'Hace 2 min' },
  { id: 'n2', type: 'RECENT', title: 'Carga Masiva Exitosa', message: 'Se han importado 15 nuevos registros al HUB.', timestamp: 'Hace 10 min' }
];
