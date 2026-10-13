import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from './App.jsx'

it('renders without crashing', () => {
  const { container } = render(<App />)
  expect(container.firstChild).not.toBeNull()
})
