import { createContext, splitProps, useContext } from 'solid-js'
import type { Accessor, ComponentProps, JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { mergeClassNames } from '../../utils'
import { Button } from '../Button'
import type { ButtonProps } from '../Button'
import { Link } from '../Link'
import type { LinkProps } from '../Link'
import styles from './Blankslate.module.css'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

type Ref<T> = ((element: T) => void) | { current?: T | null } | undefined

type BlankslateSize = 'small' | 'medium' | 'large'
type BlankslateHeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

type BlankslateContextValue = {
  size: Accessor<BlankslateSize>
}

const BlankslateContext = createContext<BlankslateContextValue>()

function assignRef<T>(ref: Ref<T>, element: T) {
  if (typeof ref === 'function') {
    ref(element)
  } else if (ref) {
    ref.current = element
  }
}

function useBlankslate() {
  const context = useContext(BlankslateContext)

  if (!context) {
    throw new Error('useBlankslate must be used within a BlankslateProvider')
  }

  return context
}

type BlankslateOwnProps = {
  border?: boolean
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  narrow?: boolean
  ref?: Ref<HTMLDivElement>
  size?: BlankslateSize
  spacious?: boolean
}

export type BlankslateProps = DistributiveOmit<
  ComponentProps<'div'>,
  keyof BlankslateOwnProps | 'className'
> &
  BlankslateOwnProps

export function Blankslate(props: BlankslateProps) {
  const [local, rest] = splitProps(props, [
    'border',
    'children',
    'class',
    'className',
    'narrow',
    'ref',
    'size',
    'spacious',
  ])
  const size = () => local.size ?? 'medium'

  return (
    <BlankslateContext.Provider value={{ size }}>
      <div
        {...rest}
        ref={(element) => {
          assignRef(local.ref, element)
        }}
        class={styles.Container}
      >
        <div
          class={mergeClassNames(styles.Blankslate, local.className, local.class)}
          data-border={local.border ? '' : undefined}
          data-narrow={local.narrow ? '' : undefined}
          data-spacious={local.spacious ? '' : undefined}
          data-size={size()}
        >
          {local.children}
        </div>
      </div>
    </BlankslateContext.Provider>
  )
}

type BlankslateVisualOwnProps = {
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  ref?: Ref<HTMLSpanElement>
}

export type BlankslateVisualProps = DistributiveOmit<
  ComponentProps<'span'>,
  keyof BlankslateVisualOwnProps | 'className'
> &
  BlankslateVisualOwnProps

export function Visual(props: BlankslateVisualProps) {
  const [local, rest] = splitProps(props, ['children', 'class', 'className', 'ref'])

  return (
    <span
      {...rest}
      ref={(element) => {
        assignRef(local.ref, element)
      }}
      class={mergeClassNames(
        'Blankslate-Visual',
        styles.Visual,
        local.className,
        local.class,
      )}
    >
      {local.children}
    </span>
  )
}

export type BlankslateHeadingProps = JSX.HTMLAttributes<HTMLHeadingElement> & {
  as?: BlankslateHeadingTag
  children?: JSX.Element
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  ref?: Ref<HTMLHeadingElement>
}

export function Heading(props: BlankslateHeadingProps) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
    'ref',
  ])
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element

  return (
    <Component
      component={local.as ?? 'h2'}
      {...rest}
      ref={(element: unknown) => {
        assignRef(local.ref as Ref<unknown>, element)
      }}
      class={mergeClassNames(
        'Blankslate-Heading',
        styles.Heading,
        local.className,
        local.class,
      )}
    >
      {local.children}
    </Component>
  )
}

type BlankslateDescriptionOwnProps = {
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  ref?: Ref<HTMLParagraphElement>
}

export type BlankslateDescriptionProps = DistributiveOmit<
  ComponentProps<'p'>,
  keyof BlankslateDescriptionOwnProps | 'className'
> &
  BlankslateDescriptionOwnProps

export function Description(props: BlankslateDescriptionProps) {
  const [local, rest] = splitProps(props, ['children', 'class', 'className', 'ref'])

  return (
    <p
      {...rest}
      ref={(element) => {
        assignRef(local.ref, element)
      }}
      class={mergeClassNames(
        'Blankslate-Description',
        styles.Description,
        local.className,
        local.class,
      )}
    >
      {local.children}
    </p>
  )
}

type BlankslatePrimaryActionButtonProps = Omit<
  ButtonProps<'button'>,
  'as' | 'size' | 'variant'
> & {
  href?: never
}

type BlankslatePrimaryActionLinkProps = Omit<
  ButtonProps<'a'>,
  'as' | 'size' | 'variant'
> & {
  href: string
}

export type BlankslatePrimaryActionProps =
  | BlankslatePrimaryActionButtonProps
  | BlankslatePrimaryActionLinkProps

export function PrimaryAction(props: BlankslatePrimaryActionProps) {
  const { size } = useBlankslate()
  const [local, rest] = splitProps(props, ['children', 'href'])

  return (
    <div class={mergeClassNames('Blankslate-Action', styles.Action)}>
      <Button
        {...(rest as Record<string, unknown>)}
        as={local.href ? 'a' : 'button'}
        href={local.href}
        variant="primary"
        size={size() === 'small' ? 'small' : undefined}
      >
        {local.children}
      </Button>
    </div>
  )
}

export type BlankslateSecondaryActionProps = Omit<
  LinkProps<'a'>,
  'as' | 'href'
> & {
  href: string
}

export function SecondaryAction(props: BlankslateSecondaryActionProps) {
  const [local, rest] = splitProps(props, ['children', 'href'])

  return (
    <div class={mergeClassNames('Blankslate-Action', styles.Action)}>
      <Link {...rest} href={local.href}>
        {local.children}
      </Link>
    </div>
  )
}

Blankslate.displayName = 'Blankslate'
Visual.displayName = 'Blankslate.Visual'
Heading.displayName = 'Blankslate.Heading'
Description.displayName = 'Blankslate.Description'
PrimaryAction.displayName = 'Blankslate.PrimaryAction'
SecondaryAction.displayName = 'Blankslate.SecondaryAction'
