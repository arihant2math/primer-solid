import { render } from '@solidjs/testing-library'
import { BaseStyles } from '../BaseStyles'
import Portal, { PortalContext, registerPortalRoot } from './index'

afterEach(() => {
  document.getElementById('__primerPortalRoot__')?.remove()
})

describe('Portal', () => {
  it('renders a default portal into document.body (no BaseStyles present)', () => {
    const { baseElement } = render(() => <Portal>123test123</Portal>)
    const generatedRoot = baseElement.querySelector('#__primerPortalRoot__')

    expect(generatedRoot).toBeInstanceOf(HTMLElement)
    expect(generatedRoot).toHaveStyle({
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '100%',
    })
    expect(generatedRoot?.textContent?.trim()).toEqual('123test123')
  })

  it('renders a default portal into nearest BaseStyles element', () => {
    const { baseElement } = render(() => (
      <div id="renderedRoot">
        <BaseStyles>
          <div id="baseStylesRoot">
            <Portal>123test123</Portal>
          </div>
        </BaseStyles>
      </div>
    ))

    const baseStylesRoot = baseElement.querySelector('#baseStylesRoot')
    const baseStylesElement = baseStylesRoot?.parentElement
    const generatedRoot = baseStylesElement?.querySelector('#__primerPortalRoot__')

    expect(baseStylesRoot).toBeInstanceOf(HTMLElement)
    expect(baseStylesElement).toBeInstanceOf(HTMLElement)
    expect(generatedRoot).toBeInstanceOf(HTMLElement)
    expect(generatedRoot?.textContent?.trim()).toEqual('123test123')
  })

  it('renders into the custom portal root (default root name - declarative)', () => {
    const { baseElement } = render(() => (
      <div id="renderedRoot">
        <div id="__primerPortalRoot__"></div>
        <Portal>123test123</Portal>
      </div>
    ))

    const renderedRoot = baseElement.querySelector('#renderedRoot')
    const portalRoot = renderedRoot?.querySelector('#__primerPortalRoot__')

    expect(portalRoot).toBeInstanceOf(HTMLElement)
    expect(portalRoot?.textContent?.trim()).toEqual('123test123')
  })

  it('renders into the custom portal root (default root name - imperative)', () => {
    const { baseElement: rootBaseElement } = render(() => <div id="myPortalRoot"></div>)
    const portalRoot = rootBaseElement.querySelector('#myPortalRoot')

    expect(portalRoot).toBeInstanceOf(HTMLElement)

    registerPortalRoot(portalRoot!)

    render(() => <Portal>123test123</Portal>)

    expect(portalRoot?.textContent?.trim()).toEqual('123test123')
  })

  it('renders into multiple custom portal roots (named)', () => {
    const { baseElement } = render(() => (
      <main>
        <div id="myPortalRoot1"></div>
        <div id="myPortalRoot2"></div>
      </main>
    ))

    const fancyPortalRoot1 = baseElement.querySelector('#myPortalRoot1')
    const fancyPortalRoot2 = baseElement.querySelector('#myPortalRoot2')

    expect(fancyPortalRoot1).toBeInstanceOf(HTMLElement)
    expect(fancyPortalRoot2).toBeInstanceOf(HTMLElement)

    registerPortalRoot(fancyPortalRoot1!, 'fancyPortal1')
    registerPortalRoot(fancyPortalRoot2!, 'fancyPortal2')

    render(() => (
      <>
        <Portal>123test123</Portal>
        <Portal containerName="fancyPortal1">456test456</Portal>
        <Portal containerName="fancyPortal2">789test789</Portal>
      </>
    ))

    const generatedRoot = document.querySelector('#__primerPortalRoot__')
    expect(generatedRoot?.textContent?.trim()).toEqual('123test123')
    expect(fancyPortalRoot1?.textContent?.trim()).toEqual('456test456')
    expect(fancyPortalRoot2?.textContent?.trim()).toEqual('789test789')
  })

  it('renders into custom portal when PortalContext is supplied with portalContainerName', () => {
    const customPortalRoot = document.createElement('div')
    customPortalRoot.id = 'customContextPortal'
    document.body.appendChild(customPortalRoot)
    registerPortalRoot(customPortalRoot, 'customContext')

    render(() => (
      <PortalContext.Provider value={{ portalContainerName: 'customContext' }}>
        <Portal>context-portal-content</Portal>
      </PortalContext.Provider>
    ))

    expect(customPortalRoot.textContent?.trim()).toEqual('context-portal-content')

    document.body.removeChild(customPortalRoot)
  })

  it('renders into default portal when PortalContext does not specify portalContainerName', () => {
    const { baseElement } = render(() => (
      <PortalContext.Provider value={{}}>
        <Portal>default-portal-content</Portal>
      </PortalContext.Provider>
    ))

    const generatedRoot = baseElement.querySelector('#__primerPortalRoot__')

    expect(generatedRoot).toBeInstanceOf(HTMLElement)
    expect(generatedRoot?.textContent?.trim()).toEqual('default-portal-content')
  })

  it('renders into default portal when PortalContext portalContainerName is undefined', () => {
    const { baseElement } = render(() => (
      <PortalContext.Provider value={{ portalContainerName: undefined }}>
        <Portal>undefined-context-content</Portal>
      </PortalContext.Provider>
    ))

    const generatedRoot = baseElement.querySelector('#__primerPortalRoot__')

    expect(generatedRoot).toBeInstanceOf(HTMLElement)
    expect(generatedRoot?.textContent?.trim()).toEqual('undefined-context-content')
  })

  it('containerName prop overrides PortalContext portalContainerName', () => {
    const contextPortalRoot = document.createElement('div')
    contextPortalRoot.id = 'contextPortal'
    document.body.appendChild(contextPortalRoot)
    registerPortalRoot(contextPortalRoot, 'contextPortal')

    const propPortalRoot = document.createElement('div')
    propPortalRoot.id = 'propPortal'
    document.body.appendChild(propPortalRoot)
    registerPortalRoot(propPortalRoot, 'propPortal')

    render(() => (
      <PortalContext.Provider value={{ portalContainerName: 'contextPortal' }}>
        <Portal containerName="propPortal">prop-overrides-context</Portal>
      </PortalContext.Provider>
    ))

    expect(propPortalRoot.textContent?.trim()).toEqual('prop-overrides-context')
    expect(contextPortalRoot.textContent?.trim()).toEqual('')

    document.body.removeChild(contextPortalRoot)
    document.body.removeChild(propPortalRoot)
  })

  it('calls onMount when the portal is added to the DOM', () => {
    const onMount = vi.fn()

    render(() => <Portal onMount={onMount}>mounted</Portal>)

    expect(onMount).toHaveBeenCalledTimes(1)
  })
})
