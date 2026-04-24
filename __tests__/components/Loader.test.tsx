import { render, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Loader from '@/components/Loader'

describe('Loader', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders initially with the loading overlay visible', () => {
    const { container } = render(<Loader />)
    const overlay = container.firstChild as HTMLElement
    expect(overlay).toHaveClass('opacity-100')
    expect(overlay).not.toHaveClass('opacity-0')
  })

  it('types out "Please wait..." character by character', () => {
    const { getByText, queryByText } = render(<Loader />)

    // Initially, text is empty
    expect(queryByText('Please wait...')).not.toBeInTheDocument()

    // Fast-forward 500ms -> should have typed "Pleas"
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(getByText(/Pleas/)).toBeInTheDocument()

    // Fast-forward past the total typing time (14 chars * 100ms = 1400ms)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(getByText(/Please wait\.\.\./)).toBeInTheDocument()
  })

  it('toggles cursor from solid to blinking after typing completes', () => {
    const { container } = render(<Loader />)
    const cursor = container.querySelector('span')
    
    // Initially solid (no animate-blink class)
    expect(cursor).not.toHaveClass('animate-blink')

    // Fast forward past typing completion (1400ms+)
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    // Now it should blink
    expect(cursor).toHaveClass('animate-blink')
  })

  it('fades out completely after 2600ms', () => {
    const { container } = render(<Loader />)
    const overlay = container.firstChild as HTMLElement

    // Before timeout
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(overlay).toHaveClass('opacity-100')

    // After timeout
    act(() => {
      vi.advanceTimersByTime(700)
    })
    expect(overlay).toHaveClass('opacity-0')
    expect(overlay).toHaveClass('pointer-events-none')
  })
})
