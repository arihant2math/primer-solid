import { fireEvent, render, screen } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { UnderlineNav } from '.'

function TestIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
      <path d="M8 1 1 15h14L8 1Z" />
    </svg>
  )
}

describe('UnderlineNav', () => {
  it('renders a navigation landmark with a visually hidden heading', () => {
    render(() => (
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item aria-current="page">Code</UnderlineNav.Item>
        <UnderlineNav.Item>Issues</UnderlineNav.Item>
      </UnderlineNav>
    ))

    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Repository',
    )
    expect(
      screen.getByRole('heading', { name: 'Repository navigation' }),
    ).toBeInTheDocument()
  })

  it('renders aria-current on the selected item', () => {
    render(() => (
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item aria-current="page">Code</UnderlineNav.Item>
        <UnderlineNav.Item>Issues</UnderlineNav.Item>
      </UnderlineNav>
    ))

    expect(screen.getByRole('link', { name: 'Code' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('fires onSelect on click and keyboard selection', () => {
    const onSelect = vi.fn()

    render(() => (
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item onSelect={onSelect}>Code</UnderlineNav.Item>
      </UnderlineNav>
    ))

    const item = screen.getByRole('link', { name: 'Code' })
    fireEvent.click(item)
    fireEvent.keyDown(item, { key: 'Enter' })
    fireEvent.keyDown(item, { key: ' ' })

    expect(onSelect).toHaveBeenCalledTimes(3)
  })

  it('renders counters accessibly', () => {
    render(() => (
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item counter={120}>Issues</UnderlineNav.Item>
      </UnderlineNav>
    ))

    const item = screen.getByRole('link', { name: /Issues.*120/ })
    const visibleCounter = item.querySelector('[data-component="counter"] > span')

    expect(visibleCounter).toHaveAttribute('aria-hidden', 'true')
    expect(item).toHaveTextContent('Issues')
  })

  it('renders loading counter placeholders', () => {
    render(() => (
      <UnderlineNav aria-label="Repository" loadingCounters>
        <UnderlineNav.Item counter={4}>Actions</UnderlineNav.Item>
      </UnderlineNav>
    ))

    const item = screen.getByRole('link', { name: 'Actions' })
    expect(
      item.querySelector('[data-component="counter"] > span')?.className,
    ).toContain('LoadingCounter')
  })

  it('supports leadingVisual and deprecated icon prop', () => {
    render(() => (
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item leadingVisual={<TestIcon />}>Leading</UnderlineNav.Item>
        <UnderlineNav.Item icon={<TestIcon />}>Element icon</UnderlineNav.Item>
        <UnderlineNav.Item icon={TestIcon}>Component icon</UnderlineNav.Item>
      </UnderlineNav>
    ))

    expect(screen.getAllByRole('link')).toHaveLength(3)
    expect(
      screen
        .getByRole('navigation')
        .querySelectorAll('ul[role="list"] svg').length,
    ).toBe(3)
  })

  it('merges className on root and item', () => {
    render(() => (
      <UnderlineNav aria-label="Repository" className="root-class">
        <UnderlineNav.Item className="item-class">Code</UnderlineNav.Item>
      </UnderlineNav>
    ))

    expect(screen.getByRole('navigation')).toHaveClass('root-class')
    expect(screen.getByRole('link', { name: 'Code' })).toHaveClass('item-class')
  })

  it('extracts only direct text content for data-content', () => {
    render(() => (
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item>
          Tab Label
          <span style={{ position: 'absolute' }}>Hidden element</span>
        </UnderlineNav.Item>
      </UnderlineNav>
    ))

    expect(
      screen
        .getByRole('link', { name: /Tab Label/ })
        .querySelector('[data-component="text"]'),
    ).toHaveAttribute('data-content', 'Tab Label')
  })
})
