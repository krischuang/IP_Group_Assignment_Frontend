"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Article {
    id: string | number
    title: string
    summary: string
    created_at: string
    category?: string | null
    categories?: { name: string } | null
}

interface Category {
    id: string | number
    name: string
}

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            fetch('/api/articles?published=true').then((r) => r.json()),
            fetch('/api/categories').then((r) => r.json()),
        ])
            .then(([articlesData, categoriesData]) => {
                setArticles(Array.isArray(articlesData) ? articlesData : [])
                setCategories(Array.isArray(categoriesData) ? categoriesData : [])
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    function getCategoryName(article: Article) {
        return article.category ?? article.categories?.name ?? null
    }

    const filtered = articles.filter((a) => {
        const catName = getCategoryName(a)
        const matchesCategory = !selectedCategory || catName === selectedCategory
        const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase())
        return matchesCategory && matchesSearch
    })

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
                        Browse the latest articles across every category. Use the search and filters to find exactly what you need.
                    </p>
                </div>
            </div>

            <div className="section-shell py-10 sm:py-12">
                {/* Search + filters */}
                <div className="card p-5 mb-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-sm">
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

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                                    !selectedCategory
                                        ? 'border-brand-600 bg-brand-600 text-white shadow-soft'
                                        : 'border-ink-300/60 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700'
                                }`}
                            >
                                All
                            </button>
                            {categories.map((cat) => {
                                const active = selectedCategory === cat.name
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() =>
                                            setSelectedCategory(active ? null : cat.name)
                                        }
                                        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                                            active
                                                ? 'border-brand-600 bg-brand-600 text-white shadow-soft'
                                                : 'border-ink-300/60 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Result count */}
                {!loading && (
                    <div className="mb-5 flex items-center justify-between">
                        <p className="text-sm text-ink-500">
                            {filtered.length === 0
                                ? 'No matching articles'
                                : `Showing ${filtered.length} ${filtered.length === 1 ? 'article' : 'articles'}`}
                            {selectedCategory && (
                                <>
                                    {' '}in{' '}
                                    <span className="font-semibold text-brand-700">{selectedCategory}</span>
                                </>
                            )}
                        </p>
                        {(search || selectedCategory) && (
                            <button
                                onClick={() => {
                                    setSearch('')
                                    setSelectedCategory(null)
                                }}
                                className="text-sm font-medium text-ink-500 hover:text-brand-700"
                            >
                                Clear filters
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
                        <p className="mt-4 font-semibold text-ink-900">No articles match your search</p>
                        <p className="mt-1 text-sm text-ink-500">Try a different keyword or clear the filters.</p>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((article) => (
                            <Link
                                key={article.id}
                                href={`/articles/${article.id}`}
                                className="card-interactive group flex flex-col p-6"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    {getCategoryName(article) ? (
                                        <span className="badge-brand">{getCategoryName(article)}</span>
                                    ) : (
                                        <span />
                                    )}
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
                )}
            </div>
        </section>
    )
}
