export type ResponsiveValue<T> = {
  narrow?: T
  regular?: T
  wide?: T
}

const viewportNames = ['narrow', 'regular', 'wide'] as const

type ResponsiveViewport = (typeof viewportNames)[number]

type ResponsiveAttributeValue = string | number

function serializeResponsiveAttributeValue(value: string | number | boolean) {
  return typeof value === 'boolean' ? String(value) : value
}

export function isResponsiveValue<T>(value: unknown): value is ResponsiveValue<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    viewportNames.some((viewport) => viewport in (value as object))
  )
}

export function mapResponsiveValue<T, U>(
  value: T | ResponsiveValue<T> | undefined,
  map: (value: T) => U,
): U | ResponsiveValue<U> | undefined {
  if (value === undefined) return undefined

  if (!isResponsiveValue<T>(value)) {
    return map(value)
  }

  const mapped: ResponsiveValue<U> = {}

  for (const viewport of viewportNames) {
    const viewportValue = value[viewport]
    if (viewportValue !== undefined) {
      mapped[viewport] = map(viewportValue)
    }
  }

  return mapped
}

export function getResponsiveAttributes<T extends string | number | boolean>(
  property: string,
  value?: T | ResponsiveValue<T>,
): Record<string, ResponsiveAttributeValue> | undefined {
  if (value === undefined || value === null) return undefined

  if (!isResponsiveValue<T>(value)) {
    return {
      [`data-${property}`]: serializeResponsiveAttributeValue(value),
    }
  }

  const attributes: Record<string, ResponsiveAttributeValue> = {}

  for (const viewport of viewportNames) {
    const viewportValue = value[viewport as ResponsiveViewport]
    if (viewportValue !== undefined) {
      attributes[`data-${property}-${viewport}`] =
        serializeResponsiveAttributeValue(viewportValue)
    }
  }

  return Object.keys(attributes).length > 0 ? attributes : undefined
}
