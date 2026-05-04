"use client"

import Link from 'next/link'
import './footer.sass'

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-top">
                    <div className="footer-brand">
                        <span className="brand-mark">UTSFE</span>
                        <p className="brand-tagline">
                            A modern content management platform for discovering and sharing knowledge.
                        </p>
                    </div>

                    <div className="footer-links" aria-label="Footer navigation">
                        <Link href="/home">Home</Link>
                        <Link href="/articles">Articles</Link>
                        <Link href="/sign-in">Sign In</Link>
                        <Link href="/sign-up">Sign Up</Link>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} UTSFE. All rights reserved.</p>
                    <span className="footer-meta">Built for UTS Internet Programming</span>
                </div>
            </div>
        </footer>
    )
}
