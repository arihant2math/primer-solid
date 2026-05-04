import { render, waitFor } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Avatar } from '../Avatar'
import { AvatarStack } from './AvatarStack'
import styles from './AvatarStack.module.css'

describe('AvatarStack', () => {
  it('renders the AvatarStack class and data-component attributes', () => {
    const { container } = render(() => (
      <AvatarStack>
        <img src="https://avatars.githubusercontent.com/u/7143434?v=4" alt="" />
        <img src="https://avatars.githubusercontent.com/github" alt="" />
      </AvatarStack>
    ))

    expect(container.firstChild).toHaveClass(styles.AvatarStack)
    expect(container.querySelector('[data-component="AvatarStack"]')).toBeInTheDocument()
    expect(container.querySelector('[data-component="AvatarStack.Body"]')).toBeInTheDocument()
  })

  it('respects the alignRight prop', () => {
    const { container } = render(() => (
      <AvatarStack alignRight>
        <img src="https://avatars.githubusercontent.com/u/7143434?v=4" alt="" />
        <img src="https://avatars.githubusercontent.com/github" alt="" />
      </AvatarStack>
    ))

    expect(container.querySelector('[data-component="AvatarStack"]')).toHaveAttribute(
      'data-align-right',
      '',
    )
  })

  it('adds avatar item styling to direct children', async () => {
    const { container } = render(() => (
      <AvatarStack>
        <Avatar src="primer.png" alt="Primer" />
        <img src="https://avatars.githubusercontent.com/github" alt="" />
      </AvatarStack>
    ))

    await waitFor(() => {
      const items = container.querySelectorAll('[data-component="AvatarStack.Body"] > *')
      expect(items[0]).toHaveClass(styles.AvatarItem)
      expect(items[1]).toHaveClass(styles.AvatarItem)
    })
  })

  it('should have a tabindex of 0 if there are no interactive children', async () => {
    const { container } = render(() => (
      <AvatarStack>
        <img src="https://avatars.githubusercontent.com/u/7143434?v=4" alt="" />
        <img src="https://avatars.githubusercontent.com/github" alt="" />
      </AvatarStack>
    ))

    await waitFor(() => {
      expect(container.querySelector('[tabindex="0"]')).toBeInTheDocument()
    })
  })

  it('should not have a tabindex if there are interactive children', async () => {
    const { container } = render(() => (
      <AvatarStack>
        <button type="button">Click me</button>
      </AvatarStack>
    ))

    await waitFor(() => {
      expect(container.querySelector('[tabindex="0"]')).not.toBeInTheDocument()
    })
  })

  it('should not have a tabindex if disableExpand is true', async () => {
    const { container } = render(() => (
      <AvatarStack disableExpand>
        <img src="https://avatars.githubusercontent.com/u/7143434?v=4" alt="" />
        <img src="https://avatars.githubusercontent.com/github" alt="" />
      </AvatarStack>
    ))

    await waitFor(() => {
      expect(container.querySelector('[tabindex="0"]')).not.toBeInTheDocument()
    })
  })

  it('supports the style prop on the outermost element', () => {
    const { container } = render(() => (
      <AvatarStack style={{ 'background-color': 'red' }}>
        <img src="https://avatars.githubusercontent.com/u/7143434?v=4" alt="" />
        <img src="https://avatars.githubusercontent.com/github" alt="" />
      </AvatarStack>
    ))

    expect((container.firstChild as HTMLElement).getAttribute('style')).toContain(
      'background-color: red',
    )
  })

  it('uses Avatar child sizes when no stack size is provided', async () => {
    const { container } = render(() => (
      <AvatarStack>
        <Avatar size={32} src="primer-1.png" alt="Primer 1" />
        <Avatar size={16} src="primer-2.png" alt="Primer 2" />
        <img src="https://avatars.githubusercontent.com/github" alt="" />
      </AvatarStack>
    ))

    await waitFor(() => {
      const style = (container.firstChild as HTMLElement | null)?.getAttribute('style') || ''
      expect(style).toContain('--stackSize-narrow: 16px')
      expect(style).toContain('--stackSize-regular: 16px')
      expect(style).toContain('--stackSize-wide: 16px')
    })
  })

  it('supports responsive stack sizes', () => {
    const { container } = render(() => (
      <AvatarStack size={{ narrow: 24, regular: 32, wide: 40 }}>
        <Avatar src="primer-1.png" alt="Primer 1" />
        <Avatar src="primer-2.png" alt="Primer 2" />
      </AvatarStack>
    ))

    const root = container.querySelector('[data-component="AvatarStack"]')
    const style = root?.getAttribute('style') || ''

    expect(root).toHaveAttribute('data-responsive', '')
    expect(style).toContain('--stackSize-narrow: 24px')
    expect(style).toContain('--stackSize-regular: 32px')
    expect(style).toContain('--stackSize-wide: 40px')
  })

  it('forces direct Avatar children square when shape is square', async () => {
    const { container } = render(() => (
      <AvatarStack shape="square">
        <Avatar src="primer.png" alt="Primer" />
      </AvatarStack>
    ))

    await waitFor(() => {
      expect(container.querySelector('[data-component="Avatar"]')).toHaveAttribute(
        'data-square',
        '',
      )
    })
  })
})
