import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library'
import ThemeProvider, { useColorSchemeVar, useTheme } from './ThemeProvider'

const originalMatchMedia = window.matchMedia
let prefersDark = false
const listeners = new Set<(event: Event) => void>()

function emitSystemColorModeChange(nextPrefersDark: boolean) {
  prefersDark = nextPrefersDark
  const event = new Event('change')
  for (const listener of listeners) listener(event)
}

beforeEach(() => {
  prefersDark = false
  listeners.clear()

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: prefersDark,
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: (event: Event) => void) => {
        listeners.add(listener)
      },
      removeEventListener: (_type: string, listener: (event: Event) => void) => {
        listeners.delete(listener)
      },
      addListener: (listener: (event: Event) => void) => {
        listeners.add(listener)
      },
      removeListener: (listener: (event: Event) => void) => {
        listeners.delete(listener)
      },
      dispatchEvent: vi.fn(),
    })),
  })
})

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: originalMatchMedia,
  })
})

describe('ThemeProvider', () => {
  it('sets normalized light theme attributes for day mode', () => {
    render(() => (
      <ThemeProvider colorMode="day">
        <div>Day</div>
      </ThemeProvider>
    ))

    const root = screen.getByText('Day').parentElement as HTMLElement

    expect(root).toHaveAttribute('data-color-mode', 'light')
    expect(root).toHaveAttribute('data-light-theme', 'light')
    expect(root).toHaveAttribute('data-dark-theme', 'dark')
    expect(root).toHaveAttribute('data-color-scheme', 'light')
  })

  it('inherits parent day/night schemes', () => {
    render(() => (
      <ThemeProvider dayScheme="light" nightScheme="dark_dimmed">
        <ThemeProvider colorMode="night">
          <div>Nested</div>
        </ThemeProvider>
      </ThemeProvider>
    ))

    const root = screen.getByText('Nested').parentElement as HTMLElement

    expect(root).toHaveAttribute('data-color-mode', 'dark')
    expect(root).toHaveAttribute('data-light-theme', 'light')
    expect(root).toHaveAttribute('data-dark-theme', 'dark_dimmed')
    expect(root).toHaveAttribute('data-color-scheme', 'dark_dimmed')
  })

  it('returns the current color scheme value from useColorSchemeVar', () => {
    function Example() {
      const background = useColorSchemeVar(
        { light: 'white', dark_dimmed: 'navy' },
        'red',
      )

      return <div data-background={background}>Example</div>
    }

    render(() => (
      <ThemeProvider colorMode="night" nightScheme="dark_dimmed">
        <Example />
      </ThemeProvider>
    ))

    expect(screen.getByText('Example')).toHaveAttribute('data-background', 'navy')
  })

  it('tracks auto mode against the system color scheme', async () => {
    render(() => (
      <ThemeProvider colorMode="auto">
        <div>Auto</div>
      </ThemeProvider>
    ))

    const root = screen.getByText('Auto').parentElement as HTMLElement

    expect(root).toHaveAttribute('data-color-mode', 'auto')
    expect(root).toHaveAttribute('data-color-scheme', 'light')

    emitSystemColorModeChange(true)

    await waitFor(() => {
      expect(root).toHaveAttribute('data-color-scheme', 'dark')
    })
  })

  it('exposes setters through useTheme', async () => {
    function Example() {
      const theme = useTheme()

      return (
        <button type="button" onClick={() => theme.setColorMode('night')}>
          {theme.resolvedColorScheme}
        </button>
      )
    }

    render(() => (
      <ThemeProvider colorMode="day">
        <Example />
      </ThemeProvider>
    ))

    const button = screen.getByRole('button', { name: 'light' })
    const root = button.parentElement as HTMLElement

    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toHaveTextContent('dark')
      expect(root).toHaveAttribute('data-color-scheme', 'dark')
    })
  })
})
