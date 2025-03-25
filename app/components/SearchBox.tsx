'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowRightIcon,
} from '@heroicons/react/20/solid';

interface Post {
  slug: string;
  title: string;
  publishedAt: string;
  category?: string;
}

function formatDate(date: string, includeRelative = false): string {
  let currentDate = new Date();
  if (!date.includes('T')) {
    date = `${date}T00:00:00`;
  }
  let targetDate = new Date(date);

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  let daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = '';

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = 'Today';
  }

  let fullDate = targetDate.toLocaleString('en-us', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (!includeRelative) {
    return fullDate;
  }

  return `${fullDate} (${formattedDate})`;
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchRef]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
        );
        const data = await response.json();
        setResults(data.posts);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
        />
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-2.5"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* No results message or view all results */}
      {showResults && query.length >= 2 && !isLoading && (
        <div className="w-full mt-1 bg-white">
          {results.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">
              No articles found for "{query}"
            </p>
          ) : (
            <div className="flex justify-between items-center border-t border-gray-100 mt-2 pt-2">
              <p className="text-xs text-gray-500">
                {results.length > 3
                  ? `Showing 3 of ${results.length} results`
                  : `${results.length} results found`}
              </p>
              <button
                onClick={() =>
                  router.push(`/articles/search?q=${encodeURIComponent(query)}`)
                }
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              >
                View all results <ArrowRightIcon className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {results.map((post) => (
            <Link
              key={post.slug}
              href={`/articles/${post.slug}`}
              className="block p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              onClick={() => {
                setShowResults(false);
                setQuery('');
              }}
            >
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {post.title}
              </h3>
              <p className="ml-1 text-xs text-gray-500 mt-1">
                {formatDate(post.publishedAt)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {post.category && (
                  <span className="mr-1 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                    {post.category}
                  </span>
                )}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">Searching...</p>
        </div>
      )}

      {/* Handle Enter key for search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim().length >= 2) {
            router.push(`/articles/search?q=${encodeURIComponent(query)}`);
          }
        }}
        className="hidden"
      >
        <input type="submit" />
      </form>
    </div>
  );
}
