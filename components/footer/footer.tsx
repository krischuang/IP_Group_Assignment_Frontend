"use client"

import Link from 'next/link'
import './footer.sass'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <p>&copy; 2026 UTSFE. All rights reserved.</p>

        <div className="footer-links">
          <Link href="/home">Home</Link>
          <Link href="/articles">Articles</Link>
          <Link href="/sign-in">Sign In</Link>
        </div>
      </div>
    </footer>
  )
}
