'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid';
import { formatDate } from '@/utils/date';
import SearchBox from '@/components/SearchBox';
import Pagination from '@/components/Pagination';

// Define the Post interface
interface Post {
  slug: string;
  title: string;
  publishedAt: string;
  category?: string;
  summary: string;
  tags?: string[];
}

// Create a wrapper component that uses the search params
function SearchPageContent() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const itemsPerPage = 5; // Same as other pages

  const [currentQuery, setCurrentQuery] = useState(urlQuery);
  const [results, setResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to perform the search
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
      );
      const data = await response.json();
      setResults(data.posts);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize currentQuery when URL query changes
  useEffect(() => {
    setCurrentQuery(urlQuery);
  }, [urlQuery]);

  // Perform search when currentQuery changes
  useEffect(() => {
    performSearch(currentQuery);
  }, [currentQuery]);

  // Listen for custom search events from the SearchBox component
  useEffect(() => {
    const handleSearchEvent = (event: CustomEvent) => {
      const { query: newQuery } = event.detail;
      setCurrentQuery(newQuery);
    };

    window.addEventListener(
      'search-query-updated',
      handleSearchEvent as EventListener,
    );

    return () => {
      window.removeEventListener(
        'search-query-updated',
        handleSearchEvent as EventListener,
      );
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h1 className="font-bold text-3xl tracking-tighter mb-4 flex items-center">
          <MagnifyingGlassIcon className="w-6 h-6 inline mr-2 text-blue-500" />
          Search Results
        </h1>

        <div className="mb-6">
          <Link href="/articles" className="text-blue-600 hover:underline">
            ← Back to all articles
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto flex">
            <div className="flex-grow">
              <SearchBox
                initialValue={currentQuery}
                autofocus={true}
                placeholder="Search for articles..."
                hideDropdown={true}
              />
            </div>
  
          </div>
        </div>

        {currentQuery && (
          <div className="bg-gray-100 p-3 rounded mb-6 flex justify-between items-center">
            <p className="text-gray-700">
              Showing results for:{' '}
              <span className="font-semibold">&quot;{currentQuery}&quot;</span>
            </p>
            <Link
              href="/articles/search"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <XCircleIcon className="w-4 h-4 mr-1" />
              Clear search
            </Link>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <svg
            className="animate-spin h-8 w-8 mx-auto text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-gray-600">Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="space-y-6">
            {/* Paginate the results */}
            {results
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage,
              )
              .map((post: Post) => (
                <div
                  key={post.slug}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <Link href={`/articles/${post.slug}`} className="block">
                    <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  <div className="flex flex-wrap items-center gap-2 mt-2 mb-3">
                    <span className="text-sm text-gray-500">
                      {formatDate(post.publishedAt)}
                    </span>

                    {post.category && (
                      <Link
                        href={`/articles/category/${encodeURIComponent(post.category.toLowerCase())}`}
                        className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full hover:bg-blue-200"
                      >
                        {post.category}
                      </Link>
                    )}
                  </div>

                  <p className="text-gray-700 mb-3">{post.summary}</p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/articles/tag/${encodeURIComponent(tag.toLowerCase())}`}
                          className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded hover:bg-gray-200"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Pagination */}
          {results.length > itemsPerPage && (
            <div className="w-full mt-8 flex justify-center">
              <Pagination
                totalPages={Math.ceil(results.length / itemsPerPage)}
                initialPage={currentPage}
              />
            </div>
          )}
        </>
      ) : currentQuery ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <DocumentTextIcon className="h-16 w-16 mx-auto text-gray-300" />
          <h2 className="mt-4 text-xl font-medium text-gray-900">
            No articles found
          </h2>
          <p className="mt-2 text-gray-500">
            We couldn&apos;t find any articles matching &quot;{currentQuery}&quot;.
          </p>
          <div className="mt-6">
            <Link
              href="/articles"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View all articles
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <MagnifyingGlassIcon className="h-16 w-16 mx-auto text-gray-300" />
          <h2 className="mt-4 text-xl font-medium text-gray-900">
            Search articles
          </h2>
          <p className="mt-2 text-gray-500">
            Use the search box above to find articles.
          </p>
        </div>
      )}
    </div>
  );
}

// Loading state for Suspense
function SearchPageLoading() {
  return (
    <div className="max-w-6xl mx-auto text-center py-20">
      <svg
        className="animate-spin h-10 w-10 mx-auto text-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p className="mt-4 text-gray-600">Loading search...</p>
    </div>
  );
}

// Main component with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageContent />
    </Suspense>
  );
}
