"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/hooks/useAuth'
import './header.sass'

export default function Header() {
    const { user, profile, loading, logout, isAdmin } = useUser()
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + '/')

    return (
        <header className="site-header">
            <div className="header-inner">
                <div className="header-logo">
                    <Link href="/home">UTSFE</Link>
                </div>

                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? '✕' : '☰'}
                </button>

                <nav className={`header-nav${mobileOpen ? ' open' : ''}`} aria-label="Main navigation">
                    <ul className="header-links">
                        <li className={`header-link${isActive('/home') ? ' active' : ''}`}>
                            <Link href="/home">Home</Link>
                        </li>
                        <li className={`header-link${isActive('/articles') ? ' active' : ''}`}>
                            <Link href="/articles">Articles</Link>
                        </li>
                    </ul>

                    <div className="header-auth">
                        {loading ? null : user ? (
                            <>
                                <Link href="/profile" className={`auth-link${isActive('/profile') ? ' active' : ''}`}>
                                    Profile
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin" className={`auth-link${isActive('/admin') ? ' active' : ''}`}>
                                        Admin
                                    </Link>
                                )}
                                <button
                                    onClick={async () => {
                                        await logout()
                                        window.location.href = '/home'
                                    }}
                                    className="sign-out-btn"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/sign-in" className="auth-link">Sign In</Link>
                                <Link href="/sign-up" className="auth-link-primary">Sign Up</Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    )
}
