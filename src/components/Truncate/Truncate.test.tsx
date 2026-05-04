import { render } from '@solidjs/testing-library'
import { Truncate } from './Truncate'
import styles from './Truncate.module.css'

describe('Truncate', () => {
  it('renders a <div> by default', () => {
    const { container } = render(() => <Truncate title="a-long-branch-name" />)

    expect(container.firstChild?.nodeName).toBe('DIV')
    expect(container.firstChild).toHaveClass(styles.Truncate)
  })

  it('respects the maxWidth prop', () => {
    const { container } = render(() => (
      <Truncate maxWidth={250} title="a-long-branch-name" />
    ))

    expect(container.firstChild).toHaveStyle('--truncate-max-width: 250px')
  })

  it('respects the inline prop', () => {
    const { container } = render(() => (
      <Truncate inline title="a-long-branch-name" />
    ))

    expect(container.firstChild).toHaveAttribute('data-inline', 'true')
  })

  it('accepts class and className', () => {
    const { container } = render(() => (
      <Truncate
        class="solid-class"
        className="react-class"
        title="a-long-branch-name"
      />
    ))

    expect(container.firstChild).toHaveClass('solid-class')
    expect(container.firstChild).toHaveClass('react-class')
  })

  it('renders as a different element when as prop is provided', () => {
    const { container } = render(() => (
      <Truncate as="span" title="a-long-branch-name" />
    ))

    expect(container.firstChild?.nodeName).toBe('SPAN')
  })
})
