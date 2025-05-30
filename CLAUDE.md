# CLAUDE.md - Development Guidelines

## Build Commands
- `bun dev` - Start development server on port 3000
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint on JS/TS files
- `bun lint:fix` - Fix linting issues automatically

## Code Style
- **TypeScript**: Strict type checking with interfaces for component props
- **Components**: Functional components using arrow functions or named functions
- **Imports**: Group React/Next imports first, then third-party, then local
- **CSS**: Tailwind CSS with custom SASS utilities
- **Formatting**: Use Prettier with semicolons, single quotes, 2-space indent
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Client/Server**: Use 'use client' directive at top of client components
- **Error Handling**: Try/catch with graceful fallbacks
- **State Management**: React hooks (useState, useEffect, useRef)
- **File Organization**: Group by feature/page in app directory structure

## Project Structure
- Next.js App Router architecture
- MDX-powered blog using next-mdx-remote
- Mobile-first responsive design
- ESLint with flat config (eslint.config.js)