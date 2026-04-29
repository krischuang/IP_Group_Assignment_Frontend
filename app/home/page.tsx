'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Article {
    id: string | number
    title: string
    summary: string
    created_at: string
    category?: string | null
    categories?: { name: string } | null
}

export default function Home() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/articles?published=true')
            .then((r) => r.json())
            .then((data) => {
                setArticles(Array.isArray(data) ? data.slice(0, 6) : [])
            })
            .catch(() => setArticles([]))
            .finally(() => setLoading(false))
    }, [])

    function getCategoryName(article: Article) {
        return article.category ?? article.categories?.name ?? null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section
                className="py-20 text-white"
                style={{ background: 'linear-gradient(135deg, #D93C3E 0%, #a02d2f 100%)' }}
            >
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Welcome to UTSFE
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
                        A modern content management platform for discovering and sharing knowledge.
                    </p>
                    <Link
                        href="/articles"
                        className="inline-block bg-white text-red-600 font-semibold px-8 py-4 rounded-xl text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                        Browse Articles
                    </Link>
                </div>
            </section>

            {/* Latest Articles Section */}
            <section className="max-w-6xl mx-auto px-6 py-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Latest Articles
                </h2>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500" />
                    </div>
                ) : articles.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">
                        No articles published yet. Check back soon!
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <Link
                                key={article.id}
                                href={`/articles/${article.id}`}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden group"
                            >
                                <div className="p-6 flex flex-col h-full">
                                    {getCategoryName(article) && (
                                        <span className="inline-block self-start bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                                            {getCategoryName(article)}
                                        </span>
                                    )}
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                                        {article.summary}
                                    </p>
                                    <time className="text-xs text-gray-400">
                                        {new Date(article.created_at).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </time>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="text-center mt-12">
                    <Link
                        href="/articles"
                        className="inline-block border-2 border-red-500 text-red-600 font-semibold px-8 py-3 rounded-xl hover:bg-red-50 transition-colors duration-200"
                    >
                        View All Articles
                    </Link>
                </div>
            </section>
        </div>
    )
}
