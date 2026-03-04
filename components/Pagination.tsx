import React from 'react';
import Link from 'next/link';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  baseUrl: string; // Basis-URL (z.B. "/?q=...") ohne page-Parameter
};

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, baseUrl }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxPagesToShow = 5;

  // Helper to construct URL
  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${page}`;
  };

  // Logic adapted from previous version
  if (totalPages > 0) pageNumbers.push(1);

  let startPage = Math.max(2, currentPage - Math.floor((maxPagesToShow - 3) / 2));
  let endPage = Math.min(totalPages - 1, currentPage + Math.ceil((maxPagesToShow - 3) / 2));

  if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
    endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
  }
  if (currentPage > totalPages - Math.ceil(maxPagesToShow / 2)) {
    startPage = Math.max(2, totalPages - maxPagesToShow + 2);
  }

  if (startPage > 2) {
    pageNumbers.push(-1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (endPage < totalPages - 1) {
    pageNumbers.push(-1);
  }

  if (totalPages > 1) pageNumbers.push(totalPages);


  const buttonClass = (isActive: boolean) =>
    `px-3 py-2 text-sm font-medium rounded-md block ${isActive
      ? 'bg-blue-600 text-white border border-blue-600'
      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`;

  const navButtonClass = "px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <nav aria-label="Seitennavigation" className="flex justify-center items-center space-x-2 mt-8">
      {currentPage > 1 ? (
        <Link href={getPageUrl(currentPage - 1)} className={navButtonClass}>
          Vorherige
        </Link>
      ) : (
        <span className={`${navButtonClass} opacity-50`}>Vorherige</span>
      )}

      {pageNumbers.map((page, index) => (
        page === -1 ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-gray-500">...</span>
        ) : (
          <Link
            key={page}
            href={getPageUrl(page)}
            className={buttonClass(currentPage === page)}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </Link>
        )
      ))}

      {currentPage < totalPages ? (
        <Link href={getPageUrl(currentPage + 1)} className={navButtonClass}>
          Nächste
        </Link>
      ) : (
        <span className={`${navButtonClass} opacity-50`}>Nächste</span>
      )}
    </nav>
  );
};

export default Pagination;