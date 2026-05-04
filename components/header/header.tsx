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
                    <Link href="/home" aria-label="UTSFE home">
                        <span>UTSFE</span>
                    </Link>
                </div>

                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileOpen}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {mobileOpen ? (
                            <>
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </>
                        ) : (
                            <>
                                <line x1="3" y1="7" x2="21" y2="7" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="17" x2="21" y2="17" />
                            </>
                        )}
                    </svg>
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
