"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchPublicArticlesList } from '@/util/api/publicArticles'
import type { Article } from '@/types/article'

const PAGE_SIZE = 9

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            setLoading(true)
            setLoadError(null)
            try {
                const data = await fetchPublicArticlesList()
                if (!cancelled) setArticles(data as unknown as Article[])
            } catch {
                if (!cancelled) {
                    setArticles([])
                    setLoadError('Could not load articles. Try again shortly.')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => { setPage(1) }, [search])

    const filtered = articles.filter(
        (a) => !search || a.title.toLowerCase().includes(search.toLowerCase()),
    )
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    function formatDate(iso: string) {
        return new Date(iso).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    function truncate(text: string, max: number) {
        if (!text) return ''
        return text.length > max ? text.slice(0, max).trimEnd() + '…' : text
    }

    return (
        <section className="relative">
            {/* Page header */}
            <div className="relative overflow-hidden border-b border-ink-300/40 bg-white">
                <div className="absolute inset-0 bg-brand-radial opacity-70 pointer-events-none" aria-hidden="true" />
                <div className="section-shell relative py-14 sm:py-16">
                    <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Knowledge base</p>
                    <h1 className="mt-2 page-title text-balance">
                        Articles
                    </h1>
                    <p className="mt-3 max-w-2xl text-base text-ink-500 text-pretty">
                        Browse articles from the assignment API. Search by title — the backend does not expose categories or drafts.
                    </p>
                </div>
            </div>

            <div className="section-shell py-10 sm:py-12">
                {/* Search */}
                <div className="card p-5 mb-8">
                    <div className="relative max-w-xl">
                        <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="7" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search articles by title…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="field-input pl-10"
                            aria-label="Search articles"
                        />
                    </div>
                </div>

                {/* Result count */}
                {!loading && (
                    <div className="mb-5 flex items-center justify-between">
                        <p className="text-sm text-ink-500">
                            {loadError
                                ? loadError
                                : filtered.length === 0 && !search && articles.length === 0
                                  ? 'No articles on the server yet'
                                  : filtered.length === 0
                                    ? 'No matching articles'
                                    : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} ${filtered.length === 1 ? 'article' : 'articles'}`}
                        </p>
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="text-sm font-medium text-ink-500 hover:text-brand-700"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="card p-6">
                                <div className="mb-3 h-5 w-20 animate-pulse rounded-full bg-ink-300/30" />
                                <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-ink-300/30" />
                                <div className="mb-2 h-4 w-full animate-pulse rounded bg-ink-300/20" />
                                <div className="mb-4 h-4 w-5/6 animate-pulse rounded bg-ink-300/20" />
                                <div className="flex items-center justify-between">
                                    <div className="h-4 w-24 animate-pulse rounded bg-ink-300/20" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="card flex flex-col items-center justify-center py-20 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-300/20 text-ink-500">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="7" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <p className="mt-4 font-semibold text-ink-900">
                            {loadError
                                ? 'Unable to load articles'
                                : search
                                  ? 'No articles match your search'
                                  : 'No articles yet'}
                        </p>
                        <p className="mt-1 text-sm text-ink-500">
                            {loadError
                                ? loadError
                                : search
                                  ? 'Try a different keyword or clear the search.'
                                  : 'Published articles will appear here once they exist on the server.'}
                        </p>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {paginated.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/articles/${article.id}`}
                                    className="card-interactive group flex flex-col p-6"
                                >
                                    <div className="mb-3 flex justify-end">
                                        <time className="text-xs text-ink-500">{formatDate(article.created_at)}</time>
                                    </div>
                                    <h2 className="line-clamp-2 text-lg font-semibold text-ink-900 transition-colors group-hover:text-brand-700">
                                        {article.title}
                                    </h2>
                                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-500">
                                        {truncate(article.summary, 140)}
                                    </p>
                                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                                        Read article
                                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300/60 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="19" y1="12" x2="5" y2="12" />
                                        <polyline points="12 19 5 12 12 5" />
                                    </svg>
                                    Previous
                                </button>
                                <span className="text-sm text-ink-500">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300/60 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    )
}
