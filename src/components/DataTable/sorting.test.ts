import { alphanumeric, basic, datetime } from './sorting'

describe('DataTable sorting helpers', () => {
  it('sorts strings and numbers with the basic strategy', () => {
    expect(['c', 'b', 'a'].sort(basic)).toEqual(['a', 'b', 'c'])
    expect([3, 2, 1].sort(basic)).toEqual([1, 2, 3])
  })

  it('sorts natural alphanumeric strings', () => {
    expect(['test456', 'test789', 'test123'].sort(alphanumeric)).toEqual([
      'test123',
      'test456',
      'test789',
    ])
  })

  it('sorts date values', () => {
    const today = Date.now()
    const yesterday = today - 24 * 60 * 60 * 1000

    expect([new Date(today), new Date(yesterday)].sort(datetime)).toEqual([
      new Date(yesterday),
      new Date(today),
    ])
    expect([today, yesterday].sort(datetime)).toEqual([yesterday, today])
  })
})
