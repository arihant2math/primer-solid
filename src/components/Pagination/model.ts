export function buildPaginationModel(
  pageCount: number,
  currentPage: number,
  showPages: boolean,
  marginPageCount: number,
  surroundingPageCount: number,
) {
  const prev: PageType = {
    type: 'PREV',
    num: currentPage - 1,
    disabled: currentPage === 1,
  }
  const next: PageType = {
    type: 'NEXT',
    num: currentPage + 1,
    disabled: currentPage === pageCount,
  }

  if (!showPages) {
    return [prev, next]
  }

  if (pageCount <= 0) {
    return [prev, { ...next, disabled: true }]
  }

  const pages: PageType[] = []

  const standardGap = surroundingPageCount + marginPageCount
  const maxVisiblePages = standardGap + standardGap + 3

  if (pageCount <= maxVisiblePages) {
    addPages(1, pageCount, false)
    return [prev, ...pages, next]
  }

  let startGap = 0
  let startOffset = 0

  if (currentPage - standardGap - 1 <= 1) {
    startOffset = currentPage - standardGap - 2
  } else {
    startGap = currentPage - standardGap - 1
  }

  let endGap = 0
  let endOffset = 0

  if (pageCount - currentPage - standardGap <= 1) {
    endOffset = pageCount - currentPage - standardGap - 1
  } else {
    endGap = pageCount - currentPage - standardGap
  }

  const hasStartEllipsis = startGap > 0
  const hasEndEllipsis = endGap > 0

  addPages(1, marginPageCount, hasStartEllipsis)

  if (hasStartEllipsis) {
    addEllipsis(marginPageCount)
  }

  addPages(
    marginPageCount + startGap + endOffset + 1,
    pageCount - startOffset - endGap - marginPageCount,
    hasEndEllipsis,
  )

  if (hasEndEllipsis) {
    addEllipsis(pageCount - startOffset - endGap - marginPageCount)
  }

  addPages(pageCount - marginPageCount + 1, pageCount)

  return [prev, ...pages, next]

  function addEllipsis(previousPage: number) {
    pages.push({
      type: 'BREAK',
      num: previousPage + 1,
    })
  }

  function addPages(start: number, end: number, precedesBreak = false) {
    for (let i = start; i <= end; i += 1) {
      pages.push({
        type: 'NUM',
        num: i,
        selected: i === currentPage,
        precedesBreak: i === end && precedesBreak,
      })
    }
  }
}

type PageType = {
  type: 'PREV' | 'NEXT' | 'NUM' | 'BREAK'
  num: number
  disabled?: boolean
  selected?: boolean
  precedesBreak?: boolean
}

export type PageDataProps = {
  props: {
    href?: string
    rel?: string
    'aria-label'?: string
    'aria-current'?:
      | 'page'
      | 'step'
      | 'location'
      | 'date'
      | 'time'
      | 'true'
      | 'false'
      | boolean
    'aria-hidden'?: 'true' | boolean
    'aria-disabled'?: 'true' | boolean
    onClick?: (event: MouseEvent) => void
    as?: 'span'
    role?: 'presentation'
  }
  key: string
  content: string
}

export function buildComponentData(
  page: PageType,
  hrefBuilder: (n: number) => string,
  onClick: (event: MouseEvent) => void,
): PageDataProps {
  const props: PageDataProps['props'] = {}
  let content = ''
  let key = ''

  switch (page.type) {
    case 'PREV': {
      key = 'page-prev'
      content = 'Previous'
      if (page.disabled) {
        Object.assign(props, {
          rel: 'prev',
          'aria-hidden': 'true',
          'aria-disabled': 'true',
        })
      } else {
        Object.assign(props, {
          rel: 'prev',
          href: hrefBuilder(page.num),
          'aria-label': 'Previous Page',
          onClick,
        })
      }
      break
    }
    case 'NEXT': {
      key = 'page-next'
      content = 'Next'
      if (page.disabled) {
        Object.assign(props, {
          rel: 'next',
          'aria-hidden': 'true',
          'aria-disabled': 'true',
        })
      } else {
        Object.assign(props, {
          rel: 'next',
          href: hrefBuilder(page.num),
          'aria-label': 'Next Page',
          onClick,
        })
      }
      break
    }
    case 'NUM': {
      key = `page-${page.num}`
      content = String(page.num)
      Object.assign(props, {
        href: hrefBuilder(page.num),
        'aria-label': `Page ${page.num}${page.precedesBreak ? '...' : ''}`,
        onClick,
        'aria-current': page.selected ? 'page' : undefined,
      })
      break
    }
    case 'BREAK': {
      key = `page-${page.num}-break`
      content = '…'
      Object.assign(props, { as: 'span', role: 'presentation' })
      break
    }
  }

  return { props, key, content }
}
