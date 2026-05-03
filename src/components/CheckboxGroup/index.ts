import {
  CheckboxGroupCaption,
  CheckboxGroupImpl,
  CheckboxGroupLabel,
  CheckboxGroupValidation,
} from './CheckboxGroup'
import type {
  CheckboxGroupCaptionProps,
  CheckboxGroupLabelProps,
  CheckboxGroupProps,
  CheckboxGroupValidationProps,
} from './CheckboxGroup'

type CheckboxGroupComponent = typeof CheckboxGroupImpl & {
  Caption: typeof CheckboxGroupCaption
  Label: typeof CheckboxGroupLabel
  Validation: typeof CheckboxGroupValidation
}

const CheckboxGroup: CheckboxGroupComponent = Object.assign(CheckboxGroupImpl, {
  Caption: CheckboxGroupCaption,
  Label: CheckboxGroupLabel,
  Validation: CheckboxGroupValidation,
})

export { CheckboxGroup }
export type {
  CheckboxGroupCaptionProps,
  CheckboxGroupLabelProps,
  CheckboxGroupProps,
  CheckboxGroupValidationProps,
}
export default CheckboxGroup
