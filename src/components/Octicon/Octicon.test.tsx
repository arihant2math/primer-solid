import { render, screen } from '@solidjs/testing-library'
import { Octicon } from './Octicon'

describe('Octicon', () => {
  it('renders an octicon by name with expected defaults', () => {
    const { container } = render(() => <Octicon name="mark-github" />)
    const svg = container.querySelector('svg')

    expect(svg).toHaveAttribute('data-component', 'Octicon')
    expect(svg).toHaveClass('octicon', 'octicon-mark-github')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('viewBox', '0 0 16 16')
  })

  it('supports the deprecated icon alias', () => {
    const { container } = render(() => <Octicon icon="alert" />)

    expect(container.querySelector('svg')).toHaveClass('octicon-alert')
  })

  it('uses the closest natural height and scales proportionally', () => {
    const { container } = render(() => <Octicon name="mark-github" size={20} />)
    const svg = container.querySelector('svg')

    expect(svg).toHaveAttribute('height', '20')
    expect(svg).toHaveAttribute('width', '20')
    expect(svg).toHaveAttribute('viewBox', '0 0 16 16')
  })

  it('derives height from width-only sizing', () => {
    const { container } = render(() => <Octicon name="x" width={48} />)
    const svg = container.querySelector('svg')

    expect(svg).toHaveAttribute('width', '48')
    expect(svg).toHaveAttribute('height', '48')
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
  })

  it('applies accessible labeling', () => {
    render(() => <Octicon name="info" aria-label="Information" />)

    expect(screen.getByRole('img', { name: 'Information' })).toBeInTheDocument()
  })

  it('accepts class, className, fill, stroke, and refs', () => {
    let element: SVGSVGElement | undefined

    const { container } = render(() => (
      <Octicon
        name="check"
        class="solid-class"
        className="react-class"
        fill="red"
        stroke="blue"
        ref={(node) => (element = node)}
        data-testid="octicon"
      />
    ))
    const svg = container.querySelector('svg')

    expect(svg).toHaveClass('solid-class', 'react-class')
    expect(svg).toHaveAttribute('fill', 'red')
    expect(svg).toHaveAttribute('stroke', 'blue')
    expect(svg).toHaveAttribute('data-testid', 'octicon')
    expect(element).toBeInstanceOf(SVGSVGElement)
  })
})
