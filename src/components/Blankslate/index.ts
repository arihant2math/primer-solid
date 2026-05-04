import {
  Blankslate as BlankslateImpl,
  Description,
  Heading,
  PrimaryAction,
  SecondaryAction,
  Visual,
} from './Blankslate'
import type {
  BlankslateDescriptionProps,
  BlankslateHeadingProps,
  BlankslatePrimaryActionProps,
  BlankslateProps,
  BlankslateSecondaryActionProps,
  BlankslateVisualProps,
} from './Blankslate'

export const Blankslate = Object.assign(BlankslateImpl, {
  Visual,
  Heading,
  Description,
  PrimaryAction,
  SecondaryAction,
})

export type {
  BlankslateDescriptionProps,
  BlankslateHeadingProps,
  BlankslatePrimaryActionProps,
  BlankslateProps,
  BlankslateSecondaryActionProps,
  BlankslateVisualProps,
}
