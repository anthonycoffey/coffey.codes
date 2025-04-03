# Technical Context

_This file details the technologies used, development setup, constraints, dependencies, and tool usage patterns._

## Core Technologies

_(List the primary languages, frameworks, libraries, and platforms used.)_

- **Framework:** Next.js (canary)
- **Language:** TypeScript
- **UI Library:** React
- **Styling:** Tailwind CSS, SASS (`styles/global.sass`)
- **3D Graphics:** Three.js, @react-three/fiber, @react-three/drei
- **Animation:** motion
- **MDX:** next-mdx-remote, sugar-high
- **Icons:** @heroicons/react
- **Hosting/Deployment:** Vercel (auto-deploys from `master` branch)

## Development Environment Setup

_(Provide instructions or links to documentation on how to set up the local development environment.)_

- **Prerequisites:** Bun (https://bun.sh/)
- **Installation Steps:**
  1. `git clone https://github.com/anthonycoffey/coffey.codes.git`
  2. `cd coffey.codes`
  3. `bun install` (Uses `bun.lockb`)
- **Development Server:** `bun dev` (runs on port 3000)
- **Build:** `bun build`
- **Production Start:** `bun start`
- **Environment Variables:** None required for local development.

## Technical Constraints

_(Document any limitations or constraints affecting development.)_

- None specified.

## Key Dependencies

_(List critical external services or libraries the project relies on.)_

- None beyond those listed in `package.json`.

## Tool Usage Patterns

_(Describe how specific tools are used in the development workflow.)_

- **Linter:** ESLint (configured in `eslint.config.mjs`, uses `@typescript-eslint`, `eslint-config-next`, various plugins)
  - Run: `bun lint`
  - Fix: `bun lint:fix`
- **Formatter:** Prettier (configured in `.prettierrc`)
- **Version Control:** Git
  - **Strategy:** Trunk-based development. Feature/bugfix branches created from `master`, merged back, and deleted.
  - **Conventions:** Standard Git commit messages.
  - **Repository:** https://github.com/anthonycoffey/coffey.codes
- **Testing:** No specific testing framework or strategy currently planned or in use.
- **Package Manager:** Bun (Indicated by the presence of `bun.lockb`)
