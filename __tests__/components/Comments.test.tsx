import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock next-themes so the component is deterministic
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark' }),
}))

// Mock @giscus/react with a stub that records the props it was called with
const giscusCalls: Array<Record<string, unknown>> = []
vi.mock('@giscus/react', () => ({
  default: (props: Record<string, unknown>) => {
    giscusCalls.push(props)
    return <div data-testid="giscus-stub" />
  },
}))

const ENV_KEYS = [
  'NEXT_PUBLIC_GISCUS_REPO',
  'NEXT_PUBLIC_GISCUS_REPO_ID',
  'NEXT_PUBLIC_GISCUS_CATEGORY',
  'NEXT_PUBLIC_GISCUS_CATEGORY_ID',
] as const

describe('Comments', () => {
  const original: Record<string, string | undefined> = {}

  beforeEach(() => {
    giscusCalls.length = 0
    for (const k of ENV_KEYS) {
      original[k] = process.env[k]
    }
    vi.resetModules()
  })

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (original[k] === undefined) delete process.env[k]
      else process.env[k] = original[k]
    }
  })

  it('renders nothing when Giscus env vars are not configured', async () => {
    for (const k of ENV_KEYS) delete process.env[k]
    const Comments = (await import('@/components/Comments')).default
    const { container } = render(<Comments />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders Giscus inside an aria-labelled Comments section when env vars are set', async () => {
    process.env.NEXT_PUBLIC_GISCUS_REPO = 'owner/repo'
    process.env.NEXT_PUBLIC_GISCUS_REPO_ID = 'R_test'
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY = 'General'
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID = 'DIC_test'

    const Comments = (await import('@/components/Comments')).default
    const { container, getByTestId } = render(<Comments />)

    const section = container.querySelector('section[aria-label="Comments"]')
    expect(section).not.toBeNull()
    expect(getByTestId('giscus-stub')).toBeInTheDocument()
  })

  it('passes Giscus the env-configured repo/category and pathname mapping', async () => {
    process.env.NEXT_PUBLIC_GISCUS_REPO = 'owner/repo'
    process.env.NEXT_PUBLIC_GISCUS_REPO_ID = 'R_test'
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY = 'General'
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID = 'DIC_test'

    const Comments = (await import('@/components/Comments')).default
    render(<Comments />)

    expect(giscusCalls.length).toBeGreaterThan(0)
    const props = giscusCalls[0]
    expect(props.repo).toBe('owner/repo')
    expect(props.repoId).toBe('R_test')
    expect(props.category).toBe('General')
    expect(props.categoryId).toBe('DIC_test')
    expect(props.mapping).toBe('pathname')
  })
})
