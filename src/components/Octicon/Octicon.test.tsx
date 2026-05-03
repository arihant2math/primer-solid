import { render, screen } from '@solidjs/testing-library'
import { CheckIcon, InfoIcon, MarkGithubIcon, Octicon, XIcon } from './index'

describe('Octicon', () => {
  it('renders icon components with expected defaults', () => {
    const { container } = render(() => <MarkGithubIcon />)
    const svg = container.querySelector('svg')

    expect(svg).toHaveAttribute('data-component', 'Octicon')
    expect(svg).toHaveClass('octicon', 'octicon-mark-github')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('viewBox', '0 0 16 16')
    expect(svg).toHaveAttribute('width', '16')
    expect(svg).toHaveAttribute('height', '16')
  })

  it('renders the deprecated wrapper with a react-compatible icon prop', () => {
    const { container } = render(() => <Octicon icon={MarkGithubIcon} />)

    expect(container.querySelector('svg')).toHaveClass('octicon-mark-github')
  })

  it('supports the deprecated string icon aliases', () => {
    const { container } = render(() => <Octicon icon="alert" />)

    expect(container.querySelector('svg')).toHaveClass('octicon-alert')
  })

  it('supports numeric and token sizes', () => {
    const { container } = render(() => (
      <>
        <MarkGithubIcon size={20} />
        <XIcon size="medium" data-testid="x-icon" />
      </>
    ))
    const [markGithub, xIcon] = Array.from(container.querySelectorAll('svg'))

    expect(markGithub).toHaveAttribute('width', '20')
    expect(markGithub).toHaveAttribute('height', '20')
    expect(xIcon).toHaveAttribute('width', '32')
    expect(xIcon).toHaveAttribute('height', '32')
    expect(screen.getByTestId('x-icon')).toHaveAttribute('viewBox', '0 0 24 24')
  })

  it('applies accessible labeling', () => {
    render(() => <InfoIcon aria-label="Information" />)

    expect(screen.getByRole('img', { name: 'Information' })).toBeInTheDocument()
  })

  it('passes props and refs through the deprecated wrapper', () => {
    let element: SVGSVGElement | undefined

    const { container } = render(() => (
      <Octicon
        icon={CheckIcon}
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
