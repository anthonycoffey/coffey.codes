import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark' }),
}))

const giscusCalls: Array<Record<string, unknown>> = []
vi.mock('@giscus/react', () => ({
  default: (props: Record<string, unknown>) => {
    giscusCalls.push(props)
    return <div data-testid="giscus-stub" />
  },
}))

import Comments from '@/components/Comments'

describe('Comments', () => {
  it('renders the Giscus widget inside an aria-labelled Comments section', () => {
    giscusCalls.length = 0
    const { container, getByTestId } = render(<Comments />)

    const section = container.querySelector('section[aria-label="Comments"]')
    expect(section).not.toBeNull()
    expect(getByTestId('giscus-stub')).toBeInTheDocument()
  })

  it('passes Giscus the configured repo/category and pathname mapping', () => {
    giscusCalls.length = 0
    render(<Comments />)

    expect(giscusCalls.length).toBeGreaterThan(0)
    const props = giscusCalls[0]
    expect(props.repo).toBe('anthonycoffey/coffey.codes')
    expect(props.repoId).toBe('R_kgDOKkWaSw')
    expect(props.category).toBe('General')
    expect(props.categoryId).toBe('DIC_kwDOKkWaS84C78m8')
    expect(props.mapping).toBe('pathname')
  })
})
