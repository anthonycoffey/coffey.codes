import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDate } from '@/utils/date'

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns absolute formatted date by default', () => {
    expect(formatDate('2024-01-01')).toBe('Jan 1, 2024')
  })

  it('appends T00:00:00 to dates without a time component', () => {
    expect(formatDate('2024-06-15')).toBe('Jun 15, 2024')
  })

  it('handles dates that already include a time component', () => {
    expect(formatDate('2024-06-15T08:30:00')).toBe('Jun 15, 2024')
  })

  it('does not append relative suffix when includeRelative is false', () => {
    const result = formatDate('2024-01-01', false)
    expect(result).not.toContain('ago')
    expect(result).not.toContain('Today')
    expect(result).not.toContain('(')
  })

  it('returns Today for same-day date with includeRelative', () => {
    expect(formatDate('2024-06-15', true)).toContain('Today')
  })

  it('includes the absolute date even with includeRelative', () => {
    expect(formatDate('2024-06-15', true)).toMatch(/Jun 15, 2024/)
  })

  it('returns Xd ago for recent past days', () => {
    expect(formatDate('2024-06-10', true)).toContain('5d ago')
  })

  it('returns Xmo ago for dates in past months of same year', () => {
    expect(formatDate('2024-03-15', true)).toContain('3mo ago')
  })

  it('returns Xy ago for dates in past years', () => {
    expect(formatDate('2023-06-14', true)).toContain('1y ago')
  })

  it('formats relative string as "(X ago)" appended to absolute date', () => {
    const result = formatDate('2024-06-10', true)
    expect(result).toMatch(/Jun 10, 2024 \(5d ago\)/)
  })
})
