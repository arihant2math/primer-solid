import { render, screen } from '@solidjs/testing-library'
import BaseStyles from './BaseStyles'
import styles from './BaseStyles.module.css'

describe('BaseStyles', () => {
  it('renders a div by default with stable attributes', () => {
    const { container } = render(() => <BaseStyles>Primer</BaseStyles>)
    const root = container.firstChild as HTMLElement

    expect(root.nodeName).toBe('DIV')
    expect(root).toHaveClass(styles.BaseStyles)
    expect(root).toHaveAttribute('data-component', 'BaseStyles')
    expect(root).toHaveAttribute('data-portal-root')
  })

  it('supports as, className, and color props', () => {
    render(() => (
      <BaseStyles as="main" class="solid-class" className="react-class" color="rebeccapurple">
        Content
      </BaseStyles>
    ))

    const root = screen.getByRole('main')

    expect(root).toHaveClass('solid-class')
    expect(root).toHaveClass('react-class')
    expect(root.style.getPropertyValue('--BaseStyles-fgColor')).toBe(
      'rebeccapurple',
    )
  })
})
