import fs from 'fs';
import path from 'path';

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  tags?: string[];
  category?: string;
};

function parseFrontmatter(fileContent: string) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);

  if (!match) {
    throw new Error('No frontmatter found');
  }

  const frontMatterBlock = match[1];
  const content = fileContent.replace(frontmatterRegex, '').trim();
  const frontMatterLines = frontMatterBlock.trim().split('\n');
  const metadata: Partial<Metadata> = {};

  frontMatterLines.forEach((line) => {
    const [key, ...valueArr] = line.split(': ');
    let value = valueArr.join(': ').trim();
    value = value.replace(/^['"](.*)['"]$/, '$1'); // Remove quotes

    // trim key
    const x = key.trim();

    if (x === 'tags') {
      metadata.tags = value.split(',').map((tag) => tag.trim());
    }
    else if (x === 'category') {
      metadata.category = value;
    }
    else if (
      x === 'title' ||
      x === 'publishedAt' ||
      x === 'summary' ||
      x === 'image'
    ) {
      (metadata as Record<string, string>)[x] = value;
    }
  });

  // Validate
  if (!metadata.title || !metadata.publishedAt || !metadata.summary) {
    throw new Error('Missing required metadata fields');
  }

  return { metadata: metadata as Metadata, content };
}
function getMDXFiles(dir) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx');
}

function readMDXFile(filePath) {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  return parseFrontmatter(rawContent);
}

function getRSSMDXData(
  dir: string,
) {
  return getMDXFiles(dir).map((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}

function getMDXData(dir: string, page: number = 1, itemsPerPage: number = 10) {
  const mdxFiles = getMDXFiles(dir).map((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });

  mdxFiles.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1;
    }
    return 1;
  });

  const totalItems = mdxFiles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedFiles = mdxFiles.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  return {
    posts: paginatedFiles,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage,
    },
  };
}

export function getRSSBlogPosts() {
  return getRSSMDXData(path.join(process.cwd(), 'app', 'articles', 'posts'));
}

export function getBlogPosts(page: number = 1, itemsPerPage: number = 10) {
  return getMDXData(
    path.join(process.cwd(), 'app', 'articles', 'posts'),
    page,
    itemsPerPage,
  );
}

export function getBlogPostsByTag(
  tag: string,
  page: number = 1,
  itemsPerPage: number = 10,
) {
  const postsDir = path.join(process.cwd(), 'app', 'articles', 'posts');

  let mdxFiles = getMDXFiles(postsDir).map((file) => {
    const { metadata, content } = readMDXFile(path.join(postsDir, file));
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });

  // Filter posts by tag
  mdxFiles = mdxFiles.filter((post) => {
    if (!post.metadata.tags) return false;

    return post.metadata.tags.some((t) => {
      const normalizedTag = t.toLowerCase().trim();
      const normalizedSearchTag = tag.toLowerCase().trim();
      return normalizedTag === normalizedSearchTag;
    });
  });

  mdxFiles.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1;
    }
    return 1;
  });

  const totalItems = mdxFiles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedFiles = mdxFiles.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  return {
    posts: paginatedFiles,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage,
    },
  };
}

export function getBlogPostsByCategory(
  category: string,
  page: number = 1,
  itemsPerPage: number = 10,
) {
  const postsDir = path.join(process.cwd(), 'app', 'articles', 'posts');

  let mdxFiles = getMDXFiles(postsDir).map((file) => {
    const { metadata, content } = readMDXFile(path.join(postsDir, file));
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });

  mdxFiles = mdxFiles.filter((post) => {
    if (!post.metadata.category) return false;

    return (
      post.metadata.category.toLowerCase().trim() ===
      category.toLowerCase().trim()
    );
  });

  mdxFiles.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1;
    }
    return 1;
  });

  const totalItems = mdxFiles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedFiles = mdxFiles.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  return {
    posts: paginatedFiles,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage,
    },
  };
}

export function getAllTags() {
  const postsDir = path.join(process.cwd(), 'app', 'articles', 'posts');

  const allTags = new Set<string>();

  getMDXFiles(postsDir).forEach((file) => {
    const { metadata } = readMDXFile(path.join(postsDir, file));

    if (metadata.tags) {
      metadata.tags.forEach((tag) => {
        allTags.add(tag.trim());
      });
    }
  });

  return Array.from(allTags).sort();
}

export function getAllCategories() {
  const postsDir = path.join(process.cwd(), 'app', 'articles', 'posts');

  const allCategories = new Set<string>();

  getMDXFiles(postsDir).forEach((file) => {
    const { metadata } = readMDXFile(path.join(postsDir, file));

    if (metadata.category) {
      allCategories.add(metadata.category);
    }
  });

  return Array.from(allCategories).sort();
}

export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
