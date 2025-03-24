import { getAllTags } from 'app/articles/utils';
import Link from 'next/link';

export function generateMetadata() {
  return {
    title: 'All Tags | Anthony Coffey',
    description: 'Browse all available tags for articles',
  };
}

export default function TagsPage() {
  const tags = getAllTags();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">All Tags</h1>
      
      <div className="mb-6">
        <Link href="/articles" className="text-blue-600 hover:underline">
          ← Back to all articles
        </Link>
      </div>
      
      <div className="flex flex-wrap gap-3 mt-4">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/articles/tag/${encodeURIComponent(tag.toLowerCase())}`}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1.5 rounded transition-colors"
          >
            {tag} 
          </Link>
        ))}
      </div>
      
      {tags.length === 0 && (
        <p className="text-gray-600">No tags available yet.</p>
      )}
    </div>
  );
}