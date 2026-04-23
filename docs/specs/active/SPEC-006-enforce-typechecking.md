# SPEC-006: Enforce Typechecking in CI/CD

## Overview
Currently, the CI pipeline on GitHub Actions runs linting and testing but does not perform TypeScript typechecking. As a result, code with type errors can pass CI and break during the build and deployment process. This spec outlines the resolution of existing type errors and the enforcement of strict typechecking in the CI/CD pipeline.

## Status
`review-pending`

## Context & Rationale
Running `npx tsc` currently outputs 35 type errors across 12 files. These were not caught because `npm run typecheck` doesn't exist, and the CI test workflow only runs ESLint, Vitest, and Playwright. Adding typecheck to the CI ensures enterprise-grade best practices and catches compilation issues before code gets merged.

## Requirements
1. **Resolve Type Errors**:
   - `tsconfig.json`: Add types for `@testing-library/jest-dom` and `vitest/globals` to fix missing matcher types.
   - `__tests__/canvas/CameraRig.test.tsx`: Fix strict null check on `capturedFrameCb`.
   - `components/canvas/objects/Spaceship.tsx`: Cast `null` to `any` in `args` array for `instancedMesh` to satisfy `@react-three/fiber` strict types.
2. **Add NPM Script**:
   - Add `"typecheck": "tsc --noEmit"` to `package.json` scripts.
3. **Harden CI Workflow**:
   - Add a `typecheck` job to `.github/workflows/test.yml` that runs parallel to lint, unit, and e2e jobs. The step should execute `npm run typecheck`.
