import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CraftOverlay from '@/components/overlay/CraftOverlay'

describe('CraftOverlay', () => {
  it('renders the lead line', () => {
    render(<CraftOverlay visible={true} />)
    expect(screen.getByText(/The process is supposed to be messy/)).toBeInTheDocument()
  })

  it('renders the body line', () => {
    render(<CraftOverlay visible={true} />)
    expect(screen.getByText(/Chaos is fine/)).toBeInTheDocument()
  })
})
