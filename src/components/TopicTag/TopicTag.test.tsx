import { fireEvent, render, screen } from '@solidjs/testing-library'
import { TopicTag } from './TopicTag'
import styles from './TopicTag.module.css'

describe('TopicTag', () => {
  it('renders an <a> by default', () => {
    const { container } = render(() => <TopicTag href="#">test</TopicTag>)

    expect(container.firstChild?.nodeName).toBe('A')
    expect(screen.getByRole('link', { name: 'test' })).toBeInTheDocument()
    expect(container.firstChild).toHaveClass(styles.TopicTag)
  })

  it('supports button semantics through the as prop', () => {
    const onClick = vi.fn()
    render(() => (
      <TopicTag as="button" onClick={onClick}>
        test
      </TopicTag>
    ))

    fireEvent.click(screen.getByRole('button', { name: 'test' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('accepts class and className', () => {
    const { container } = render(() => (
      <TopicTag class="solid-class" className="react-class">
        test
      </TopicTag>
    ))

    expect(container.firstChild).toHaveClass('solid-class')
    expect(container.firstChild).toHaveClass('react-class')
  })

  it('applies additional props to the outermost element', () => {
    const { container } = render(() => (
      <TopicTag data-testid="test" id="test-id">
        test
      </TopicTag>
    ))

    expect(container.firstChild).toHaveAttribute('data-testid', 'test')
    expect(container.firstChild).toHaveAttribute('id', 'test-id')
  })
})
