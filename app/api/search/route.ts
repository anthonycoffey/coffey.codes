import { NextResponse } from 'next/server';
import { getRSSBlogPosts } from '../../articles/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ posts: [] });
  }
  
  try {
    // Get all blog posts
    const allPosts = await getRSSBlogPosts();
    
    // Search in title, summary, content, tags, and category
    const searchResults = allPosts.filter(post => {
      const searchableContent = [
        post.metadata.title,
        post.metadata.summary,
        post.content,
        post.metadata.tags ? post.metadata.tags.join(' ') : '',
        post.metadata.category || '',
      ].join(' ').toLowerCase();
      
      return searchableContent.includes(query.toLowerCase());
    });
    
    // Format the search results to include only what's needed
    const formattedResults = searchResults.map(post => ({
      title: post.metadata.title,
      summary: post.metadata.summary,
      slug: post.slug,
      publishedAt: post.metadata.publishedAt,
      tags: post.metadata.tags || [],
      category: post.metadata.category || ''
    }));
    
    return NextResponse.json({ posts: formattedResults });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ posts: [], error: 'Failed to search posts' }, { status: 500 });
  }
}