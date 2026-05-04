import { fireEvent, render, screen, within } from '@solidjs/testing-library'
import { Radio, RadioGroup } from '../../index'

describe('RadioGroup', () => {
  it('renders an accessible labelled group', () => {
    render(() => (
      <RadioGroup name="choices">
        <RadioGroup.Label>Choices</RadioGroup.Label>
        <label>
          <Radio value="one" />
          Choice one
        </label>
        <label>
          <Radio value="two" />
          Choice two
        </label>
      </RadioGroup>
    ))

    expect(screen.getByRole('group', { name: 'Choices' })).toBeInTheDocument()
  })

  it('renders a disabled group of inputs', () => {
    render(() => (
      <RadioGroup name="choices" disabled>
        <RadioGroup.Label>Choices</RadioGroup.Label>
        <label>
          <Radio value="one" />
          Choice one
        </label>
        <label>
          <Radio value="two" />
          Choice two
        </label>
      </RadioGroup>
    ))

    const group = screen.getByRole('group') as HTMLFieldSetElement
    const radios = screen.getAllByRole('radio')

    expect(group.disabled).toBe(true)
    for (const radio of radios) {
      expect(radio).toBeDisabled()
    }
  })

  it('renders a required group of inputs', () => {
    render(() => (
      <RadioGroup name="choices" required>
        <RadioGroup.Label>Choices</RadioGroup.Label>
        <label>
          <Radio value="one" />
          Choice one
        </label>
      </RadioGroup>
    ))

    expect(screen.getByTitle('required field')).toBeInTheDocument()
  })

  it('renders caption and validation content with the legend', () => {
    render(() => (
      <RadioGroup name="choices">
        <RadioGroup.Label>Choices</RadioGroup.Label>
        <RadioGroup.Caption>Caption text</RadioGroup.Caption>
        <label>
          <Radio value="one" />
          Choice one
        </label>
        <RadioGroup.Validation variant="error">
          Validation text
        </RadioGroup.Validation>
      </RadioGroup>
    ))

    const legend = document.getElementsByTagName('legend')[0]

    expect(within(legend).getByText('Caption text')).toBeInTheDocument()
    expect(within(legend).getByText('Validation text')).toBeInTheDocument()
    expect(screen.getAllByText('Validation text')).toHaveLength(2)
  })

  it('calls onChange handlers passed to RadioGroup and Radio', () => {
    const onGroupChange = vi.fn()
    const onRadioChange = vi.fn()

    render(() => (
      <RadioGroup name="choices" onChange={onGroupChange}>
        <RadioGroup.Label>Choices</RadioGroup.Label>
        <label>
          <Radio value="one" onChange={onRadioChange} />
          Choice one
        </label>
        <label>
          <Radio value="two" />
          Choice two
        </label>
      </RadioGroup>
    ))

    fireEvent.click(screen.getByLabelText('Choice one'))

    expect(onGroupChange).toHaveBeenCalled()
    expect(onRadioChange).toHaveBeenCalled()
  })

  it('calls onChange with the selected value', () => {
    const onChange = vi.fn()

    render(() => (
      <RadioGroup name="choices" onChange={onChange}>
        <RadioGroup.Label>Choices</RadioGroup.Label>
        <label>
          <Radio value="one" />
          Choice one
        </label>
        <label>
          <Radio value="two" />
          Choice two
        </label>
      </RadioGroup>
    ))

    fireEvent.click(screen.getByLabelText('Choice one'))

    expect(onChange).toHaveBeenLastCalledWith(
      'one',
      expect.objectContaining({
        target: expect.objectContaining({ value: 'one' }),
      }),
    )
  })

  it('supports aria-labelledby when no label slot is provided', () => {
    render(() => (
      <>
        <h2 id="choices-label">Choices</h2>
        <RadioGroup name="choices" aria-labelledby="choices-label">
          <label>
            <Radio value="one" />
            Choice one
          </label>
        </RadioGroup>
      </>
    ))

    expect(screen.getByLabelText('Choices')).toBeInTheDocument()
  })

  it('warns when rendered without a label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(() => (
      <RadioGroup name="choices">
        <label>
          <Radio value="one" />
          Choice one
        </label>
      </RadioGroup>
    ))

    expect(warn).toHaveBeenCalledWith(
      'A choice group must be labelled using a `CheckboxOrRadioGroup.Label` child, or by passing `aria-labelledby` to the CheckboxOrRadioGroup component.',
    )

    warn.mockRestore()
  })
})
