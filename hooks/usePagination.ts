'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export function usePagination(totalPages: number, initialPage: number = 1) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  // Get current page from URL or use initialPage
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Update current page when URL changes
  useEffect(() => {
    const page = searchParams.get('page') 
      ? Number(searchParams.get('page')) 
      : initialPage;
    
    setCurrentPage(page);
  }, [searchParams, initialPage]);

  // Change page function - updates URL with new page parameter
  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    
    const newParams = params.toString();
    const queryString = newParams ? `?${newParams}` : '';
    
    router.push(`${pathname}${queryString}`);
  };

  return {
    currentPage,
    totalPages,
    changePage,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}