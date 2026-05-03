import { Show, createContext, createEffect, createSignal, useContext } from 'solid-js'
import type { JSX } from 'solid-js'
import { Portal as SolidPortal, isServer } from 'solid-js/web'

const PRIMER_PORTAL_ROOT_ID = '__primerPortalRoot__'
const DEFAULT_PORTAL_CONTAINER_NAME = '__default__'

const portalRootRegistry: Partial<Record<string, Element>> = {}

/**
 * Register a container to serve as a portal root.
 * @param root The element that will be the root for portals created in this container
 * @param name The name of the container, to be used with the `containerName` prop on the Portal component.
 * If name is not specified, registers the default portal root.
 */
export function registerPortalRoot(root: Element, name = DEFAULT_PORTAL_CONTAINER_NAME): void {
  portalRootRegistry[name] = root
}

function ensureDefaultPortal() {
  if (isServer) return

  const existingDefaultPortalContainer = portalRootRegistry[DEFAULT_PORTAL_CONTAINER_NAME]
  if (!existingDefaultPortalContainer || !document.body.contains(existingDefaultPortalContainer)) {
    let defaultPortalContainer = document.getElementById(PRIMER_PORTAL_ROOT_ID)
    if (!(defaultPortalContainer instanceof Element)) {
      defaultPortalContainer = document.createElement('div')
      defaultPortalContainer.setAttribute('id', PRIMER_PORTAL_ROOT_ID)
      defaultPortalContainer.style.position = 'absolute'
      defaultPortalContainer.style.top = '0'
      defaultPortalContainer.style.left = '0'
      defaultPortalContainer.style.width = '100%'

      const suitablePortalRoot = document.querySelector('[data-portal-root]')
      if (suitablePortalRoot) {
        suitablePortalRoot.appendChild(defaultPortalContainer)
      } else {
        document.body.appendChild(defaultPortalContainer)
      }
    }

    registerPortalRoot(defaultPortalContainer)
  }
}

/**
 * Provides the ability for component trees to override the portal root container for a sub-set of the experience.
 * The portal will prioritize the context value unless overridden by its own `containerName` prop, and fallback to the default root if neither are specified.
 */
export const PortalContext = createContext<{
  portalContainerName?: string
}>({})

export interface PortalProps {
  /**
   * The content to render into the portal.
   */
  children?: JSX.Element

  /**
   * Called when this portal is added to the DOM.
   */
  onMount?: () => void

  /**
   * Optional. Mount this portal at the container specified by this name.
   * The container must be previously registered with `registerPortalRoot`.
   */
  containerName?: string
}

/**
 * Creates a Solid portal, placing all children in a separate physical DOM root node.
 */
export function Portal(props: PortalProps) {
  const { portalContainerName } = useContext(PortalContext)

  if (isServer) return null

  const [mount, setMount] = createSignal<Node>()

  createEffect(() => {
    let containerName = props.containerName ?? portalContainerName

    if (containerName === undefined) {
      containerName = DEFAULT_PORTAL_CONTAINER_NAME
      ensureDefaultPortal()
    }

    const parentElement = portalRootRegistry[containerName]

    if (!parentElement) {
      throw new Error(
        `Portal container '${containerName}' is not yet registered. Container must be registered with registerPortalRoot before use.`,
      )
    }

    setMount(parentElement)
  })

  return (
    <Show when={mount()}>
      {(parentElement) => (
        <SolidPortal
          mount={parentElement()}
          ref={(element) => {
            element.style.position = 'relative'
            element.style.zIndex = '1'
            props.onMount?.()
          }}
        >
          {props.children}
        </SolidPortal>
      )}
    </Show>
  )
}

export default Portal
