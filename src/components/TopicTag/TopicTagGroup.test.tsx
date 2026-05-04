import { render } from '@solidjs/testing-library'
import { TopicTag } from './TopicTag'
import styles from './TopicTagGroup.module.css'

describe('TopicTag.Group', () => {
  it('renders with the TopicTagGroup class', () => {
    const { container } = render(() => <TopicTag.Group>test</TopicTag.Group>)

    expect(container.firstChild?.nodeName).toBe('DIV')
    expect(container.firstChild).toHaveClass(styles.TopicTagGroup)
  })

  it('accepts class and className', () => {
    const { container } = render(() => (
      <TopicTag.Group class="solid-class" className="react-class">
        test
      </TopicTag.Group>
    ))

    expect(container.firstChild).toHaveClass('solid-class')
    expect(container.firstChild).toHaveClass('react-class')
  })

  it('applies additional props to the outermost element', () => {
    const { container } = render(() => (
      <TopicTag.Group data-testid="test" id="test-id">
        test
      </TopicTag.Group>
    ))

    expect(container.firstChild).toHaveAttribute('data-testid', 'test')
    expect(container.firstChild).toHaveAttribute('id', 'test-id')
  })
})
