import React from 'react';
import { Sale, ProductType } from '../../types';

export function useSaleCardViewModel(sale: Sale) {
  const isPorta = sale.productType === ProductType.PORTABILITY;
  const lastComment = sale.comments[sale.comments.length - 1];

  const isFresh = React.useMemo(() => {
    const saleTime = new Date(sale.date).getTime();
    const now = Date.now();
    return (now - saleTime) < 60000;
  }, [sale.date]);

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isFreshGlowing, setIsFreshGlowing] = React.useState(isFresh);

  React.useEffect(() => {
    setIsUpdating(true);
    const timer = setTimeout(() => setIsUpdating(false), 2000);
    return () => clearTimeout(timer);
  }, [sale.comments.length, sale.status, sale.logisticStatus]);

  React.useEffect(() => {
    if (isFresh) {
      const timer = setTimeout(() => setIsFreshGlowing(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isFresh]);

  return {
    state: {
      isFresh,
      isUpdating,
      isFreshGlowing,
      isPorta,
      lastComment,
    },
  };
}
