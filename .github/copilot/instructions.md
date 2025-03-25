# GitHub Copilot Instructions

This is a Next.js blog using App Router and MDX for content.

## Project Overview
- Next.js App Router architecture
- TypeScript for type safety
- MDX-powered blog using next-mdx-remote
- Tailwind CSS with custom SASS utilities
- Mobile-first responsive design

## Code Conventions
- Use functional components with arrow functions or named functions
- Follow TypeScript strict type checking with interfaces for component props
- Group imports: React/Next first, then third-party libraries, then local imports
- Use 'use client' directive at the top of client components
- PascalCase for components, camelCase for variables/functions
- Error handling with try/catch blocks and graceful fallbacks
- Prefer React hooks (useState, useEffect, useRef) for state management

## File Structure
- `/app`: Next.js App Router pages and layouts
- `/app/articles`: Blog article pages and MDX content
- `/app/components`: Reusable React components
- `/styles`: Global SASS styles
- `/public`: Static assets and images

## Common Tasks
- Add new blog posts as MDX files in `/app/articles/posts`
- Create new components in `/app/components`
- Update metadata in layout files for SEO

## Helpful Commands
- `yarn dev`: Start development server
- `yarn build`: Build for production
- `yarn start`: Start production server