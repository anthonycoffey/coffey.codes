// import Link from 'next/link';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { highlight } from 'sugar-high';
import React from 'react';
import Counter from '@/components/Counter';
import CopyButton from './CopyButton';
import ThreeScene from './ThreeScene';
import FishbowlScene from './FishbowlScene';
import MermaidChart from './MermaidChart';
import { Callout } from './Callout'; // Import the Callout component

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
  return <Image alt={props.alt} className="rounded-lg" {...props} />;
}

function Code({ children, className, ...props }) {
  // Check if the language is mermaid
  const language = className?.replace(/language-/, '');
  // console.log('Code component className:', className, 'Detected language:', language); // Removed logging

  if (language === 'mermaid') {
    // Render Mermaid chart using the client component
    // Ensure children is passed as a string, trim whitespace
    const chartDefinition = typeof children === 'string' ? children.trim() : React.Children.toArray(children).join('').trim();
    // Add a check for empty definition
    if (!chartDefinition) {
      console.warn('Empty Mermaid chart definition found.');
      return null; // Don't render if empty
    }
    return <MermaidChart chart={chartDefinition} />;
  }

  // Existing code block handling
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
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word characters except for -
    .replace(/-+/g, '-'); // Replace multiple - with single -
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
  ThreeScene,
  FishbowlScene,
  Callout, // Add Callout to the components object
};

export async function CustomMDX(props) { // Make the function async
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
    />
  );
}
