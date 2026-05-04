'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { fetchPublicArticlesList } from '@/util/api/publicArticles'

interface Article {
    id: string | number
    title: string
    summary: string
    created_at: string
    author_id?: number
}

export default function Home() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const data = await fetchPublicArticlesList()
                if (!cancelled) setArticles(data as unknown as Article[])
            } catch {
                if (!cancelled) setArticles([])
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [])

    const contributorCount = useMemo(() => {
        const ids = new Set<number>()
        for (const a of articles) {
            const aid = a.author_id
            if (typeof aid === 'number' && !Number.isNaN(aid)) ids.add(aid)
        }
        return ids.size
    }, [articles])

    function formatDate(iso: string) {
        return new Date(iso).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    function readTime(text: string | undefined) {
        if (!text) return 1
        const words = text.split(/\s+/).length
        return Math.max(1, Math.round(words / 180))
    }

    const featured = articles[0]
    const rest = articles.slice(1, 7)
    const todayStr = new Date().toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    })

    return (
        <div>
            {/* ===== Hero — asymmetric editorial ===== */}
            <section className="relative overflow-hidden border-b border-ink-300/30 bg-white">
                <div className="absolute inset-0 bg-mesh-blue opacity-80 pointer-events-none" aria-hidden="true" />
                <div className="absolute inset-0 bg-grid opacity-[0.35] pointer-events-none" aria-hidden="true" />

                <div className="section-shell relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-20 lg:py-24">
                    {/* Left — copy */}
                    <div className="relative">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 shadow-soft backdrop-blur-sm animate-fade-in">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
                            </span>
                            <span>{todayStr}</span>
                        </div>

                        <h1 className="font-bold tracking-tight text-ink-900 text-balance animate-fade-in-up">
                            <span className="block text-4xl leading-[1.05] sm:text-5xl lg:text-[3.75rem]">Stories, ideas and</span>
                            <span className="mt-1 block text-4xl leading-[1.05] sm:text-5xl lg:text-[3.75rem]">
                                <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 bg-clip-text text-transparent">knowledge</span>
                                <span className="text-ink-900">, curated.</span>
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500 text-pretty animate-fade-in-up">
                            UTSFE connects to the Internet Programming group assignment API. Read the latest articles, sign in to manage your profile, and (as an admin) publish new pieces.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-in-up">
                            <Link href="/articles" className="btn-primary px-6 py-3 text-base">
                                Start reading
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </Link>
                            <Link href="/sign-up" className="btn-secondary px-6 py-3 text-base">
                                Create an account
                            </Link>
                        </div>

                        {/* Stats row */}
                        <div className="mt-10 grid grid-cols-3 gap-4 border-t border-ink-300/40 pt-6 sm:max-w-lg animate-fade-in-up">
                            <div>
                                <div className="text-2xl font-bold tracking-tight text-ink-900 tabular-nums">
                                    {loading ? '—' : articles.length}
                                </div>
                                <div className="text-xs font-medium uppercase tracking-wider text-ink-500">Articles</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold tracking-tight text-ink-900 tabular-nums">
                                    {loading ? '—' : contributorCount || '—'}
                                </div>
                                <div className="text-xs font-medium uppercase tracking-wider text-ink-500">Authors</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold tracking-tight text-ink-900 tabular-nums">24/7</div>
                                <div className="text-xs font-medium uppercase tracking-wider text-ink-500">Always open</div>
                            </div>
                        </div>
                    </div>

                    {/* Right — stacked floating cards visual */}
                    <div className="relative hidden lg:block">
                        <div className="relative mx-auto aspect-[4/5] max-w-sm">
                            {/* back card */}
                            <div
                                className="absolute right-0 top-6 h-[78%] w-[82%] rounded-3xl border border-ink-300/40 bg-white/80 shadow-card backdrop-blur-sm"
                                style={{ transform: 'rotate(6deg)' }}
                                aria-hidden="true"
                            >
                                <div className="space-y-3 p-6">
                                    <div className="h-4 w-16 rounded-full bg-brand-100" />
                                    <div className="h-5 w-4/5 rounded bg-ink-300/40" />
                                    <div className="h-3 w-full rounded bg-ink-300/25" />
                                    <div className="h-3 w-5/6 rounded bg-ink-300/25" />
                                </div>
                            </div>
                            {/* middle card */}
                            <div
                                className="absolute left-2 top-2 h-[82%] w-[86%] rounded-3xl border border-ink-300/40 bg-white shadow-elevated"
                                style={{ transform: 'rotate(-4deg)' }}
                                aria-hidden="true"
                            >
                                <div className="space-y-3 p-7">
                                    <div className="flex items-center gap-2">
                                        <span className="badge-brand">Web</span>
                                        <span className="text-[0.7rem] text-ink-500">5 min read</span>
                                    </div>
                                    <div className="h-6 w-full rounded bg-ink-900/80" />
                                    <div className="h-6 w-3/4 rounded bg-ink-900/80" />
                                    <div className="space-y-2 pt-2">
                                        <div className="h-2.5 w-full rounded bg-ink-300/40" />
                                        <div className="h-2.5 w-11/12 rounded bg-ink-300/40" />
                                        <div className="h-2.5 w-5/6 rounded bg-ink-300/40" />
                                    </div>
                                </div>
                            </div>
                            {/* front floating accent */}
                            <div
                                className="absolute -bottom-4 right-8 flex h-24 w-44 items-center gap-3 rounded-2xl border border-ink-300/30 bg-white p-4 shadow-elevated"
                                aria-hidden="true"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand-glow">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-ink-500">Published</div>
                                    <div className="truncate text-sm font-bold text-ink-900">
                                        {loading || !featured ? 'Just now' : formatDate(featured.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Featured spotlight ===== */}
            {(loading || featured) && (
                <section className="section-shell py-16 sm:py-20">
                    <div className="mb-8 flex items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="h-px w-8 bg-brand-600" aria-hidden="true" />
                                <span className="text-xs font-bold uppercase tracking-[0.22em] text-brand-700">Editor&apos;s pick</span>
                            </div>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Featured story</h2>
                        </div>
                    </div>

                    {loading ? (
                        <div className="card grid grid-cols-1 overflow-hidden lg:grid-cols-[1.1fr_1fr]">
                            <div className="relative h-64 bg-gradient-to-br from-brand-100 to-brand-200 lg:h-auto">
                                <div className="absolute inset-0 animate-pulse bg-white/20" />
                            </div>
                            <div className="space-y-4 p-8 sm:p-10">
                                <div className="h-5 w-24 animate-pulse rounded-full bg-ink-300/30" />
                                <div className="h-8 w-3/4 animate-pulse rounded bg-ink-300/30" />
                                <div className="h-4 w-full animate-pulse rounded bg-ink-300/20" />
                                <div className="h-4 w-5/6 animate-pulse rounded bg-ink-300/20" />
                            </div>
                        </div>
                    ) : featured ? (
                        <Link
                            href={`/articles/${featured.id}`}
                            className="card group relative grid grid-cols-1 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-elevated lg:grid-cols-[1.1fr_1fr]"
                        >
                            {/* Visual panel */}
                            <div className="relative min-h-[260px] overflow-hidden bg-brand-gradient lg:min-h-full">
                                <div
                                    className="absolute inset-0 opacity-50"
                                    style={{
                                        backgroundImage:
                                            'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3), transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.2), transparent 45%)',
                                    }}
                                    aria-hidden="true"
                                />
                                <div className="absolute inset-0 bg-grid opacity-[0.18]" aria-hidden="true" />
                                <div className="relative flex h-full flex-col justify-between p-8 text-white">
                                    <div>
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider backdrop-blur-sm">
                                            Featured
                                        </span>
                                    </div>
                                    <div className="mt-10">
                                        <div className="text-[5rem] font-black leading-none tracking-tighter text-white/90 sm:text-[6rem]">
                                            01
                                        </div>
                                        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                                            / featured
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Copy panel */}
                            <div className="flex flex-col justify-between gap-6 p-8 sm:p-10">
                                <div>
                                    <div className="mb-4 flex items-center gap-3 text-xs font-medium text-ink-500">
                                        <time>{formatDate(featured.created_at)}</time>
                                        <span className="h-1 w-1 rounded-full bg-ink-300" aria-hidden="true" />
                                        <span>{readTime(featured.summary)} min read</span>
                                    </div>
                                    <h3 className="text-2xl font-bold leading-tight tracking-tight text-ink-900 transition-colors group-hover:text-brand-700 sm:text-3xl text-balance">
                                        {featured.title}
                                    </h3>
                                    <p className="mt-4 line-clamp-4 leading-relaxed text-ink-500 text-pretty">
                                        {featured.summary}
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                                    Read full article
                                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </span>
                            </div>
                        </Link>
                    ) : null}
                </section>
            )}



            {/* ===== Latest articles — numbered editorial list ===== */}
            <section className="bg-surface-muted py-16 sm:py-20">
                <div className="section-shell">
                    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="h-px w-8 bg-brand-600" aria-hidden="true" />
                                <span className="text-xs font-bold uppercase tracking-[0.22em] text-brand-700">Latest</span>
                            </div>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Recent articles</h2>
                        </div>
                        <Link
                            href="/articles"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
                        >
                            View all articles
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="divide-y divide-ink-300/40 rounded-2xl border border-ink-300/40 bg-white">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex animate-pulse items-start gap-6 p-6 sm:p-7">
                                    <div className="h-8 w-12 rounded bg-ink-300/30" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 w-20 rounded-full bg-ink-300/30" />
                                        <div className="h-5 w-3/4 rounded bg-ink-300/30" />
                                        <div className="h-4 w-full rounded bg-ink-300/20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : rest.length === 0 ? (
                        <div className="card flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20 M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" />
                                </svg>
                            </div>
                            <p className="mt-4 font-semibold text-ink-900">No more articles yet</p>
                            <p className="mt-1 text-sm text-ink-500">The featured piece is all we have for now — check back soon.</p>
                        </div>
                    ) : (
                        <ol className="divide-y divide-ink-300/30 overflow-hidden rounded-2xl border border-ink-300/40 bg-white shadow-card">
                            {rest.map((article, i) => (
                                <li key={article.id}>
                                    <Link
                                        href={`/articles/${article.id}`}
                                        className="group flex flex-col items-start gap-4 p-6 transition-colors hover:bg-brand-50/50 sm:flex-row sm:items-center sm:gap-6 sm:p-7"
                                    >
                                        {/* Index number */}
                                        <div className="shrink-0 text-4xl font-black tabular-nums text-ink-300 transition-colors group-hover:text-brand-600 sm:text-5xl">
                                            {String(i + 2).padStart(2, '0')}
                                        </div>

                                        {/* Meta + content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex flex-wrap items-center gap-3 text-xs">
                                                <time className="font-medium text-ink-500">
                                                    {formatDate(article.created_at)}
                                                </time>
                                                <span className="h-1 w-1 rounded-full bg-ink-300" aria-hidden="true" />
                                                <span className="font-medium text-ink-500">
                                                    {readTime(article.summary)} min read
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold leading-snug tracking-tight text-ink-900 transition-colors group-hover:text-brand-700 sm:text-xl text-balance">
                                                {article.title}
                                            </h3>
                                            {article.summary && (
                                                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500 text-pretty">
                                                    {article.summary}
                                                </p>
                                            )}
                                        </div>

                                        {/* Arrow */}
                                        <div className="hidden shrink-0 sm:block">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-300/40 text-ink-500 transition-all group-hover:border-brand-300 group-hover:bg-brand-600 group-hover:text-white">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                    <polyline points="12 5 19 12 12 19" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </section>

            {/* ===== CTA banner ===== */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-gradient" aria-hidden="true" />
                <div className="absolute inset-0 bg-grid opacity-[0.12]" aria-hidden="true" />
                <div
                    className="absolute inset-0 opacity-50 pointer-events-none"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 15% 30%, rgba(255,255,255,0.2), transparent 45%), radial-gradient(circle at 85% 70%, rgba(255,255,255,0.12), transparent 45%)',
                    }}
                    aria-hidden="true"
                />
                <div className="section-shell relative flex flex-col items-start justify-between gap-6 py-14 text-white sm:flex-row sm:items-center sm:py-16">
                    <div className="max-w-xl">
                        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-balance">
                            Have something to share?
                        </h2>
                        <p className="mt-2 text-white/85 text-pretty">
                            Create an account to read, bookmark, and (as an admin) publish articles on UTSFE.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/sign-up"
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 shadow-elevated transition-all duration-200 hover:scale-[1.03] hover:bg-white/95"
                        >
                            Get started
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </Link>
                        <Link
                            href="/sign-in"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
