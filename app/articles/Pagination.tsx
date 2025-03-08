import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';

export default function Pagination({ currentPage, totalPages }) {
  return (
    <div className="pagination flex justify-between mt-16">
      {currentPage > 1 && (
        <Link
          id="prev-page"
          href={`?page=${currentPage - 1}`}
          className="px-4 py-2 bg-gray-300 rounded flex items-center text-sm"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          <span>Prev</span>
        </Link>
      )}
      <span className="absolute left-1/2 transform -translate-x-1/2">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link
          id="next-page"
          href={`?page=${currentPage + 1}`}
          className="px-4 py-2 bg-gray-300 rounded flex items-center text-sm"
        >
          <span>Next</span>
          <ArrowRightIcon className="h-5 w-5 ml-2" />
        </Link>
      )}
    </div>
  );
}
