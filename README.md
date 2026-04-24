<div align="center">

# 👨‍💻 coffey.codes

**A high-performance, 3D-integrated portfolio and blog built for speed, SEO, and top-tier developer experience.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-Black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#license)

</div>

---

## ✨ Features

This repository is more than just a personal website—it is a playground for bleeding-edge web technologies, meticulous software architecture, and immersive 3D web experiences.

- ⚡ **Extreme Performance:** Optimized for small bundles, rapid compile times, and scored with Vercel Speed Insights & Web Analytics.
- 🎨 **Immersive 3D & Animation:** Powered by `@react-three/fiber`, `@react-three/postprocessing`, `gsap`, and `motion` for fluid, interactive visuals.
- 📝 **Modern Content Pipeline:** Full MDX and Markdown support for blogging, with beautiful syntax highlighting powered by `sugar-high`.
- 🔍 **Technical SEO:** Fully automated sitemaps, `robots.txt`, JSON-LD schema generation, and dynamic OpenGraph (OG) images.
- 💅 **Styling & Typography:** Styled with Tailwind CSS, utilizing the sleek, highly-legible Geist font.
- 🧪 **Enterprise Testing:** Comprehensive testing suite featuring Vitest for unit tests and Playwright for E2E.

---

## 🏗️ Architecture & Engineering Standards

This project is built to production-grade enterprise standards, showcasing strict architectural discipline. 

### 📚 Documentation Driven
The [`/docs`](./docs/README.md) directory is the single source of truth for the project. It houses:
- **Architecture Decision Records (ADRs)**
- AI Agent Briefs for seamless Claude integration
- Detailed Spec lifecycles (`draft` → `ready` → `in-progress` → `complete`)

### 🔄 DDD + TDD Workflow
Development follows a rigorous Domain-Driven and Test-Driven approach:
1. **Plan & Spec:** Define unknowns and draft specifications.
2. **Review:** Ensure readiness before writing a single line of code.
3. **Test (RED):** Write failing tests first.
4. **Implement (GREEN):** Write the code to pass the tests.
5. **Refactor:** Clean the codebase while maintaining green tests.

> 💡 **Explore the Architecture:** Check out the [Documentation Hub](./docs/README.md) for a deep dive into the engineering practices.

---

## 🚀 Quick Start

Want to run the codebase locally? Follow these steps:

### Prerequisites
- Node.js `>=24.0.0`
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/anthonycoffey/coffey.codes.git

# Navigate into the project
cd coffey.codes

# Install dependencies
npm install
```

### Development Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Starts the local development server at `http://localhost:3000` |
| `npm run build` | Builds the application for production |
| `npm run lint` | Runs ESLint across the codebase |
| `npm run test` | Executes unit tests via Vitest |
| `npm run test:e2e`| Runs End-to-End tests via Playwright |
| `npm run typecheck`| Runs TypeScript compiler checks |

---

## 👨‍💻 Author

**Anthony Coffey**
- 🌐 [coffey.codes](https://coffey.codes)
- 🐙 [GitHub](https://github.com/anthonycoffey)

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE) - see the LICENSE file for details.