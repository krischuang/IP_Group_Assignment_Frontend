"use client"
import Header from '@/components/header/header'
import '../styles/global.sass'
import '../styles/main.css'
import SiteFooter from '@/components/footer/footer'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [path, setPath] = useState("")
    const pathname = usePathname()

    useEffect(() => {
        const words = pathname.slice(1).split('-')
        const update = words[0]
            ? words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + " | "
            : ""
        setPath(update)
    }, [pathname])

    return (
        <html lang='en'>
            <head>
                <title>{`${path}UTSFE`}</title>
                <meta name="description" content="UTSFE - A content management platform" />
            </head>
            <body>
                <a href='#main-content' className='skip-link'>Skip to main content</a>
                <Header />
                <main id='main-content'>
                    {children}
                </main>
                <SiteFooter />
            </body>
        </html>
    )
}
