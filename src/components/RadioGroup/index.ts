import {
  RadioGroupCaption,
  RadioGroupImpl,
  RadioGroupLabel,
  RadioGroupValidation,
  RadioGroupContext,
} from './RadioGroup'
import type {
  RadioGroupCaptionProps,
  RadioGroupLabelProps,
  RadioGroupProps,
  RadioGroupValidationProps,
} from './RadioGroup'

type RadioGroupComponent = typeof RadioGroupImpl & {
  Caption: typeof RadioGroupCaption
  Label: typeof RadioGroupLabel
  Validation: typeof RadioGroupValidation
}

const RadioGroup: RadioGroupComponent = Object.assign(RadioGroupImpl, {
  Caption: RadioGroupCaption,
  Label: RadioGroupLabel,
  Validation: RadioGroupValidation,
})

export { RadioGroup, RadioGroupContext }
export type {
  RadioGroupCaptionProps,
  RadioGroupLabelProps,
  RadioGroupProps,
  RadioGroupValidationProps,
}
export default RadioGroup
