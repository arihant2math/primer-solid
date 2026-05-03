import { render, screen } from '@solidjs/testing-library'
import { Stack } from './index'
import styles from './Stack.module.css'

describe('Stack', () => {
  it('renders default responsive data attributes', () => {
    const { container } = render(() => <Stack data-testid="stack" />)

    expect(container.firstChild).toHaveClass(styles.Stack)
    expect(screen.getByTestId('stack')).toHaveAttribute('data-align', 'stretch')
    expect(screen.getByTestId('stack')).toHaveAttribute(
      'data-direction',
      'vertical',
    )
    expect(screen.getByTestId('stack')).toHaveAttribute('data-justify', 'start')
    expect(screen.getByTestId('stack')).toHaveAttribute('data-padding', 'none')
    expect(screen.getByTestId('stack')).toHaveAttribute('data-wrap', 'nowrap')
  })

  it('supports responsive container props', () => {
    render(() => (
      <Stack
        data-testid="responsive"
        align={{ narrow: 'start', regular: 'center', wide: 'baseline' }}
        direction={{ narrow: 'vertical', regular: 'horizontal' }}
        gap={{ narrow: 'tight', regular: 'normal', wide: 'spacious' }}
        justify={{ narrow: 'start', regular: 'space-between', wide: 'end' }}
        padding={{ narrow: 'tight', regular: 'normal', wide: 'spacious' }}
        paddingBlock={{ narrow: 'none', regular: 'condensed', wide: 'cozy' }}
        paddingInline={{ narrow: 'tight', regular: 'cozy', wide: 'spacious' }}
        wrap={{ narrow: 'wrap', regular: 'nowrap', wide: 'wrap' }}
      />
    ))

    const stack = screen.getByTestId('responsive')
    expect(stack).toHaveAttribute('data-align-narrow', 'start')
    expect(stack).toHaveAttribute('data-align-regular', 'center')
    expect(stack).toHaveAttribute('data-align-wide', 'baseline')
    expect(stack).toHaveAttribute('data-direction-narrow', 'vertical')
    expect(stack).toHaveAttribute('data-direction-regular', 'horizontal')
    expect(stack).toHaveAttribute('data-gap-narrow', 'tight')
    expect(stack).toHaveAttribute('data-gap-regular', 'normal')
    expect(stack).toHaveAttribute('data-gap-wide', 'spacious')
    expect(stack).toHaveAttribute('data-justify-regular', 'space-between')
    expect(stack).toHaveAttribute('data-padding-wide', 'spacious')
    expect(stack).toHaveAttribute('data-padding-block-regular', 'condensed')
    expect(stack).toHaveAttribute('data-padding-inline-wide', 'spacious')
    expect(stack).toHaveAttribute('data-wrap-wide', 'wrap')
  })

  it('supports compatibility aliases and numeric gaps', () => {
    render(() => (
      <>
        <Stack data-testid="legacy-wrap" wrap />
        <Stack data-testid="legacy-justify" justify="between" />
        <Stack data-testid="numeric-gap" gap={24} />
      </>
    ))

    expect(screen.getByTestId('legacy-wrap')).toHaveAttribute('data-wrap', 'wrap')
    expect(screen.getByTestId('legacy-justify')).toHaveAttribute(
      'data-justify',
      'space-between',
    )
    expect(screen.getByTestId('numeric-gap')).toHaveStyle({ gap: '24px' })
  })

  it('supports class, className, and custom elements', () => {
    const { container } = render(() => (
      <Stack
        as="section"
        class="solid-class"
        className="react-class"
        data-testid="section"
      >
        <span>content</span>
      </Stack>
    ))

    expect(container.firstChild?.nodeName).toBe('SECTION')
    expect(screen.getByTestId('section')).toHaveClass(styles.Stack)
    expect(screen.getByTestId('section')).toHaveClass('solid-class')
    expect(screen.getByTestId('section')).toHaveClass('react-class')
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('renders Stack.Item with responsive grow and shrink values', () => {
    const { container } = render(() => (
      <Stack>
        <Stack.Item
          data-testid="item"
          class="solid-class"
          className="react-class"
          grow={{ narrow: true, regular: false, wide: true }}
          shrink={{ narrow: false, regular: true, wide: false }}
        >
          item
        </Stack.Item>
      </Stack>
    ))

    const item = screen.getByTestId('item')
    expect(item).toHaveClass(styles.StackItem)
    expect(item).toHaveClass('solid-class')
    expect(item).toHaveClass('react-class')
    expect(item).toHaveAttribute('data-grow-narrow', 'true')
    expect(item).toHaveAttribute('data-grow-regular', 'false')
    expect(item).toHaveAttribute('data-grow-wide', 'true')
    expect(item).toHaveAttribute('data-shrink-narrow', 'false')
    expect(item).toHaveAttribute('data-shrink-regular', 'true')
    expect(item).toHaveAttribute('data-shrink-wide', 'false')
    expect(container.querySelector(`.${styles.StackItem}`)).toBe(item)
  })
})
