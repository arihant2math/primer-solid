import { fireEvent, render, screen } from '@solidjs/testing-library'
import { Radio, RadioGroup } from '../../index'

describe('Radio', () => {
  const defaultProps = {
    name: 'choices',
    value: 'one',
  }

  it('renders a valid radio input', () => {
    render(() => <Radio {...defaultProps} />)

    const radio = screen.getByRole('radio') as HTMLInputElement

    expect(radio).toBeInTheDocument()
    expect(radio.checked).toBe(false)
    expect(radio).toHaveAttribute('name', defaultProps.name)
    expect(radio).toHaveAttribute('value', defaultProps.value)
  })

  it('renders a checked radio when checked is passed', () => {
    render(() => <Radio {...defaultProps} checked />)

    const radio = screen.getByRole('radio') as HTMLInputElement

    expect(radio.checked).toBe(true)
    expect(radio).toHaveAttribute('aria-checked', 'true')
  })

  it('supports uncontrolled state with defaultChecked', () => {
    render(() => <Radio {...defaultProps} defaultChecked />)

    const radio = screen.getByRole('radio') as HTMLInputElement

    expect(radio.checked).toBe(true)
    expect(radio).toHaveAttribute('aria-checked', 'true')
  })

  it('supports grouping by name', () => {
    const onChange = vi.fn()

    render(() => (
      <form>
        <Radio name="choices" value="one" onChange={onChange} />
        <Radio name="choices" value="two" onChange={onChange} />
      </form>
    ))

    const [one, two] = screen.getAllByRole('radio') as HTMLInputElement[]

    fireEvent.click(one)
    expect(one.checked).toBe(true)
    expect(two.checked).toBe(false)

    fireEvent.click(two)
    expect(one.checked).toBe(false)
    expect(two.checked).toBe(true)
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('renders a disabled radio', () => {
    render(() => <Radio {...defaultProps} disabled />)

    expect(screen.getByRole('radio')).toBeDisabled()
  })

  it('uses the RadioGroup name when nested in a group', () => {
    render(() => (
      <RadioGroup name="group-name">
        <RadioGroup.Label>Choices</RadioGroup.Label>
        <label>
          <Radio value="one" />
          Choice one
        </label>
      </RadioGroup>
    ))

    expect(screen.getByRole('radio')).toHaveAttribute('name', 'group-name')
  })

  it('warns when rendered without a name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(() => <Radio value="one" />)

    expect(warn).toHaveBeenCalledWith(
      'A radio input must have a `name` attribute. Pass `name` as a prop directly to each Radio, or nest them in a `RadioGroup` component with a `name` prop',
    )

    warn.mockRestore()
  })

  it('does not warn for aria-hidden radios without a name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(() => <Radio value="one" aria-hidden />)

    expect(warn).not.toHaveBeenCalled()

    warn.mockRestore()
  })
})
