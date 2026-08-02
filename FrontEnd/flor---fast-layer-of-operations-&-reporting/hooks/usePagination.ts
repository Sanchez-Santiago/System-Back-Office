import { useState } from 'react';

export function usePagination() {
  const [rowsPerPage, setRowsPerPage] = useState<number | 'TODOS'>(50);
  const [currentPage, setCurrentPage] = useState(1);

  return { rowsPerPage, setRowsPerPage, currentPage, setCurrentPage };
}
