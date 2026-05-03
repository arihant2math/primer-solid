import { render, screen } from '@solidjs/testing-library'
import { BaseStyles, Button, ThemeProvider } from '../index'

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
})
