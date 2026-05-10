import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '..', '..');

describe('MDX registry — bundle isolation', () => {
  it('components/mdx.tsx does not statically reference 3D scene components in the global registry', () => {
    const src = readFileSync(
      resolve(root, 'components', 'mdx.tsx'),
      'utf8',
    );
    // The global components map must not export 3D scenes — they
    // must be opted into per-article so non-3D articles don't ship
    // dynamic-import wrappers for three.js / @react-three/* code.
    expect(src).not.toMatch(/\bThreeScene\b/);
    expect(src).not.toMatch(/\bFishbowlScene\b/);
    expect(src).not.toMatch(/\bSceneExplorer\b/);
  });

  it('components/mdx-clients.tsx does not import 3D scene modules', () => {
    const src = readFileSync(
      resolve(root, 'components', 'mdx-clients.tsx'),
      'utf8',
    );
    expect(src).not.toMatch(/['"]\.\/ThreeScene['"]/);
    expect(src).not.toMatch(/['"]\.\/FishbowlScene['"]/);
    expect(src).not.toMatch(/['"]\.\/SceneExplorer['"]/);
  });

  it('components/mdx-scene-clients.tsx exists and exports the scene components', () => {
    const src = readFileSync(
      resolve(root, 'components', 'mdx-scene-clients.tsx'),
      'utf8',
    );
    expect(src).toMatch(/ThreeScene/);
    expect(src).toMatch(/FishbowlScene/);
    expect(src).toMatch(/SceneExplorer/);
  });

  it('the one article that uses 3D scenes has its slug listed in the article page registry', () => {
    const src = readFileSync(
      resolve(root, 'app', '(site)', 'articles', '[slug]', 'page.tsx'),
      'utf8',
    );
    expect(src).toMatch(
      /building-interactive-3d-experiences-with-react-three-fiber/,
    );
  });
});
