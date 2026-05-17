import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { highlight } from 'sugar-high';
import React from 'react';
import Counter from '@/components/Counter';
import CopyButton from './CopyButton';
import { MermaidChart } from './mdx-clients';
import { Callout } from './Callout';
import Link from 'next/link';

function Table({ data }) {
  const headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ));
  const rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function CustomLink(props) {
  const href = props.href;

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    );
  }

  if (href.startsWith('#')) {
    return <a {...props} />;
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

function RoundedImage(props) {
  // Default sizes hint sized for the article max-width (max-w-4xl ~896px)
  // so next/image picks a right-sized variant on mobile/tablet/desktop.
  // Per-call override still wins since spread props come after.
  return (
    <Image
      alt={props.alt}
      sizes="(max-width: 768px) 100vw, 896px"
      className="rounded-lg"
      {...props}
    />
  );
}

function Code({ children, className, ...props }) {
  const language = className?.replace(/language-/, '');

  if (language === 'mermaid') {
    const chartDefinition =
      typeof children === 'string'
        ? children.trim()
        : React.Children.toArray(children).join('').trim();
    if (!chartDefinition) {
      console.warn('Empty Mermaid chart definition found.');
      return null;
    }
    return <MermaidChart chart={chartDefinition} />;
  }

  const isMultiline = React.Children.toArray(children).join('').includes('\n');
  const codeString = React.Children.toArray(children).join('');
  const codeHTML = highlight(codeString);

  if (isMultiline) {
    return (
      <span style={{ position: 'relative', display: 'block' }}>
        <pre className={`multiline ${className || ''}`}>
          <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
          <CopyButton text={codeString} />
        </pre>
      </span>
    );
  } else {
    return (
      <span className={`singleline ${className || ''}`}>
        <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
      </span>
    );
  }
}

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/-+/g, '-');
}

function createHeading(level) {
  const Heading = ({ children }) => {
    const slug = slugify(children);
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children,
    );
  };

  Heading.displayName = `Heading${level}`;

  return Heading;
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  Table,
  Counter,
  Callout,
};

// MDX pipeline options. `remark-gfm` enables GitHub-Flavored Markdown:
// pipe tables, strikethrough, task lists, footnotes, and bare-URL autolinks.
// Without it, `| col | col |` and similar render as raw text.
const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
  },
};

export async function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      options={mdxOptions}
      components={{ ...components, ...(props.components || {}) }}
    />
  );
}
