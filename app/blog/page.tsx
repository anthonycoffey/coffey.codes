import { BlogPosts } from 'app/components/posts'
import { getBlogPosts } from 'app/blog/utils'

export const metadata = {
  title: 'Blog',
  description: 'Articles on software development, engineering, product management, and more.',
}

export default async function Page({ searchParams }) {
  const page = searchParams.page ? Number(searchParams.page) : 1
  const itemsPerPage = 5
  const allBlogs = getBlogPosts(page, itemsPerPage)

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter text-center">blog</h1>
      <BlogPosts allBlogs={allBlogs} />
    </section>
  )
}