import { getAllTags } from '@/app/articles/utils';
import Link from 'next/link';

export function generateMetadata() {
  return {
    title: 'All Article Tags | Anthony Coffey - Solutions Architect, AI/ML',
    description: 'Explore articles by tag on specific technologies and concepts like React, Next.js, AWS, AI/ML, Git, and more from Anthony Coffey.',
  };
}

export default function TagsPage() {
  const tags = getAllTags();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 dark:text-white">All Tags</h1>
      
      <div className="mb-6">
        {/* Style back link */}
        <Link href="/articles" className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
          ← Back to all articles
        </Link>
      </div>
      
      <div className="flex flex-wrap gap-3 mt-4">
        {tags.map((tag) => (
          // Style tag chip
          <Link
            key={tag}
            href={`/articles/tag/${encodeURIComponent(tag.toLowerCase())}`}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-gray-300 text-sm font-medium px-3 py-1.5 rounded transition-colors"
          >
            {tag} 
          </Link>
        ))}
      </div>
      
      {tags.length === 0 && (
        // Style "No tags" message
        <p className="text-gray-600 dark:text-gray-400">No tags available yet.</p>
      )}
    </div>
  );
}
