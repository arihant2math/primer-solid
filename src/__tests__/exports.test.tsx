import { render, screen } from '@solidjs/testing-library'
import {
  Avatar,
  AvatarStack,
  BaseStyles,
  BranchName,
  Button,
  Card,
  Flash,
  LinkButton,
  Pagination,
  Label,
  MarkGithubIcon,
  SegmentedControl,
  Octicon,
  Radio,
  RadioGroup,
  RelativeTime,
  ThemeProvider,
  octicons,
  theme,
  useColorSchemeVar,
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

    expect(
      container.querySelector('[data-component="Avatar"]'),
    ).toBeInTheDocument()
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

  it('exports LinkButton', () => {
    render(() => <LinkButton href="/pulls">Pull requests</LinkButton>)

    expect(screen.getByRole('link', { name: 'Pull requests' })).toHaveAttribute(
      'href',
      '/pulls',
    )
  })

  it('exports BranchName', () => {
    render(() => <BranchName href="/tree/main">main</BranchName>)

    expect(screen.getByRole('link', { name: 'main' })).toHaveAttribute(
      'href',
      '/tree/main',
    )
  })

  it('exports Pagination', () => {
    const { container } = render(() => (
      <Pagination pageCount={5} currentPage={3} />
    ))

    expect(
      container.querySelector('[data-component="Pagination"]'),
    ).toBeInTheDocument()
  })

  it('exports Octicon', () => {
    const { container } = render(() => <Octicon icon={MarkGithubIcon} />)

    expect(
      container.querySelector('[data-component="Octicon"]'),
    ).toBeInTheDocument()
  })

  it('exports SegmentedControl', () => {
    const { container } = render(() => (
      <SegmentedControl aria-label="View">
        <SegmentedControl.Button>Preview</SegmentedControl.Button>
        <SegmentedControl.Button>Code</SegmentedControl.Button>
      </SegmentedControl>
    ))

    expect(
      container.querySelector('[data-component="SegmentedControl"]'),
    ).toBeInTheDocument()
  })

  it('exports Radio', () => {
    render(() => <Radio name="choices" value="one" />)

    expect(screen.getByRole('radio')).toBeInTheDocument()
  })

  it('exports RadioGroup', () => {
    render(() => (
      <RadioGroup name="choices">
        <RadioGroup.Label>Choices</RadioGroup.Label>
        <label>
          <Radio value="one" />
          Choice one
        </label>
      </RadioGroup>
    ))

    expect(screen.getByRole('group', { name: 'Choices' })).toBeInTheDocument()
  })

  it('exports RelativeTime', () => {
    const { container } = render(() => (
      <RelativeTime date={new Date('2024-03-07T12:22:48.123Z')} />
    ))

    expect(container.firstChild?.nodeName.toLowerCase()).toBe('relative-time')
  })

  it('exports icon components', () => {
    const { container } = render(() => <MarkGithubIcon />)

    expect(container.querySelector('.octicon-mark-github')).toBeInTheDocument()
  })

  it('exports octicons', () => {
    expect(octicons['mark-github']).toBeDefined()
  })

  it('exports theme', () => {
    expect(theme.colorMode).toBe('day')
    expect(theme.colorScheme).toBe('light')
  })

  it('exports useColorSchemeVar', () => {
    function Example() {
      const value = useColorSchemeVar({ light: 'a', dark: 'b' }, 'fallback')
      return <span data-value={value}>hook</span>
    }

    render(() => (
      <ThemeProvider colorMode="day">
        <Example />
      </ThemeProvider>
    ))

    expect(screen.getByText('hook')).toHaveAttribute('data-value', 'a')
  })
})
