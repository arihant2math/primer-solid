# Primer Solid

A SolidJS implementation of GitHub's Primer Design System.

This repository is initialized as a component library inspired by the structure and APIs of `@primer/react`.

## Installation

```sh
npm install @primer/solid solid-js
```

## Usage

```tsx
import { BaseStyles, Button, ThemeProvider } from '@primer/solid'

export function App() {
  return (
    <ThemeProvider colorMode="day">
      <BaseStyles>
        <Button variant="primary">Save changes</Button>
      </BaseStyles>
    </ThemeProvider>
  )
}
```

## Development

```sh
npm install
npm run build
npm test
```

## Components included

- `ThemeProvider`
- `BaseStyles`
- `Box`
- `Button`
- `Text`
- `Heading`
- `Link`
- `Stack`
- `Avatar`
- `AvatarStack`
- `VisuallyHidden`

The library is intentionally small at initialization time, with a foundation for porting additional Primer React components into Solid.
