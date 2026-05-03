import { render } from 'solid-js/web'
import {
  BaseStyles,
  Button,
  Heading,
  Stack,
  Text,
  ThemeProvider,
} from './index'

function DevApp() {
  return (
    <ThemeProvider colorMode="day">
      <BaseStyles style={{ padding: '2rem' }}>
        <Stack gap="spacious">
          <Heading as="h1" size="large">
            Primer Solid
          </Heading>
          <Text style={{ color: 'var(--fgColor-muted)' }}>
            A SolidJS component library inspired by Primer React.
          </Text>
          <Stack direction="horizontal" align="center">
            <Button variant="primary">Primary action</Button>
            <Button>Default action</Button>
            <Button variant="invisible">Invisible action</Button>
          </Stack>
        </Stack>
      </BaseStyles>
    </ThemeProvider>
  )
}

render(() => <DevApp />, document.getElementById('root')!)
