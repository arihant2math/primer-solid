import { splitProps } from 'solid-js'
import {
  ChoiceInputGroupCaption,
  ChoiceInputGroupLabel,
  ChoiceInputGroupRoot,
  ChoiceInputGroupValidation,
  type ChoiceInputGroupCaptionComponent,
  type ChoiceInputGroupCaptionProps,
  type ChoiceInputGroupLabelComponent,
  type ChoiceInputGroupLabelProps,
  type ChoiceInputGroupProps,
  type ChoiceInputGroupValidationComponent,
  type ChoiceInputGroupValidationProps,
} from '../_ChoiceInputGroup/ChoiceInputGroup'
import { RadioGroupContext, RadioGroupProvider } from './RadioGroupContext'

export type RadioGroupProps = ChoiceInputGroupProps & {
  onChange?: (
    selected: string | null,
    event?: Event & { currentTarget: HTMLInputElement; target: HTMLInputElement },
  ) => void
  name: string
}

export function RadioGroupImpl(props: RadioGroupProps) {
  let selectedValue: string | null = null

  const [local, rest] = splitProps(props, [
    'children',
    'disabled',
    'name',
    'onChange',
  ])

  const handleChange = (
    event: Event & { currentTarget: HTMLInputElement; target: HTMLInputElement },
  ) => {
    if (event.currentTarget.checked) {
      selectedValue = event.currentTarget.value
    }

    local.onChange?.(selectedValue, event as Event & {
      currentTarget: HTMLInputElement
      target: HTMLInputElement
    })
  }

  return (
    <RadioGroupProvider
      value={{
        disabled: local.disabled,
        name: local.name,
        onChange: handleChange,
      }}
    >
      <ChoiceInputGroupRoot disabled={local.disabled} {...rest}>
        {local.children}
      </ChoiceInputGroupRoot>
    </RadioGroupProvider>
  )
}

RadioGroupImpl.displayName = 'RadioGroup'
;(RadioGroupImpl as typeof RadioGroupImpl & { __SLOT__?: symbol }).__SLOT__ =
  Symbol('RadioGroup')

export const RadioGroupLabel: ChoiceInputGroupLabelComponent =
  ChoiceInputGroupLabel
export const RadioGroupCaption: ChoiceInputGroupCaptionComponent =
  ChoiceInputGroupCaption
export const RadioGroupValidation: ChoiceInputGroupValidationComponent =
  ChoiceInputGroupValidation

export type {
  ChoiceInputGroupCaptionProps as RadioGroupCaptionProps,
  ChoiceInputGroupLabelProps as RadioGroupLabelProps,
  ChoiceInputGroupValidationProps as RadioGroupValidationProps,
}

export { RadioGroupContext }
