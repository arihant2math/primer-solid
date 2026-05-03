import { splitProps } from 'solid-js'
import type { ComponentProps, JSX, ValidComponent } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { mergeClassNames } from '../../utils'
import styles from './BranchName.module.css'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

type BranchNameOwnProps<As extends ValidComponent> = {
  as?: As
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
}

export type BranchNameProps<As extends ValidComponent = 'a'> =
  DistributiveOmit<ComponentProps<As>, keyof BranchNameOwnProps<As>> &
    BranchNameOwnProps<As>

export function BranchName<As extends ValidComponent = 'a'>(
  props: BranchNameProps<As>,
) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
  ])
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element

  return (
    <Component
      component={local.as ?? 'a'}
      {...rest}
      class={mergeClassNames(local.className, local.class, styles.BranchName)}
    >
      {local.children}
    </Component>
  )
}

export default BranchName
