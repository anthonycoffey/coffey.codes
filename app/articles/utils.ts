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
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  let match = frontmatterRegex.exec(fileContent);
  let frontMatterBlock = match![1];
  let content = fileContent.replace(frontmatterRegex, '').trim();
  let frontMatterLines = frontMatterBlock.trim().split('\n');
  let metadata: Partial<Metadata> = {};

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(': ');
    let value = valueArr.join(': ').trim();
    value = value.replace(/^['"](.*)['"]$/, '$1'); // Remove quotes
    
    const trimmedKey = key.trim();
    
    // Handle tags (comma-separated list)
    if (trimmedKey === 'tags') {
      metadata.tags = value.split(',').map(tag => tag.trim());
    } 
    // Handle category (single string)
    else if (trimmedKey === 'category') {
      metadata.category = value;
    }
    // Handle other metadata fields
    else if (trimmedKey in metadata) {
      const keyTyped = trimmedKey as keyof Metadata;
      if (keyTyped === 'title' || keyTyped === 'publishedAt' || keyTyped === 'summary' || keyTyped === 'image') {
        metadata[keyTyped] = value;
      }
    }
  });

  return { metadata: metadata as Metadata, content };
}

function getMDXFiles(dir) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx');
}

function readMDXFile(filePath) {
  let rawContent = fs.readFileSync(filePath, 'utf-8');
  return parseFrontmatter(rawContent);
}

function getRSSMDXData(
  dir: string,
  page: number = 1,
  itemsPerPage: number = 10,
) {
  return getMDXFiles(dir).map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file));
    let slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}

function getMDXData(dir: string, page: number = 1, itemsPerPage: number = 10) {
  let mdxFiles = getMDXFiles(dir).map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file));
    let slug = path.basename(file, path.extname(file));

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

export function getBlogPostsByTag(tag: string, page: number = 1, itemsPerPage: number = 10) {
  const postsDir = path.join(process.cwd(), 'app', 'articles', 'posts');
  
  let mdxFiles = getMDXFiles(postsDir).map((file) => {
    let { metadata, content } = readMDXFile(path.join(postsDir, file));
    let slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });

  // Filter posts by tag
  mdxFiles = mdxFiles.filter(post => {
    if (!post.metadata.tags) return false;
    
    return post.metadata.tags.some(t => {
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

export function getBlogPostsByCategory(category: string, page: number = 1, itemsPerPage: number = 10) {
  const postsDir = path.join(process.cwd(), 'app', 'articles', 'posts');
  
  let mdxFiles = getMDXFiles(postsDir).map((file) => {
    let { metadata, content } = readMDXFile(path.join(postsDir, file));
    let slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });

  // Filter posts by category
  mdxFiles = mdxFiles.filter(post => {
    if (!post.metadata.category) return false;
    
    // Debug info
    console.log(`Comparing: '${post.metadata.category.toLowerCase().trim()}' with '${category.toLowerCase().trim()}'`);
    
    return post.metadata.category.toLowerCase().trim() === category.toLowerCase().trim();
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
      metadata.tags.forEach(tag => {
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

export function formatDate(date: string, includeRelative = false) {
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



export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
