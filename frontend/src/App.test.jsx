import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from './App.jsx'

it('renders without crashing', () => {
  const { container } = render(<App />)
  expect(container.firstChild).not.toBeNull()
})

it('allows typing a letter into a grid square', () => {
  render(<App />)
  const input = screen.getAllByRole('textbox')[0]

  fireEvent.change(input, { target: { value: 'a' } })

  expect(input.value).toBe('A')
})
