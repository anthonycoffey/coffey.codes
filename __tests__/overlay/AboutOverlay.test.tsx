import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AboutOverlay from '@/components/overlay/AboutOverlay'

describe('AboutOverlay', () => {
  it('renders the lead line', () => {
    render(<AboutOverlay visible={true} />)
    expect(screen.getByText(/Musician\. Director\. Engineer\. Actor\./)).toBeInTheDocument()
  })

  it('renders the body line', () => {
    render(<AboutOverlay visible={true} />)
    expect(screen.getByText(/Austin, Texas/)).toBeInTheDocument()
  })
})
