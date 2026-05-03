import { createSignal, type JSX } from 'solid-js'
import { fireEvent, render, screen } from '@solidjs/testing-library'
import { ActionList } from './ActionList'
import { Link } from '../Link'
import styles from './ActionList.module.css'
import groupStyles from './Group.module.css'
import headingStyles from './Heading.module.css'

function BookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
      <path d="M3 2.75A1.75 1.75 0 0 1 4.75 1h6.5A1.75 1.75 0 0 1 13 2.75v10.5A1.75 1.75 0 0 1 11.25 15h-6.5A1.75 1.75 0 0 1 3 13.25ZM4.5 2.5v11h6.75a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25Z" />
    </svg>
  )
}

function SelectableList() {
  const [selectedIndex, setSelectedIndex] = createSignal(0)

  return (
    <ActionList selectionVariant="single" role="listbox" aria-label="Projects">
      <ActionList.Item
        selected={selectedIndex() === 0}
        onSelect={() => setSelectedIndex(0)}
      >
        Primer React
      </ActionList.Item>
      <ActionList.Item
        selected={selectedIndex() === 1}
        onSelect={() => setSelectedIndex(1)}
      >
        Primer Solid
      </ActionList.Item>
      <ActionList.Item
        disabled
        selected={selectedIndex() === 2}
        onSelect={() => setSelectedIndex(2)}
      >
        Disabled
      </ActionList.Item>
      <ActionList.Item
        inactiveText="Unavailable due to an outage"
        selected={selectedIndex() === 3}
        onSelect={() => setSelectedIndex(3)}
      >
        Inactive
      </ActionList.Item>
      <ActionList.Item
        loading
        selected={selectedIndex() === 4}
        onSelect={() => setSelectedIndex(4)}
      >
        Loading
      </ActionList.Item>
    </ActionList>
  )
}

describe('ActionList', () => {
  it('renders a heading and labels the list with it', () => {
    const { container } = render(() => (
      <ActionList>
        <ActionList.Heading as="h2">Actions</ActionList.Heading>
        <ActionList.Item>Item</ActionList.Item>
      </ActionList>
    ))

    const heading = screen.getByRole('heading', { level: 2, name: 'Actions' })
    const list = container.querySelector('ul')

    expect(heading).toHaveClass(headingStyles.ActionListHeader)
    expect(list).toHaveAttribute('aria-labelledby', heading.id)
  })

  it('renders description inline by default and truncate as a div with a suppressed title', () => {
    const first = render(() => (
      <ActionList>
        <ActionList.Item>
          Item
          <ActionList.Description>Description</ActionList.Description>
        </ActionList.Item>
      </ActionList>
    ))

    let description = screen.getByText('Description')
    expect(description.tagName).toBe('SPAN')
    expect(description).toHaveClass(styles.Description)

    first.unmount()

    render(() => (
      <ActionList>
        <ActionList.Item>
          Item
          <ActionList.Description truncate>Description</ActionList.Description>
        </ActionList.Item>
      </ActionList>
    ))

    description = screen.getByText('Description')
    expect(description.tagName).toBe('DIV')
    expect(description).toHaveAttribute('title', '')
  })

  it('renders button-semantic items by default and applies disabled semantics', () => {
    const { container } = render(() => (
      <ActionList>
        <ActionList.Item disabled>Disabled item</ActionList.Item>
      </ActionList>
    ))

    const button = screen.getByRole('button', { name: 'Disabled item' })

    expect(container.querySelector('li')).toHaveClass(styles.ActionListItem)
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toHaveClass(styles.ActionListContent)
  })

  it('renders listbox items as list items with option roles', () => {
    const { container } = render(() => (
      <ActionList role="listbox" selectionVariant="single" aria-label="Choices">
        <ActionList.Item>First</ActionList.Item>
        <ActionList.Item>Second</ActionList.Item>
      </ActionList>
    ))

    const options = screen.getAllByRole('option')

    expect(options).toHaveLength(2)
    expect(options[0].tagName).toBe('LI')
    expect(options[0]).toHaveAttribute('tabindex', '0')
    expect(container.querySelector('button')).toBeNull()
  })

  it('fires onSelect on click and keypress, but skips disabled, inactive, and loading items', () => {
    render(() => <SelectableList />)

    const options = screen.getAllByRole('option')

    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(options[1])
    expect(options[1]).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyPress(options[0], { key: 'Enter', charCode: 13 })
    expect(options[0]).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(options[2])
    expect(options[2]).toHaveAttribute('aria-selected', 'false')

    fireEvent.click(options[3])
    expect(options[3]).toHaveAttribute('aria-selected', 'false')
    expect(options[3]).toHaveAccessibleDescription(
      'Unavailable due to an outage',
    )

    fireEvent.keyPress(options[4], { key: ' ', charCode: 32 })
    expect(options[4]).toHaveAttribute('aria-selected', 'false')
  })

  it('moves focus with arrow keys in focus-zone roles', () => {
    render(() => (
      <ActionList role="listbox" selectionVariant="single" aria-label="Choices">
        <ActionList.Item>One</ActionList.Item>
        <ActionList.Item>Two</ActionList.Item>
        <ActionList.Item>Three</ActionList.Item>
      </ActionList>
    ))

    const options = screen.getAllByRole('option')
    options[0].focus()

    fireEvent.keyDown(options[0], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(options[1])

    fireEvent.keyDown(options[1], { key: 'End' })
    expect(document.activeElement).toBe(options[2])

    fireEvent.keyDown(options[2], { key: 'Home' })
    expect(document.activeElement).toBe(options[0])
  })

  it('renders inactive indicators with an accessible description in plain lists', () => {
    render(() => (
      <ActionList>
        <ActionList.Item inactiveText="Unavailable due to an outage">
          Inactive item
        </ActionList.Item>
      </ActionList>
    ))

    const indicator = screen.getByRole('button', { name: 'Inactive item' })
    expect(indicator).toHaveAccessibleDescription(
      'Unavailable due to an outage',
    )
    expect(screen.getByText('Unavailable due to an outage')).toBeInTheDocument()
  })

  it('renders link items as anchors by default', () => {
    render(() => (
      <ActionList>
        <ActionList.LinkItem href="#home">Home</ActionList.LinkItem>
      </ActionList>
    ))

    const link = screen.getByRole('link', { name: 'Home' })
    expect(link).toHaveAttribute('href', '#home')
  })

  it('supports polymorphic link items via Link and forwards extra props', () => {
    render(() => (
      <ActionList>
        <ActionList.LinkItem
          as={Link}
          href="#docs"
          data-testid="docs-link"
          inline
        >
          Docs
        </ActionList.LinkItem>
      </ActionList>
    ))

    const link = screen.getByTestId('docs-link')
    expect(link).toHaveAttribute('href', '#docs')
    expect(link).toHaveAttribute('data-inline', 'true')
  })

  it('renders trailing actions as buttons and links', () => {
    const first = render(() => (
      <ActionList>
        <ActionList.Item>
          Item
          <ActionList.TrailingAction
            icon={BookIcon}
            label="Open"
            data-testid="trailing-action"
          />
        </ActionList.Item>
      </ActionList>
    ))

    expect(screen.getByTestId('trailing-action')).toHaveAccessibleName('Open')

    first.unmount()

    const second = render(() => (
      <ActionList>
        <ActionList.Item>
          Item
          <ActionList.TrailingAction as="a" href="#docs" label="Docs" />
        </ActionList.Item>
      </ActionList>
    ))

    expect(
      second.container.querySelector('a[href="#docs"]'),
    ).toHaveAccessibleName('Docs')
  })

  it('infers tab roles from tablist containers', () => {
    render(() => (
      <ActionList role="tablist" aria-label="Tabs">
        <ActionList.Item>Tab 1</ActionList.Item>
        <ActionList.Item>Tab 2</ActionList.Item>
      </ActionList>
    ))

    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

  it('renders groups with semantic headings and labels nested lists', () => {
    const { container } = render(() => (
      <ActionList>
        <ActionList.Heading as="h1">Heading</ActionList.Heading>
        <ActionList.Group data-testid="group">
          <ActionList.GroupHeading as="h2">
            Group Heading
          </ActionList.GroupHeading>
          <ActionList.Item>Item</ActionList.Item>
        </ActionList.Group>
      </ActionList>
    ))

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Group Heading',
    })
    const nestedList = container.querySelector('[data-testid="group"] > ul')

    expect(heading).toHaveClass(groupStyles.GroupHeading)
    expect(nestedList).toHaveAttribute('aria-labelledby', heading.id)
  })

  it('renders representational group headings for listbox roles', () => {
    render(() => (
      <ActionList role="listbox" aria-label="Choices">
        <ActionList.Group>
          <ActionList.GroupHeading>Group Heading</ActionList.GroupHeading>
          <ActionList.Item>Item</ActionList.Item>
        </ActionList.Group>
      </ActionList>
    ))

    const label = screen.getByText('Group Heading')
    expect(label.tagName).toBe('SPAN')
    expect(label.parentElement).toHaveAttribute('role', 'presentation')
    expect(label.parentElement).toHaveAttribute('aria-hidden', 'true')
  })

  it('throws when ActionList.GroupHeading omits as in list semantics', () => {
    expect(() =>
      render(() => (
        <ActionList>
          <ActionList.Group>
            <ActionList.GroupHeading>Missing level</ActionList.GroupHeading>
            <ActionList.Item>Item</ActionList.Item>
          </ActionList.Group>
        </ActionList>
      )),
    ).toThrow(
      "You are setting a heading for a list, that requires a heading level. Please use 'as' prop to set a proper heading level.",
    )
  })
})
