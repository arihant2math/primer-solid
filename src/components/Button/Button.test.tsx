import { createSignal } from 'solid-js'
import { fireEvent, render, screen } from '@solidjs/testing-library'
import { vi } from 'vitest'
import { Button } from './Button'
import { ButtonBase } from './ButtonBase'
import { IconButton } from './IconButton'
import styles from './ButtonBase.module.css'

const LeadingVisual = () => <span data-testid="leading-visual">Lead</span>
const TrailingVisual = () => <span data-testid="trailing-visual">Trail</span>
const TrailingAction = () => <span data-testid="trailing-action">Action</span>
const Icon = () => <svg data-testid="icon" />

function StatefulLoadingButton(
  props: {
    children?: string
    id?: string
    'aria-describedby'?: string
    loadingAnnouncement?: string
  } = {},
) {
  const [loading, setLoading] = createSignal(false)

  return (
    <Button loading={loading()} onClick={() => setLoading(true)} {...props} />
  )
}

describe('Button', () => {
  it('renders a button by default and forwards refs', () => {
    let element: HTMLButtonElement | undefined

    const { container } = render(() => (
      <Button ref={(node) => (element = node as HTMLButtonElement)}>Default</Button>
    ))

    expect(container.firstChild?.nodeName).toBe('BUTTON')
    expect(container.firstChild).toHaveClass(styles.ButtonBase)
    expect(element).toBeInstanceOf(HTMLButtonElement)
  })

  it('accepts class and className', () => {
    const { container } = render(() => (
      <Button class="solid-class" className="react-class">
        Classes
      </Button>
    ))

    expect(container.firstChild).toHaveClass('solid-class')
    expect(container.firstChild).toHaveClass('react-class')
  })

  it('renders visuals and count in the correct positions', () => {
    render(() => (
      <Button
        leadingVisual={LeadingVisual}
        trailingVisual={TrailingVisual}
        trailingAction={TrailingAction}
        count={3}
      >
        Content
      </Button>
    ))

    const text = screen.getByText('Content')
    const leading = screen.getByTestId('leading-visual')
    const trailing = screen.getByTestId('trailing-visual')
    const action = screen.getByTestId('trailing-action')

    expect(leading.closest('[data-component]')).toHaveAttribute(
      'data-component',
      'leadingVisual',
    )
    expect(trailing.closest('[data-component]')).toHaveAttribute(
      'data-component',
      'trailingVisual',
    )
    expect(action.closest('[data-component]')).toHaveAttribute(
      'data-component',
      'trailingAction',
    )
    expect(text.compareDocumentPosition(leading)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    )
    expect(text.compareDocumentPosition(trailing)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(screen.queryByText('3')).not.toBeInTheDocument()
  })

  it('renders a trailing counter when no trailing visual is provided', () => {
    const { container } = render(() => <Button count={5}>Notifications</Button>)

    expect(
      container.querySelector('[data-component="ButtonCounter"]'),
    ).toBeInTheDocument()
    expect(container.firstChild).toHaveAttribute('data-has-count', 'true')
  })

  it('supports block, labelWrap, inactive, size, alignContent, and link variant data attributes', () => {
    const { container } = render(() => (
      <Button
        block
        labelWrap
        inactive
        size="large"
        alignContent="start"
        variant="link"
      >
        Wrapped label
      </Button>
    ))

    const button = container.querySelector('button')
    const content = container.querySelector('[data-component="buttonContent"]')

    expect(button).toHaveAttribute('data-block', 'block')
    expect(button).toHaveAttribute('data-label-wrap', 'true')
    expect(button).toHaveAttribute('data-inactive', 'true')
    expect(button).toHaveAttribute('data-size', 'large')
    expect(button).toHaveAttribute('data-variant', 'link')
    expect(content).toHaveAttribute('data-align', 'start')
  })

  it('describes the button with the loading announcement and preserves its accessible name', () => {
    render(() => <StatefulLoadingButton id="loading-button">Content</StatefulLoadingButton>)

    const button = screen.getByRole('button', { name: 'Content' })
    fireEvent.click(button)

    expect(button).toHaveAccessibleName('Content')
    expect(button).toHaveAttribute(
      'aria-describedby',
      'loading-button-loading-announcement',
    )
    expect(button).toHaveAttribute('aria-labelledby')
    expect(document.getElementById('loading-button-loading-announcement')).toHaveTextContent(
      'Loading',
    )
  })

  it('merges loading announcement with a passed aria-describedby value', () => {
    render(() => (
      <StatefulLoadingButton id="loading-button" aria-describedby="other-description">
        Content
      </StatefulLoadingButton>
    ))

    const button = screen.getByRole('button', { name: 'Content' })
    fireEvent.click(button)

    expect(button.getAttribute('aria-describedby')).toContain(
      'loading-button-loading-announcement',
    )
    expect(button.getAttribute('aria-describedby')).toContain(
      'other-description',
    )
  })

  it('disables clicks while loading and sets aria-disabled unless overridden', () => {
    const handleClick = vi.fn()

    const first = render(() => <Button onClick={handleClick}>Load</Button>)

    fireEvent.click(screen.getByRole('button', { name: 'Load' }))
    expect(handleClick).toHaveBeenCalledTimes(1)

    first.unmount()

    const second = render(() => (
      <Button loading onClick={handleClick}>
        Load
      </Button>
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Load' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Load' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )

    second.unmount()

    render(() => (
      <Button loading aria-disabled={false}>
        Load
      </Button>
    ))

    expect(screen.getByRole('button', { name: 'Load' })).toHaveAttribute(
      'aria-disabled',
      'false',
    )
  })

  it('renders the loading wrapper for defined loading states and uses the link wrapper class', () => {
    const first = render(() => <Button loading={false}>Content</Button>)
    expect(first.container.querySelector('[data-loading-wrapper]')).toBeInTheDocument()

    first.unmount()

    const second = render(() => (
      <Button variant="link" loading>
        Content
      </Button>
    ))

    expect(second.container.querySelector('[data-loading-wrapper]')).toHaveClass(
      styles.ConditionalWrapperLink,
    )
    expect(
      second.container.querySelector('[data-component="loadingSpinner"]'),
    ).toBeInTheDocument()
  })

  it('sets stable data-component attributes', () => {
    const { container } = render(() => (
      <Button leadingVisual={LeadingVisual} trailingAction={TrailingAction}>
        Click me
      </Button>
    ))

    expect(container.querySelector('[data-component="Button"]')).toBeInTheDocument()
    expect(
      container.querySelector('[data-component="buttonContent"]'),
    ).toBeInTheDocument()
    expect(container.querySelector('[data-component="text"]')).toBeInTheDocument()
    expect(
      container.querySelector('[data-component="leadingVisual"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-component="trailingAction"]'),
    ).toBeInTheDocument()
  })
})

describe('IconButton', () => {
  it('renders an icon-only button with the IconButton data-component and class', () => {
    const { container } = render(() => (
      <IconButton icon={Icon} aria-label="Search" />
    ))

    const button = screen.getByRole('button', { name: 'Search' })

    expect(button).toHaveAttribute('data-component', 'IconButton')
    expect(button).toHaveClass(styles.IconButton)
    expect(container.querySelector('[data-testid="icon"]')).toBeInTheDocument()
  })

  it('uses the generated tooltip content to label the button by default', () => {
    render(() => <IconButton icon={Icon} aria-label="Favorite" />)

    const button = screen.getByRole('button', { name: 'Favorite' })
    const tooltipId = button.getAttribute('aria-labelledby')

    expect(tooltipId).toBeTruthy()
    expect(document.getElementById(tooltipId as string)).toHaveTextContent('Favorite')
    expect(button).not.toHaveAttribute('aria-label')
  })

  it('uses the tooltip content as an accessible description when description is provided', () => {
    render(() => (
      <IconButton
        icon={Icon}
        aria-label="Notifications"
        description="You have no unread notifications."
      />
    ))

    const button = screen.getByRole('button', { name: 'Notifications' })
    const describedBy = button.getAttribute('aria-describedby')
    const describedByIds = describedBy?.split(' ')
    const tooltipId = describedByIds?.[describedByIds.length - 1]

    expect(button).toHaveAttribute('aria-label', 'Notifications')
    expect(tooltipId).toBeTruthy()
    expect(document.getElementById(tooltipId as string)).toHaveTextContent(
      'You have no unread notifications.',
    )
    expect(button).toHaveAccessibleDescription('You have no unread notifications.')
  })

  it('does not generate a tooltip relationship when disabled or explicitly opted out', () => {
    const first = render(() => (
      <IconButton icon={Icon} aria-label="Disabled" disabled />
    ))

    const disabledButton = screen.getByRole('button', { name: 'Disabled' })
    expect(disabledButton).toHaveAttribute('aria-label', 'Disabled')
    expect(disabledButton).not.toHaveAttribute('aria-labelledby')
    expect(first.container.querySelector(`.${styles.IconButtonTooltipWrapper}`)).not.toBeInTheDocument()

    first.unmount()

    render(() => (
      <IconButton icon={Icon} aria-label="Opt out" unsafeDisableTooltip />
    ))

    const optOutButton = screen.getByRole('button', { name: 'Opt out' })
    expect(optOutButton).toHaveAttribute('aria-label', 'Opt out')
    expect(optOutButton).not.toHaveAttribute('aria-labelledby')
  })

  it('passes aria-keyshortcuts through when tooltip labeling is active', () => {
    render(() => (
      <IconButton icon={Icon} aria-label="Bold" keyshortcuts="Mod+B" />
    ))

    const button = screen.getByRole('button', { name: 'Bold (Mod+B)' })

    expect(button).toHaveAttribute('aria-keyshortcuts', 'Mod+B')
  })
})

describe('ButtonBase', () => {
  it('renders as an anchor when requested', () => {
    const { container } = render(() => (
      <ButtonBase as="a" href="/pulls">
        Pull requests
      </ButtonBase>
    ))

    expect(container.firstChild?.nodeName).toBe('A')
    expect(container.firstChild).toHaveAttribute('href', '/pulls')
  })

  it('warns when rendered as a non-semantic element', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(() => <ButtonBase as="i">Invalid</ButtonBase>)

    expect(consoleSpy).toHaveBeenCalledWith(
      'This component should be an instanceof a semantic button or anchor',
    )

    consoleSpy.mockRestore()
  })
})
