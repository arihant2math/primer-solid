import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from 'solid-js'
import type { JSX, Setter } from 'solid-js'
import {
  chooseColorScheme,
  defaultColorMode,
  defaultDayScheme,
  defaultNightScheme,
  defaultTheme,
  getThemeAttributes,
  resolveColorMode,
} from '../../theme'
import type { ColorMode, ColorModeWithAuto, ColorScheme, Theme } from '../../theme'
import { mergeClassNames, mergeStyles } from '../../utils'

type ThemeProviderOwnProps = {
  children?: JSX.Element
  colorMode?: ColorModeWithAuto
  dayScheme?: ColorScheme
  nightScheme?: ColorScheme
  preventSSRMismatch?: boolean
  className?: string
}

export type ThemeProviderProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  keyof ThemeProviderOwnProps
> &
  ThemeProviderOwnProps

export type ThemeContextValue = {
  readonly theme: Theme
  readonly colorScheme: ColorScheme
  readonly colorMode: ColorModeWithAuto
  readonly resolvedColorMode: ColorMode
  readonly resolvedColorScheme: ColorScheme
  readonly dayScheme: ColorScheme
  readonly nightScheme: ColorScheme
  setColorMode: Setter<ColorModeWithAuto>
  setDayScheme: Setter<ColorScheme>
  setNightScheme: Setter<ColorScheme>
}

const noopSetter: Setter<any> = () => undefined

const defaultThemeContext: ThemeContextValue = {
  theme: defaultTheme,
  colorScheme: defaultDayScheme,
  colorMode: defaultColorMode,
  resolvedColorMode: defaultColorMode,
  resolvedColorScheme: defaultDayScheme,
  dayScheme: defaultDayScheme,
  nightScheme: defaultNightScheme,
  setColorMode: noopSetter,
  setDayScheme: noopSetter,
  setNightScheme: noopSetter,
}

const ThemeContext = createContext<ThemeContextValue>(defaultThemeContext)

export function useTheme() {
  return useContext(ThemeContext)
}

export function useColorSchemeVar(
  values: Partial<Record<string, string>>,
  fallback: string,
) {
  const theme = useTheme()
  return values[theme.colorScheme] ?? fallback
}

function getSystemColorMode(): ColorMode {
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    ? 'night'
    : 'day'
}

export function ThemeProvider(props: ThemeProviderProps) {
  const parent = useContext(ThemeContext)
  const [local, rest] = splitProps(props, [
    'children',
    'colorMode',
    'dayScheme',
    'nightScheme',
    'preventSSRMismatch',
    'class',
    'className',
    'style',
  ])

  const [colorMode, setColorMode] = createSignal<ColorModeWithAuto>(
    local.colorMode ?? parent.colorMode ?? defaultColorMode,
  )
  const [dayScheme, setDayScheme] = createSignal<ColorScheme>(
    local.dayScheme ?? parent.dayScheme ?? defaultDayScheme,
  )
  const [nightScheme, setNightScheme] = createSignal<ColorScheme>(
    local.nightScheme ?? parent.nightScheme ?? defaultNightScheme,
  )
  const [systemColorMode, setSystemColorMode] =
    createSignal<ColorMode>(defaultColorMode)

  createEffect(() => {
    setColorMode(local.colorMode ?? parent.colorMode ?? defaultColorMode)
  })

  createEffect(() => {
    setDayScheme(local.dayScheme ?? parent.dayScheme ?? defaultDayScheme)
  })

  createEffect(() => {
    setNightScheme(local.nightScheme ?? parent.nightScheme ?? defaultNightScheme)
  })

  onMount(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const update = () => setSystemColorMode(getSystemColorMode())

    update()

    if (!media) return

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      onCleanup(() => media.removeEventListener('change', update))
      return
    }

    media.addListener?.(update)
    onCleanup(() => media.removeListener?.(update))
  })

  const contextValue: ThemeContextValue = {
    get theme() {
      return {
        ...parent.theme,
        colorMode: resolveColorMode(colorMode(), systemColorMode()),
        colorScheme: chooseColorScheme(
          resolveColorMode(colorMode(), systemColorMode()),
          dayScheme(),
          nightScheme(),
        ),
      }
    },
    get colorScheme() {
      return chooseColorScheme(
        resolveColorMode(colorMode(), systemColorMode()),
        dayScheme(),
        nightScheme(),
      )
    },
    get colorMode() {
      return colorMode()
    },
    get resolvedColorMode() {
      return resolveColorMode(colorMode(), systemColorMode())
    },
    get resolvedColorScheme() {
      return chooseColorScheme(
        resolveColorMode(colorMode(), systemColorMode()),
        dayScheme(),
        nightScheme(),
      )
    },
    get dayScheme() {
      return dayScheme()
    },
    get nightScheme() {
      return nightScheme()
    },
    setColorMode,
    setDayScheme,
    setNightScheme,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        {...getThemeAttributes({
          colorMode: colorMode(),
          colorScheme: contextValue.colorScheme,
          dayScheme: dayScheme(),
          nightScheme: nightScheme(),
          systemColorMode: systemColorMode(),
        })}
        {...(rest as JSX.HTMLAttributes<HTMLDivElement>)}
        class={mergeClassNames(
          'PrimerSolid-ThemeProvider',
          local.className,
          local.class,
        )}
        style={mergeStyles(
          {
            color: 'var(--fgColor-default)',
            'background-color': 'var(--bgColor-default)',
          },
          local.style,
        )}
      >
        {local.children}
      </div>
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
