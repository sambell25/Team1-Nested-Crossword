// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatTime } from '../hooks/useStopwatch'
import Timer from './Timer'

describe('formatTime', () => {
  it('formats minutes and seconds', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(65)).toBe('01:05')
    expect(formatTime(3599)).toBe('59:59')
  })

  it('adds hours once past an hour', () => {
    expect(formatTime(3600)).toBe('1:00:00')
    expect(formatTime(3661)).toBe('1:01:01')
  })
})

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
        'Date',
      ],
    })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  const advance = (ms) => act(() => vi.advanceTimersByTime(ms))
  const display = () => screen.getByRole('timer').textContent

  it('starts at zero and counts up', () => {
    render(<Timer />)
    expect(display()).toBe('00:00')

    advance(3000)
    expect(display()).toBe('00:03')

    advance(62_000)
    expect(display()).toBe('01:05')
  })

  it('stops while paused and continues from where it left off', () => {
    render(<Timer />)
    advance(2000)

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    advance(10_000)
    expect(display()).toBe('00:02')

    fireEvent.click(screen.getByRole('button', { name: 'Resume' }))
    advance(3000)
    expect(display()).toBe('00:05')
  })

  it('catches up when timer callbacks are delayed', () => {
    render(<Timer />)
    // Simulate a throttled background tab: the clock moves on but the
    // interval doesn't fire, then a single tick arrives.
    act(() => vi.setSystemTime(Date.now() + 90_000))
    advance(250)
    expect(display()).toBe('01:30')
  })
})
