export type SortDirection = 'ASC' | 'DESC' | 'NONE'

export const SortDirection: { [Key in SortDirection]: `${Key}` } = {
  ASC: 'ASC',
  DESC: 'DESC',
  NONE: 'NONE',
}

export const DEFAULT_SORT_DIRECTION = SortDirection.ASC

export function transition(
  direction: Exclude<SortDirection, 'NONE'>,
): Exclude<SortDirection, 'NONE'> {
  return direction === SortDirection.ASC
    ? SortDirection.DESC
    : SortDirection.ASC
}

export function basic<T>(a: T, b: T) {
  return a === b ? 0 : a < b ? -1 : 1
}

export function datetime(a: Date | number, b: Date | number): number {
  const timeA = a instanceof Date ? a.getTime() : a
  const timeB = b instanceof Date ? b.getTime() : b
  return timeA > timeB ? 1 : timeA < timeB ? -1 : 0
}

export function alphanumeric(inputA: string, inputB: string): number {
  const groupsA = getAlphaNumericGroups(inputA)
  const groupsB = getAlphaNumericGroups(inputB)

  while (groupsA.length !== 0 && groupsB.length !== 0) {
    const a = groupsA.shift()
    const b = groupsB.shift()

    if (a === b) {
      continue
    } else if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b)
    } else if (typeof a === 'number' && typeof b === 'number') {
      return a > b ? 1 : -1
    } else if (typeof a === 'number' && typeof b === 'string') {
      return -1
    } else if (typeof a === 'string' && typeof b === 'number') {
      return 1
    } else if (a === undefined || b === undefined) {
      break
    }
  }

  return groupsA.length > groupsB.length ? 1 : -1
}

function getAlphaNumericGroups(input: string): Array<string | number> {
  const groups = []
  let i = 0

  while (i < input.length) {
    let group = input[i]

    if (isNumeric(group)) {
      while (i + 1 < input.length && isNumeric(input[i + 1])) {
        group = group + input[i + 1]
        i++
      }
      groups.push(Number.parseInt(group, 10))
    } else {
      while (i + 1 < input.length && !isNumeric(input[i + 1])) {
        group = group + input[i + 1]
        i++
      }
      groups.push(group)
    }

    i++
  }

  return groups
}

function isNumeric(value: string): boolean {
  return !Number.isNaN(Number.parseInt(value, 10))
}

export const strategies = {
  alphanumeric,
  basic,
  datetime,
}

export type SortStrategy = keyof typeof strategies
export type CustomSortStrategy<T> = (a: T, b: T) => number
