import { StackImpl, StackItem } from './Stack'
import type {
  ResponsiveValue,
  StackAlign,
  StackAlignScale,
  StackDirection,
  StackDirectionScale,
  StackGap,
  StackGapScale,
  StackItemProps,
  StackJustify,
  StackJustifyCompatScale,
  StackJustifyScale,
  StackPadding,
  StackPaddingScale,
  StackProps,
  StackWrap,
  StackWrapScale,
} from './Stack'

const Stack = Object.assign(StackImpl, {
  Item: StackItem,
})

export { Stack }
export type {
  ResponsiveValue,
  StackAlign,
  StackAlignScale,
  StackDirection,
  StackDirectionScale,
  StackGap,
  StackGapScale,
  StackItemProps,
  StackJustify,
  StackJustifyCompatScale,
  StackJustifyScale,
  StackPadding,
  StackPaddingScale,
  StackProps,
  StackWrap,
  StackWrapScale,
}
