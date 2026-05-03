declare module '@primer/octicons' {
  import data from '@primer/octicons/build/data.json'

  export type OcticonName = keyof typeof data

  export type OcticonSvgOptions = {
    version?: string
    width?: number
    height?: number
    viewBox?: string
    class?: string
    role?: string
    'aria-hidden'?: string
    'aria-label'?: string
    'data-component'?: string
  }

  export type OcticonHeight = {
    width: number
    path: string
    ast?: unknown
    options: OcticonSvgOptions
  }

  export type OcticonDefinition = {
    name: string
    keywords: string[]
    heights: Record<string, OcticonHeight>
    symbol: string
    toSVG(options?: OcticonSvgOptions): string
  }

  const octicons: {
    [Name in keyof typeof data]: OcticonDefinition & (typeof data)[Name]
  }

  export default octicons
}
