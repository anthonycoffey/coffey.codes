import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

export default function Pagination({ currentPage, totalPages }) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pageNumbers.push('...');
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  if (totalPages <= 1) {
    return null;
  }
  
  const pageNumbers = getPageNumbers();
  
  return (
    <nav className="flex items-center justify-center mt-12 mb-8">
      <ul className="flex items-center -space-x-px">
        {/* Previous button */}
        <li>
          {currentPage > 1 ? (
            <Link
              href={`?page=${currentPage - 1}`}
              className="block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
              aria-label="Previous page"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="w-5 h-5" />
            </Link>
          ) : (
            <span className="block px-3 py-2 ml-0 leading-tight text-gray-300 bg-white border border-gray-300 rounded-l-lg cursor-not-allowed">
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="w-5 h-5" />
            </span>
          )}
        </li>
        
        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <li key={`page-${page}-${index}`}>
            {page === '...' ? (
              <span className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300">
                ...
              </span>
            ) : (
              <Link
                href={`?page=${page}`}
                className={`px-3 py-2 leading-tight border ${
                  currentPage === page
                    ? 'text-blue-600 border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {page}
              </Link>
            )}
          </li>
        ))}
        
        {/* Next button */}
        <li>
          {currentPage < totalPages ? (
            <Link
              href={`?page=${currentPage + 1}`}
              className="block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
              aria-label="Next page"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="w-5 h-5" />
            </Link>
          ) : (
            <span className="block px-3 py-2 leading-tight text-gray-300 bg-white border border-gray-300 rounded-r-lg cursor-not-allowed">
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="w-5 h-5" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}