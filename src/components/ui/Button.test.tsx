import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button component', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loader when loading is true', () => {
    render(<Button loading>Submit</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    // Loader2 icon adds 'animate-spin' class
    const button = screen.getByRole('button')
    expect(button.querySelector('.animate-spin')).toBeInTheDocument()
  })
})
