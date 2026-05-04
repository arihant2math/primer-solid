import { fireEvent, render, screen } from '@solidjs/testing-library'
import { Button } from '../Button'
import { ButtonGroup } from './ButtonGroup'
import styles from './ButtonGroup.module.css'

describe('ButtonGroup', () => {
  it('renders a div by default and forwards refs', () => {
    let element: HTMLDivElement | undefined

    const { getByTestId } = render(() => (
      <ButtonGroup
        data-testid="button-group"
        ref={(node) => (element = node as HTMLDivElement)}
      />
    ))

    expect(getByTestId('button-group').tagName).toBe('DIV')
    expect(getByTestId('button-group')).toHaveClass(styles.ButtonGroup)
    expect(element).toBeInstanceOf(HTMLDivElement)
  })

  it('accepts class and className and respects role', () => {
    render(() => (
      <ButtonGroup class="solid-class" className="react-class" role="toolbar" />
    ))

    const toolbar = screen.getByRole('toolbar')

    expect(toolbar).toHaveClass('solid-class')
    expect(toolbar).toHaveClass('react-class')
  })

  it('wraps each child in its own element', () => {
    const { container } = render(() => (
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>
    ))

    const group = container.firstElementChild
    expect(group?.children).toHaveLength(2)
    expect(group?.children[0]?.querySelector('button')).toHaveTextContent('One')
    expect(group?.children[1]?.querySelector('button')).toHaveTextContent('Two')
  })

  it('moves focus horizontally and wraps when used as a toolbar', () => {
    render(() => (
      <ButtonGroup role="toolbar">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
    ))

    const one = screen.getByRole('button', { name: 'One' })
    const two = screen.getByRole('button', { name: 'Two' })
    const three = screen.getByRole('button', { name: 'Three' })

    one.focus()
    fireEvent.keyDown(one, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(two)

    fireEvent.keyDown(two, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(three)

    fireEvent.keyDown(three, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(one)

    fireEvent.keyDown(one, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(three)
  })

  it('does not move focus with arrow keys when not used as a toolbar', () => {
    render(() => (
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>
    ))

    const one = screen.getByRole('button', { name: 'One' })
    const two = screen.getByRole('button', { name: 'Two' })

    one.focus()
    fireEvent.keyDown(one, { key: 'ArrowRight' })

    expect(document.activeElement).toBe(one)
    expect(document.activeElement).not.toBe(two)
  })
})
