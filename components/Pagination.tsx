// components/Pagination.tsx
'use client';
import React from 'react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  // Logic for creating page numbers (e.g., show first, last, current, and some neighbours)
  // For simplicity, let's show a few pages around current, plus first and last
  const maxPagesToShow = 5; // Max number of page links (e.g. 1 ... 4 5 6 ... 10)
  
  // Always show first page
  if (totalPages > 0) pageNumbers.push(1);

  let startPage = Math.max(2, currentPage - Math.floor((maxPagesToShow - 3) / 2));
  let endPage = Math.min(totalPages - 1, currentPage + Math.ceil((maxPagesToShow - 3) / 2));

  if (currentPage <= Math.ceil(maxPagesToShow / 2) ) {
    endPage = Math.min(totalPages - 1, maxPagesToShow -1);
  }
  if (currentPage > totalPages - Math.ceil(maxPagesToShow / 2) ) {
    startPage = Math.max(2, totalPages - maxPagesToShow + 2);
  }
  
  if (startPage > 2) {
    pageNumbers.push(-1); // Ellipsis
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (endPage < totalPages - 1) {
    pageNumbers.push(-1); // Ellipsis
  }
  
  // Always show last page if more than 1 page
  if (totalPages > 1) pageNumbers.push(totalPages);


  return (
    <nav aria-label="Seitennavigation" className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
      >
        Vorherige
      </button>
      {pageNumbers.map((page, index) => (
        page === -1 ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-gray-500">...</span>
        ) : (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 text-sm font-medium rounded-md
            ${currentPage === page 
              ? 'bg-blue-600 text-white border border-blue-600' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
        )
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
      >
        Nächste
      </button>
    </nav>
  );
};

export default Pagination;