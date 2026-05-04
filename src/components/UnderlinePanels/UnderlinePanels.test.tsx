import { fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { UnderlinePanels } from '.'

function TestIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
      <path d="M8 1 1 15h14L8 1Z" />
    </svg>
  )
}

describe('UnderlinePanels', () => {
  it('renders aria-label on the tablist', () => {
    render(() => (
      <UnderlinePanels aria-label="Select a tab">
        <UnderlinePanels.Tab>Tab 1</UnderlinePanels.Tab>
        <UnderlinePanels.Tab>Tab 2</UnderlinePanels.Tab>
        <UnderlinePanels.Panel>Panel 1</UnderlinePanels.Panel>
        <UnderlinePanels.Panel>Panel 2</UnderlinePanels.Panel>
      </UnderlinePanels>
    ))

    expect(screen.getByRole('tablist')).toHaveAccessibleName('Select a tab')
  })

  it('renders aria-labelledby on the tablist', () => {
    render(() => (
      <>
        <h2 id="tab-header">Select a tab</h2>
        <UnderlinePanels aria-labelledby="tab-header">
          <UnderlinePanels.Tab>Tab 1</UnderlinePanels.Tab>
          <UnderlinePanels.Panel>Panel 1</UnderlinePanels.Panel>
        </UnderlinePanels>
      </>
    ))

    expect(screen.getByRole('tablist')).toHaveAccessibleName('Select a tab')
  })

  it('renders generated tab and panel ids from a custom id', () => {
    render(() => (
      <UnderlinePanels aria-label="Select a tab" id="custom-id">
        <UnderlinePanels.Tab>Tab 1</UnderlinePanels.Tab>
        <UnderlinePanels.Panel>Panel 1</UnderlinePanels.Panel>
      </UnderlinePanels>
    ))

    const tab = screen.getByRole('tab', { name: 'Tab 1' })
    const panel = screen.getByRole('tabpanel')

    expect(tab).toHaveAttribute('id', 'custom-id-tab-0')
    expect(tab).toHaveAttribute('aria-controls', 'custom-id-panel-0')
    expect(panel).toHaveAttribute('id', 'custom-id-panel-0')
    expect(panel).toHaveAttribute('aria-labelledby', 'custom-id-tab-0')
  })

  it('updates the selected tab when aria-selected changes', () => {
    let setSecondSelected!: (value: boolean) => void

    render(() => {
      const [secondSelected, setSelected] = createSignal(false)
      setSecondSelected = setSelected

      return (
        <UnderlinePanels aria-label="Select a tab">
          <UnderlinePanels.Tab aria-selected={!secondSelected()}>
            Tab 1
          </UnderlinePanels.Tab>
          <UnderlinePanels.Tab aria-selected={secondSelected()}>
            Tab 2
          </UnderlinePanels.Tab>
          <UnderlinePanels.Panel>Panel 1</UnderlinePanels.Panel>
          <UnderlinePanels.Panel>Panel 2</UnderlinePanels.Panel>
        </UnderlinePanels>
      )
    })

    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute(
      'aria-selected',
      'false',
    )

    setSecondSelected(true)

    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('selects tabs and panels on click', () => {
    render(() => (
      <UnderlinePanels aria-label="Select a tab">
        <UnderlinePanels.Tab>Tab 1</UnderlinePanels.Tab>
        <UnderlinePanels.Tab>Tab 2</UnderlinePanels.Tab>
        <UnderlinePanels.Panel>Panel 1</UnderlinePanels.Panel>
        <UnderlinePanels.Panel>Panel 2</UnderlinePanels.Panel>
      </UnderlinePanels>
    ))

    const tabs = screen.getAllByRole('tab')
    const panels = screen.getAllByRole('tabpanel', { hidden: true })

    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(panels[0]).not.toHaveAttribute('hidden')
    expect(panels[1]).toHaveAttribute('hidden')

    fireEvent.click(tabs[1])

    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
    expect(panels[0]).toHaveAttribute('hidden')
    expect(panels[1]).not.toHaveAttribute('hidden')
  })

  it('calls onSelect on click and keyboard selection', () => {
    const onSelect = vi.fn()

    render(() => (
      <UnderlinePanels aria-label="Select a tab">
        <UnderlinePanels.Tab onSelect={onSelect}>Tab 1</UnderlinePanels.Tab>
        <UnderlinePanels.Panel>Panel 1</UnderlinePanels.Panel>
      </UnderlinePanels>
    ))

    const tab = screen.getByRole('tab', { name: 'Tab 1' })
    fireEvent.click(tab)
    fireEvent.keyDown(tab, { key: 'Enter' })
    fireEvent.keyDown(tab, { key: ' ' })

    expect(onSelect).toHaveBeenCalledTimes(3)
  })

  it('renders counters and icons', () => {
    render(() => (
      <UnderlinePanels aria-label="Select a tab">
        <UnderlinePanels.Tab counter={12} icon={TestIcon}>
          Tab 1
        </UnderlinePanels.Tab>
        <UnderlinePanels.Panel>Panel 1</UnderlinePanels.Panel>
      </UnderlinePanels>
    ))

    const tab = screen.getByRole('tab', { name: /Tab 1.*12/ })
    expect(tab.querySelector('[data-component="counter"] > span')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(tab.querySelector('svg')).toBeInTheDocument()
  })

  it('throws when the number of tabs and panels do not match', () => {
    expect(() => {
      render(() => (
        <UnderlinePanels aria-label="Select a tab">
          <UnderlinePanels.Tab>Tab 1</UnderlinePanels.Tab>
          <UnderlinePanels.Tab>Tab 2</UnderlinePanels.Tab>
          <UnderlinePanels.Panel>Panel 1</UnderlinePanels.Panel>
        </UnderlinePanels>
      ))
    }).toThrow(
      'The number of tabs and panels must be equal. Counted 2 tabs and 1 panels.',
    )
  })

  it('throws when multiple tabs are selected', () => {
    expect(() => {
      render(() => (
        <UnderlinePanels aria-label="Select a tab">
          <UnderlinePanels.Tab aria-selected={true}>Tab 1</UnderlinePanels.Tab>
          <UnderlinePanels.Tab aria-selected={true}>Tab 2</UnderlinePanels.Tab>
          <UnderlinePanels.Panel>Panel 1</UnderlinePanels.Panel>
          <UnderlinePanels.Panel>Panel 2</UnderlinePanels.Panel>
        </UnderlinePanels>
      ))
    }).toThrow('Only one tab can be selected at a time.')
  })
})
