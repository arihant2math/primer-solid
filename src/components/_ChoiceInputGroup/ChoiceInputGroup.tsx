import {
  Show,
  children as resolveChildren,
  createMemo,
  createUniqueId,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { mergeClassNames } from '../../utils'
import { assignRef, type RefProp } from '../../utils/solid'
import { AlertFillIcon, CheckCircleFillIcon } from '../Octicon'
import { VisuallyHidden } from '../VisuallyHidden'
import styles from './ChoiceInputGroup.module.css'

export type FormValidationStatus = 'error' | 'success'

export type ChoiceInputGroupProps = Omit<
  JSX.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  'children' | 'className'
> & {
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  'aria-labelledby'?: string
  required?: boolean
}

export type ChoiceInputGroupLabelProps = {
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  visuallyHidden?: boolean
}

export type ChoiceInputGroupCaptionProps = {
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
}

export type ChoiceInputGroupValidationProps = {
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  variant: FormValidationStatus
}

type ChoiceInputGroupSlotType = 'label' | 'caption' | 'validation'

const CHOICE_INPUT_GROUP_SLOT = Symbol('primer-solid.choice-input-group-slot')

type ChoiceInputGroupSlot = {
  readonly [CHOICE_INPUT_GROUP_SLOT]: true
  type: ChoiceInputGroupSlotType
  props:
    | ChoiceInputGroupLabelProps
    | ChoiceInputGroupCaptionProps
    | ChoiceInputGroupValidationProps
}

function createChoiceInputGroupSlot(
  type: ChoiceInputGroupSlotType,
  props:
    | ChoiceInputGroupLabelProps
    | ChoiceInputGroupCaptionProps
    | ChoiceInputGroupValidationProps,
) {
  return {
    [CHOICE_INPUT_GROUP_SLOT]: true,
    type,
    props,
  } as ChoiceInputGroupSlot as unknown as JSX.Element
}

function isChoiceInputGroupSlot(value: unknown): value is ChoiceInputGroupSlot {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Partial<ChoiceInputGroupSlot>)[CHOICE_INPUT_GROUP_SLOT] === true
  )
}

type ChoiceInputGroupSlotComponent<Props> = ((props: Props) => JSX.Element) & {
  __SLOT__?: symbol
}

export type ChoiceInputGroupLabelComponent =
  ChoiceInputGroupSlotComponent<ChoiceInputGroupLabelProps>
export type ChoiceInputGroupCaptionComponent =
  ChoiceInputGroupSlotComponent<ChoiceInputGroupCaptionProps>
export type ChoiceInputGroupValidationComponent =
  ChoiceInputGroupSlotComponent<ChoiceInputGroupValidationProps>

function ChoiceInputGroupLabelImpl(props: ChoiceInputGroupLabelProps) {
  return createChoiceInputGroupSlot('label', props)
}

function ChoiceInputGroupCaptionImpl(props: ChoiceInputGroupCaptionProps) {
  return createChoiceInputGroupSlot('caption', props)
}

function ChoiceInputGroupValidationImpl(
  props: ChoiceInputGroupValidationProps,
) {
  return createChoiceInputGroupSlot('validation', props)
}

function renderLabel(
  slot: ChoiceInputGroupSlot,
  required: boolean | undefined,
  disabled: boolean | undefined,
) {
  const props = slot.props as ChoiceInputGroupLabelProps
  const content = (
    <span class={styles.GroupLabelContent}>
      <span>{props.children}</span>
      <Show when={required}>
        <span aria-hidden="true">*</span>
      </Show>
    </span>
  )

  if (props.visuallyHidden) {
    return (
      <VisuallyHidden
        class={mergeClassNames(styles.GroupLabel, props.className, props.class)}
        title={required ? 'required field' : undefined}
        data-label-disabled={disabled ? true : undefined}
      >
        {content}
      </VisuallyHidden>
    )
  }

  return (
    <span
      class={mergeClassNames(styles.GroupLabel, props.className, props.class)}
      title={required ? 'required field' : undefined}
      data-label-disabled={disabled ? true : undefined}
    >
      {content}
    </span>
  )
}

function renderCaption(slot: ChoiceInputGroupSlot, id: string | undefined) {
  const props = slot.props as ChoiceInputGroupCaptionProps

  return (
    <span
      id={id}
      class={mergeClassNames(styles.GroupCaption, props.className, props.class)}
    >
      {props.children}
    </span>
  )
}

function renderValidation(
  slot: ChoiceInputGroupSlot,
  id: string | undefined,
  ariaHidden: boolean,
) {
  const props = slot.props as ChoiceInputGroupValidationProps
  return (
    <div
      id={id}
      class={mergeClassNames(styles.Validation, props.className, props.class)}
      data-validation-status={props.variant}
      aria-hidden={ariaHidden ? 'true' : undefined}
    >
      <span class={styles.ValidationIcon}>
        <Show
          when={props.variant === 'success'}
          fallback={<AlertFillIcon size={12} />}
        >
          <CheckCircleFillIcon size={12} />
        </Show>
      </span>
      <span class={styles.ValidationText}>{props.children}</span>
    </div>
  )
}

type ChoiceInputGroupRootProps = ChoiceInputGroupProps & {
  rootRef?: RefProp<HTMLFieldSetElement | HTMLDivElement>
}

export function ChoiceInputGroupRoot(props: ChoiceInputGroupRootProps) {
  const [local, rest] = splitProps(props, [
    'aria-labelledby',
    'children',
    'class',
    'className',
    'disabled',
    'id',
    'required',
    'rootRef',
  ])

  const resolvedChildren = resolveChildren(() => local.children)
  const generatedId = createUniqueId()

  const slots = createMemo(() => {
    let label: ChoiceInputGroupSlot | undefined
    let caption: ChoiceInputGroupSlot | undefined
    let validation: ChoiceInputGroupSlot | undefined
    const items: JSX.Element[] = []

    for (const child of resolvedChildren.toArray()) {
      if (!isChoiceInputGroupSlot(child)) {
        items.push(child)
        continue
      }

      if (child.type === 'label') {
        label = child
      } else if (child.type === 'caption') {
        caption = child
      } else if (child.type === 'validation') {
        validation = child
      }
    }

    return { label, caption, validation, items }
  })

  const groupId = () => local.id ?? generatedId
  const captionId = () => (slots().caption ? `${groupId()}-caption` : undefined)
  const validationId = () =>
    slots().validation ? `${groupId()}-validationMessage` : undefined
  const requiredMessageId = () =>
    local.required ? `${groupId()}-requiredMessage` : undefined
  const descriptionIds = () => {
    const ids = [validationId(), captionId(), requiredMessageId()].filter(
      Boolean,
    )
    return ids.length > 0 ? ids.join(' ') : undefined
  }

  if (!slots().label && !local['aria-labelledby']) {
    console.warn(
      'A choice group must be labelled using a `CheckboxGroup.Label` or `RadioGroup.Label` child, or by passing `aria-labelledby` to the group component.',
    )
  }

  return (
    <div>
      <Show
        when={slots().label}
        fallback={
          <div
            {...(rest as JSX.HTMLAttributes<HTMLDivElement>)}
            ref={(element) => assignRef(local.rootRef, element)}
            class={mergeClassNames(
              styles.GroupFieldset,
              local.className,
              local.class,
            )}
            role="group"
            aria-labelledby={local['aria-labelledby']}
            aria-describedby={descriptionIds()}
            data-choice-input-group=""
            data-validation={slots().validation ? true : undefined}
          >
            <Show when={slots().caption}>
              {renderCaption(slots().caption!, captionId())}
            </Show>
            <Show when={local.required}>
              <VisuallyHidden id={requiredMessageId()}>Required</VisuallyHidden>
            </Show>
            <div class={styles.Body}>{slots().items}</div>
          </div>
        }
      >
        <fieldset
          {...rest}
          ref={(element) => assignRef(local.rootRef, element)}
          class={mergeClassNames(
            styles.GroupFieldset,
            local.className,
            local.class,
          )}
          disabled={local.disabled}
          data-choice-input-group=""
          data-validation={slots().validation ? true : undefined}
        >
          <legend
            class={styles.GroupLegend}
            data-legend-visible={
              !(slots().label!.props as ChoiceInputGroupLabelProps)
                .visuallyHidden
                ? true
                : undefined
            }
          >
            {renderLabel(slots().label!, local.required, local.disabled)}
            <Show when={local.required}>
              <VisuallyHidden>, required</VisuallyHidden>
            </Show>
            <Show when={slots().caption}>
              {renderCaption(slots().caption!, captionId())}
            </Show>
            <Show
              when={slots().validation && slots().validation!.props.children}
            >
              <VisuallyHidden>
                {slots().validation!.props.children}
              </VisuallyHidden>
            </Show>
          </legend>
          <div class={styles.Body}>{slots().items}</div>
        </fieldset>
      </Show>
      <Show when={slots().validation}>
        {renderValidation(
          slots().validation!,
          validationId(),
          Boolean(slots().label),
        )}
      </Show>
    </div>
  )
}

ChoiceInputGroupLabelImpl.displayName = 'ChoiceInputGroup.Label'
ChoiceInputGroupCaptionImpl.displayName = 'ChoiceInputGroup.Caption'
ChoiceInputGroupValidationImpl.displayName = 'ChoiceInputGroup.Validation'
ChoiceInputGroupRoot.displayName = 'ChoiceInputGroup'

export const ChoiceInputGroupLabel: ChoiceInputGroupLabelComponent =
  ChoiceInputGroupLabelImpl
export const ChoiceInputGroupCaption: ChoiceInputGroupCaptionComponent =
  ChoiceInputGroupCaptionImpl
export const ChoiceInputGroupValidation: ChoiceInputGroupValidationComponent =
  ChoiceInputGroupValidationImpl

ChoiceInputGroupLabel.__SLOT__ = Symbol('ChoiceInputGroupLabel')
ChoiceInputGroupCaption.__SLOT__ = Symbol('ChoiceInputGroupCaption')
ChoiceInputGroupValidation.__SLOT__ = Symbol('ChoiceInputGroupValidation')
