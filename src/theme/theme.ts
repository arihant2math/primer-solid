export type ColorMode = 'day' | 'night' | 'light' | 'dark'
export type ColorModeWithAuto = ColorMode | 'auto'
export type ColorScheme = string

export type Theme = {
  colorMode: ColorMode
  colorScheme?: ColorScheme
}

export const defaultColorMode: ColorMode = 'day'
export const defaultDayScheme = 'light'
export const defaultNightScheme = 'dark'

export const defaultTheme: Theme = {
  colorMode: defaultColorMode,
  colorScheme: defaultDayScheme,
}

const theme = defaultTheme

export function resolveColorMode(
  colorMode: ColorModeWithAuto,
  systemColorMode: ColorMode,
): ColorMode {
  return colorMode === 'auto' ? systemColorMode : colorMode
}

export function chooseColorScheme(
  colorMode: ColorMode,
  dayScheme: ColorScheme = defaultDayScheme,
  nightScheme: ColorScheme = defaultNightScheme,
): ColorScheme {
  switch (colorMode) {
    case 'day':
    case 'light':
      return dayScheme
    case 'dark':
    case 'night':
      return nightScheme
  }
}

export function getColorScheme(
  colorMode: ColorMode,
  dayScheme: ColorScheme = defaultDayScheme,
  nightScheme: ColorScheme = defaultNightScheme,
): ColorScheme {
  return chooseColorScheme(colorMode, dayScheme, nightScheme)
}

export function getThemeAttributes(theme: {
  colorMode: ColorModeWithAuto
  dayScheme?: ColorScheme
  nightScheme?: ColorScheme
  systemColorMode?: ColorMode
  colorScheme?: ColorScheme
}): {
  'data-color-mode': 'light' | 'dark' | 'auto'
  'data-light-theme': ColorScheme
  'data-dark-theme': ColorScheme
  'data-color-scheme': ColorScheme
} {
  const dayScheme = theme.dayScheme ?? defaultDayScheme
  const nightScheme = theme.nightScheme ?? defaultNightScheme
  const resolvedColorMode = resolveColorMode(
    theme.colorMode,
    theme.systemColorMode ?? defaultColorMode,
  )
  const colorScheme =
    theme.colorScheme ??
    chooseColorScheme(resolvedColorMode, dayScheme, nightScheme)

  return {
    'data-color-mode':
      theme.colorMode === 'auto'
        ? 'auto'
        : colorScheme.includes('dark')
          ? 'dark'
          : 'light',
    'data-light-theme': dayScheme,
    'data-dark-theme': nightScheme,
    'data-color-scheme': colorScheme,
  }
}

export default theme
