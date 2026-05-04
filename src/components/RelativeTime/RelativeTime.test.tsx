import { render } from '@solidjs/testing-library'
import {
  RelativeTimeUpdatedEvent,
  type RelativeTimeElement,
} from '@github/relative-time-element'
import { RelativeTime } from './RelativeTime'

describe('RelativeTime', () => {
  it('renders a <relative-time>', () => {
    const { container } = render(() => <RelativeTime />)

    expect(container.firstChild?.nodeName.toLowerCase()).toBe('relative-time')
  })

  it('renders a date inside', () => {
    const date = new Date('2024-03-07T12:22:48.123Z')
    const { container } = render(() => <RelativeTime date={date} />)

    expect(container.textContent).toBe('Mar 7, 2024')
  })

  it('renders a datetime inside', () => {
    const date = new Date('2024-03-07T12:22:48.123Z')
    const { container } = render(() => (
      <RelativeTime datetime={date.toJSON()} />
    ))

    expect(container.textContent).toBe('Mar 7, 2024')
  })

  it('renders children if passed', () => {
    const date = new Date('2024-03-07T12:22:48.123Z')
    const { container } = render(() => (
      <RelativeTime date={date}>server rendered date</RelativeTime>
    ))

    expect(container.textContent).toBe('server rendered date')
  })

  it('accepts class and className', () => {
    const { container } = render(() => (
      <RelativeTime class="solid-class" className="react-class" />
    ))

    expect(container.firstChild).toHaveClass('solid-class')
    expect(container.firstChild).toHaveClass('react-class')
  })

  it('does not render no-title attribute by default', () => {
    const date = new Date('2024-03-07T12:22:48.123Z')
    const { container } = render(() => <RelativeTime date={date} />)

    expect(container.firstChild).not.toHaveAttribute('no-title')
  })

  it('adds no-title attribute if noTitle={true}', () => {
    const date = new Date('2024-03-07T12:22:48.123Z')
    const { container } = render(() => <RelativeTime date={date} noTitle />)

    expect(container.firstChild).toHaveAttribute('no-title')
  })

  it('maps onRelativeTimeUpdated to the custom element property', () => {
    const onRelativeTimeUpdated = vi.fn()
    let element: RelativeTimeElement | undefined

    render(() => (
      <RelativeTime
        ref={(value) => {
          element = value
        }}
        onRelativeTimeUpdated={onRelativeTimeUpdated}
      />
    ))

    element?.dispatchEvent(new RelativeTimeUpdatedEvent('', '', '', ''))

    expect(onRelativeTimeUpdated).toHaveBeenCalledTimes(1)
  })
})
