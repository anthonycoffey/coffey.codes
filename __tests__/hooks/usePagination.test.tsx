import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}))

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { usePagination } from '@/hooks/usePagination'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any)
  vi.mocked(usePathname).mockReturnValue('/articles')
  vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
})

describe('usePagination', () => {
  it('defaults to page 1 when no ?page param', () => {
    const { result } = renderHook(() => usePagination(5))
    expect(result.current.currentPage).toBe(1)
  })

  it('reads initial page from ?page search param', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=3') as any)
    const { result } = renderHook(() => usePagination(5))
    expect(result.current.currentPage).toBe(3)
  })

  it('isFirstPage is true on page 1', () => {
    const { result } = renderHook(() => usePagination(5))
    expect(result.current.isFirstPage).toBe(true)
  })

  it('isFirstPage is false on page 2+', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=2') as any)
    const { result } = renderHook(() => usePagination(5))
    expect(result.current.isFirstPage).toBe(false)
  })

  it('isLastPage is true on the last page', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=5') as any)
    const { result } = renderHook(() => usePagination(5))
    expect(result.current.isLastPage).toBe(true)
  })

  it('hasNextPage is false on the last page', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=5') as any)
    const { result } = renderHook(() => usePagination(5))
    expect(result.current.hasNextPage).toBe(false)
  })

  it('hasNextPage is true on non-last pages', () => {
    const { result } = renderHook(() => usePagination(5))
    expect(result.current.hasNextPage).toBe(true)
  })

  it('hasPrevPage is false on page 1', () => {
    const { result } = renderHook(() => usePagination(5))
    expect(result.current.hasPrevPage).toBe(false)
  })

  it('hasPrevPage is true on page 2+', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=2') as any)
    const { result } = renderHook(() => usePagination(5))
    expect(result.current.hasPrevPage).toBe(true)
  })

  it('changePage navigates to ?page=N for N > 1', () => {
    const { result } = renderHook(() => usePagination(5))
    act(() => {
      result.current.changePage(2)
    })
    expect(mockPush).toHaveBeenCalledWith('/articles?page=2')
  })

  it('changePage removes ?page param when navigating to page 1', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('page=3') as any)
    const { result } = renderHook(() => usePagination(5))
    act(() => {
      result.current.changePage(1)
    })
    expect(mockPush).toHaveBeenCalledWith('/articles')
  })

  it('changePage ignores page < 1', () => {
    const { result } = renderHook(() => usePagination(5))
    act(() => {
      result.current.changePage(0)
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('changePage ignores page > totalPages', () => {
    const { result } = renderHook(() => usePagination(5))
    act(() => {
      result.current.changePage(6)
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('exposes totalPages from the argument', () => {
    const { result } = renderHook(() => usePagination(7))
    expect(result.current.totalPages).toBe(7)
  })
})
