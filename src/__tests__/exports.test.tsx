import { render, screen } from '@solidjs/testing-library'
import {
  Avatar,
  AvatarStack,
  BaseStyles,
  BranchName,
  Button,
  Card,
  Flash,
  Label,
  MarkGithubIcon,
  Octicon,
  ThemeProvider,
  octicons,
} from '../index'

describe('@primer/solid', () => {
  it('renders a themed Primer Solid button', () => {
    render(() => (
      <ThemeProvider colorMode="day">
        <BaseStyles>
          <Button variant="primary">Save changes</Button>
        </BaseStyles>
      </ThemeProvider>
    ))

    expect(
      screen.getByRole('button', { name: 'Save changes' }),
    ).toHaveAttribute('data-variant', 'primary')
  })

  it('exports Avatar', () => {
    const { container } = render(() => <Avatar src="primer.png" alt="Primer" />)

    expect(container.querySelector('[data-component="Avatar"]')).toBeInTheDocument()
  })

  it('exports AvatarStack', () => {
    const { container } = render(() => (
      <AvatarStack>
        <Avatar src="primer-1.png" alt="Primer 1" />
        <Avatar src="primer-2.png" alt="Primer 2" />
      </AvatarStack>
    ))

    expect(
      container.querySelector('[data-component="AvatarStack"]'),
    ).toBeInTheDocument()
  })

  it('exports Card', () => {
    render(() => (
      <Card>
        <Card.Heading>Exported card</Card.Heading>
      </Card>
    ))

    expect(screen.getByText('Exported card')).toBeInTheDocument()
  })

  it('exports Label', () => {
    render(() => <Label>Beta</Label>)

    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('exports Flash', () => {
    render(() => <Flash>Notice</Flash>)

    expect(screen.getByText('Notice')).toBeInTheDocument()
  })

  it('exports BranchName', () => {
    render(() => <BranchName href="/tree/main">main</BranchName>)

    expect(screen.getByRole('link', { name: 'main' })).toHaveAttribute(
      'href',
      '/tree/main',
    )
  })

  it('exports Octicon', () => {
    const { container } = render(() => <Octicon icon={MarkGithubIcon} />)

    expect(
      container.querySelector('[data-component="Octicon"]'),
    ).toBeInTheDocument()
  })

  it('exports icon components', () => {
    const { container } = render(() => <MarkGithubIcon />)

    expect(container.querySelector('.octicon-mark-github')).toBeInTheDocument()
  })

  it('exports octicons', () => {
    expect(octicons['mark-github']).toBeDefined()
  })
})
