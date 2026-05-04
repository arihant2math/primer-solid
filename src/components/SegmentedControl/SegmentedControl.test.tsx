import { fireEvent, render, screen } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { EyeIcon, FileCodeIcon, PeopleIcon } from '../Octicon'
import { SegmentedControl } from './SegmentedControl'
import styles from './SegmentedControl.module.css'

const segmentData = [
  {
    label: 'Preview',
    description: 'This preview does blah.',
    iconLabel: 'EyeIcon',
    icon: () => <EyeIcon aria-label="EyeIcon" />,
  },
  {
    label: 'Raw',
    description: 'This shows the raw content.',
    iconLabel: 'FileCodeIcon',
    icon: () => <FileCodeIcon aria-label="FileCodeIcon" />,
  },
  {
    label: 'Blame',
    description: 'This shows the blame.',
    iconLabel: 'PeopleIcon',
    icon: () => <PeopleIcon aria-label="PeopleIcon" />,
  },
]

describe('SegmentedControl', () => {
  it('renders the segmented control class on the root', () => {
    render(() => (
      <SegmentedControl aria-label="File view">
        <SegmentedControl.Button>Preview</SegmentedControl.Button>
      </SegmentedControl>
    ))

    expect(screen.getByRole('list')).toHaveClass(styles.SegmentedControl)
  })

  it('renders with a selected segment in controlled mode', () => {
    render(() => (
      <SegmentedControl aria-label="File view">
        {segmentData.map(({ label }, index) => (
          <SegmentedControl.Button selected={index === 1}>
            {label}
          </SegmentedControl.Button>
        ))}
      </SegmentedControl>
    ))

    expect(screen.getByRole('button', { name: 'Raw' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('renders with a selected segment in uncontrolled mode', () => {
    render(() => (
      <SegmentedControl aria-label="File view">
        {segmentData.map(({ label }, index) => (
          <SegmentedControl.Button defaultSelected={index === 1}>
            {label}
          </SegmentedControl.Button>
        ))}
      </SegmentedControl>
    ))

    expect(screen.getByRole('button', { name: 'Raw' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('renders the first segment as selected by default', () => {
    render(() => (
      <SegmentedControl aria-label="File view">
        {segmentData.map(({ label }) => (
          <SegmentedControl.Button>{label}</SegmentedControl.Button>
        ))}
      </SegmentedControl>
    ))

    expect(screen.getByRole('button', { name: 'Preview' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('renders segments with deprecated leadingIcon', () => {
    render(() => (
      <SegmentedControl aria-label="File view">
        <SegmentedControl.Button leadingIcon={EyeIcon}>
          Preview
        </SegmentedControl.Button>
      </SegmentedControl>
    ))

    expect(
      screen.getByRole('button', { name: 'Preview' }).querySelector('svg'),
    ).toBeInTheDocument()
  })

  it('prioritizes leadingVisual over deprecated leadingIcon', () => {
    render(() => (
      <SegmentedControl aria-label="File view">
        <SegmentedControl.Button
          leadingVisual={() => <EyeIcon aria-label="EyeIcon" />}
          leadingIcon={() => <FileCodeIcon aria-label="FileCodeIcon" />}
        >
          Preview
        </SegmentedControl.Button>
      </SegmentedControl>
    ))

    const button = screen.getByText('Preview').closest('button')
    expect(button?.querySelector('.octicon-eye')).toBeInTheDocument()
    expect(button?.querySelector('.octicon-file-code')).not.toBeInTheDocument()
  })

  it('renders icon-only segments with accessible labels', () => {
    render(() => (
      <SegmentedControl aria-label="File view">
        {segmentData.map(({ label, icon }) => (
          <SegmentedControl.IconButton icon={icon} aria-label={label} />
        ))}
      </SegmentedControl>
    ))

    for (const { label } of segmentData) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('uses the tooltip to label icon buttons by default', () => {
    render(() => (
      <SegmentedControl aria-label="File view">
        <SegmentedControl.IconButton
          icon={segmentData[0].icon}
          aria-label="Preview"
        />
      </SegmentedControl>
    ))

    const button = screen.getByRole('button', { name: 'Preview' })
    const tooltipId = button.getAttribute('aria-labelledby')

    expect(tooltipId).toBeTruthy()
    expect(button).not.toHaveAttribute('aria-label')
    expect(document.getElementById(tooltipId!)).toHaveTextContent('Preview')
  })

  it('uses the tooltip description to describe icon buttons', () => {
    render(() => (
      <SegmentedControl aria-label="File view">
        <SegmentedControl.IconButton
          icon={segmentData[0].icon}
          aria-label="Preview"
          description={segmentData[0].description}
        />
      </SegmentedControl>
    ))

    const button = screen.getByRole('button', { name: 'Preview' })
    const descriptionId = button.getAttribute('aria-describedby')

    expect(button).toHaveAttribute('aria-label', 'Preview')
    expect(descriptionId).toBeTruthy()
    expect(document.getElementById(descriptionId!)).toHaveTextContent(
      segmentData[0].description,
    )
  })

  it('calls onChange with the clicked index', () => {
    const onChange = vi.fn()

    render(() => (
      <SegmentedControl aria-label="File view" onChange={onChange}>
        {segmentData.map(({ label }, index) => (
          <SegmentedControl.Button selected={index === 0}>
            {label}
          </SegmentedControl.Button>
        ))}
      </SegmentedControl>
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Raw' }))

    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('updates the selected segment when uncontrolled', () => {
    render(() => (
      <SegmentedControl aria-label="File view">
        {segmentData.map(({ label }) => (
          <SegmentedControl.Button>{label}</SegmentedControl.Button>
        ))}
      </SegmentedControl>
    ))

    expect(screen.getByRole('button', { name: 'Raw' })).toHaveAttribute(
      'aria-current',
      'false',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Raw' }))

    expect(screen.getByRole('button', { name: 'Raw' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('calls a segment onClick when it is provided', () => {
    const onClick = vi.fn()

    render(() => (
      <SegmentedControl aria-label="File view">
        <SegmentedControl.Button selected>Preview</SegmentedControl.Button>
        <SegmentedControl.Button onClick={onClick}>Raw</SegmentedControl.Button>
      </SegmentedControl>
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Raw' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('prevents disabled segments from changing selection', () => {
    render(() => (
      <SegmentedControl aria-label="File view">
        <SegmentedControl.Button selected>Preview</SegmentedControl.Button>
        <SegmentedControl.Button disabled>Raw</SegmentedControl.Button>
      </SegmentedControl>
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Raw' }))

    expect(screen.getByRole('button', { name: 'Preview' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Raw' })).toHaveAttribute(
      'aria-current',
      'false',
    )
  })

  it('renders a dropdown trigger and selects menu items', () => {
    const onChange = vi.fn()

    render(() => (
      <SegmentedControl
        aria-label="File view"
        onChange={onChange}
        variant={{ narrow: 'dropdown' }}
      >
        {segmentData.map(({ label }, index) => (
          <SegmentedControl.Button selected={index === 0}>
            {label}
          </SegmentedControl.Button>
        ))}
      </SegmentedControl>
    ))

    const trigger = screen.getByRole('button', { name: 'Preview, File view' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'true')

    fireEvent.click(trigger)
    fireEvent.click(screen.getAllByRole('menuitemradio')[1])

    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('warns when no accessible label is provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(() => (
      <SegmentedControl>
        <SegmentedControl.Button>Preview</SegmentedControl.Button>
      </SegmentedControl>
    ))

    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('serializes responsive props onto the root element', () => {
    render(() => (
      <SegmentedControl
        aria-label="File view"
        fullWidth={{ narrow: true, regular: false, wide: false }}
        variant={{ narrow: 'hideLabels', regular: 'default', wide: 'default' }}
      >
        <SegmentedControl.Button leadingVisual={segmentData[0].icon}>
          Preview
        </SegmentedControl.Button>
      </SegmentedControl>
    ))

    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('data-full-width-narrow', 'true')
    expect(list).toHaveAttribute('data-full-width-regular', 'false')
    expect(list).toHaveAttribute('data-variant-narrow', 'hideLabels')
  })
})
