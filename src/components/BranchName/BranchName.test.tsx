import { render } from '@solidjs/testing-library'
import { BranchName } from './BranchName'
import styles from './BranchName.module.css'

describe('BranchName', () => {
  it('renders an <a> by default', () => {
    const { container } = render(() => <BranchName />)

    expect(container.firstChild?.nodeName).toBe('A')
  })

  it('accepts class and className', () => {
    const { container } = render(() => (
      <BranchName class="solid-class" className="react-class" />
    ))

    expect(container.firstChild).toHaveClass(styles.BranchName)
    expect(container.firstChild).toHaveClass('solid-class')
    expect(container.firstChild).toHaveClass('react-class')
  })

  it('renders as a different element when as prop is provided', () => {
    const { container } = render(() => <BranchName as="span">main</BranchName>)

    expect(container.firstChild?.nodeName).toBe('SPAN')
  })
})
