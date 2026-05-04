import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Avatar } from './Avatar'
import styles from './Avatar.module.css'

describe('Avatar', () => {
  it('renders the Avatar class and data-component attribute', () => {
    const { container } = render(() => (
      <Avatar src="primer.png" alt="" data-testid="avatar" />
    ))

    expect(container.firstChild).toHaveClass(styles.Avatar)
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-component', 'Avatar')
  })

  it('renders at the default size', () => {
    render(() => <Avatar src="primer.png" data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')

    expect(avatar).toHaveAttribute('width', '20')
    expect(avatar).toHaveAttribute('height', '20')
  })

  it('respects the size prop', () => {
    render(() => (
      <Avatar size={40} src="primer.png" alt="github" data-testid="avatar" />
    ))
    const avatar = screen.getByTestId('avatar')

    expect(avatar).toHaveAttribute('width', '40')
    expect(avatar).toHaveAttribute('height', '40')
  })

  it('supports responsive sizes via CSS variables and data attributes', () => {
    render(() => (
      <Avatar
        size={{ narrow: 16, regular: 20, wide: 24 }}
        src="primer.png"
        data-testid="avatar"
      />
    ))
    const avatar = screen.getByTestId('avatar')
    const style = avatar.getAttribute('style') || ''

    expect(avatar).toHaveAttribute('data-responsive', '')
    expect(avatar).not.toHaveAttribute('width')
    expect(avatar).not.toHaveAttribute('height')
    expect(style).toContain('--avatarSize-narrow: 16px')
    expect(style).toContain('--avatarSize-regular: 20px')
    expect(style).toContain('--avatarSize-wide: 24px')
  })

  it('renders square avatars with the data-square attribute', () => {
    render(() => <Avatar square src="primer.png" data-testid="avatar" />)

    expect(screen.getByTestId('avatar')).toHaveAttribute('data-square', '')
  })

  it('supports the style prop without overriding internal styles', () => {
    render(() => (
      <Avatar
        data-testid="avatar"
        src="primer.png"
        style={{
          background: 'black',
        }}
      />
    ))

    const avatar = screen.getByTestId('avatar')
    const style = avatar.getAttribute('style') || ''

    expect(style).toContain('--avatarSize-regular: 20px')
    expect(style).toContain('background: black')
  })

  it('supports className and ref', () => {
    const ref = vi.fn<(element: HTMLImageElement) => void>()
    const { container } = render(() => (
      <Avatar src="primer.png" class="solid-class" className="react-class" ref={ref} />
    ))

    expect(container.firstChild).toHaveClass('solid-class')
    expect(container.firstChild).toHaveClass('react-class')
    expect(ref).toHaveBeenCalledWith(container.firstChild)
  })
})
