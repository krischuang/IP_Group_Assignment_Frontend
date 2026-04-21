"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabaseClient } from '@/util/supabase/client'

interface Article {
    id: string
    title: string
    summary: string
    created_at: string
    categories: { name: string } | null
}

interface Category {
    id: string
    name: string
}

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const [articlesRes, categoriesRes] = await Promise.all([
                supabaseClient
                    .from('articles')
                    .select('id, title, summary, created_at, categories(name)')
                    .eq('published', true)
                    .order('created_at', { ascending: false }),
                supabaseClient.from('categories').select('id, name'),
            ])

            if (articlesRes.data) setArticles(articlesRes.data as unknown as Article[])
            if (categoriesRes.data) setCategories(categoriesRes.data as Category[])
            setLoading(false)
        }

        fetchData()
    }, [])

    const filtered = articles.filter((a) => {
        const matchesCategory =
            !selectedCategory || a.categories?.name === selectedCategory
        const matchesSearch =
            !search || a.title.toLowerCase().includes(search.toLowerCase())
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
        <section className="mx-auto max-w-6xl px-4 py-12">
            <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
                Articles
            </h1>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search articles…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                               placeholder-gray-400 shadow-sm transition
                               focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
                               sm:max-w-sm"
                />
            </div>

            {/* Category filters */}
            <div className="mb-8 flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition
                        ${!selectedCategory
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() =>
                            setSelectedCategory(
                                selectedCategory === cat.name ? null : cat.name
                            )
                        }
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition
                            ${selectedCategory === cat.name
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Loading skeleton */}
            {loading && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-3 h-5 w-3/4 rounded bg-gray-200" />
                            <div className="mb-2 h-4 w-full rounded bg-gray-200" />
                            <div className="mb-4 h-4 w-5/6 rounded bg-gray-200" />
                            <div className="flex items-center justify-between">
                                <div className="h-5 w-16 rounded-full bg-gray-200" />
                                <div className="h-4 w-20 rounded bg-gray-200" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Article grid */}
            {!loading && filtered.length === 0 && (
                <p className="py-16 text-center text-gray-500">
                    No articles found.
                </p>
            )}

            {!loading && filtered.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((article) => (
                        <Link
                            key={article.id}
                            href={`/articles/${article.id}`}
                            className="group flex flex-col rounded-xl border border-gray-200 bg-white
                                       p-6 shadow-sm transition hover:shadow-md"
                        >
                            <h2 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                                {article.title}
                            </h2>
                            <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">
                                {truncate(article.summary, 120)}
                            </p>
                            <div className="flex items-center justify-between">
                                {article.categories?.name && (
                                    <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-700">
                                        {article.categories.name}
                                    </span>
                                )}
                                <span className="text-xs text-gray-400">
                                    {formatDate(article.created_at)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    )
}
