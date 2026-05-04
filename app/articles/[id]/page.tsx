"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { fetchPublicArticleById } from '@/util/api/publicArticles'

interface Article {
    id: string | number
    title: string
    content: string
    summary: string
    created_at: string
    author_id?: number | null
    author_name?: string | null
    users?: { full_name: string; email: string } | null
}

function renderMarkdown(text: string) {
    const blocks = text.split('\n\n')

    return blocks.map((block, i) => {
        const trimmed = block.trim()
        if (!trimmed) return null

        if (trimmed.startsWith('```')) {
            const lines = trimmed.split('\n')
            const code = lines.slice(1, lines[lines.length - 1] === '```' ? -1 : undefined).join('\n')
            return (
                <pre key={i}>
                    <code>{code}</code>
                </pre>
            )
        }

        if (trimmed.startsWith('## ')) {
            return <h2 key={i}>{formatInline(trimmed.slice(3))}</h2>
        }

        const listLines = trimmed.split('\n').filter((l) => l.trimStart().startsWith('- '))
        if (listLines.length === trimmed.split('\n').length) {
            return (
                <ul key={i}>
                    {listLines.map((line, j) => (
                        <li key={j}>{formatInline(line.replace(/^\s*-\s*/, ''))}</li>
                    ))}
                </ul>
            )
        }

        return <p key={i}>{formatInline(trimmed)}</p>
    })
}

function formatInline(text: string) {
    const parts: (string | JSX.Element)[] = []
    const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g
    let last = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) parts.push(text.slice(last, match.index))
        if (match[2]) {
            parts.push(<strong key={match.index}>{match[2]}</strong>)
        } else if (match[3]) {
            parts.push(<code key={match.index}>{match[3]}</code>)
        }
        last = match.index + match[0].length
    }

    if (last < text.length) parts.push(text.slice(last))
    return <>{parts}</>
}

export default function ArticlePage() {
    const { id } = useParams<{ id: string }>()
    const [article, setArticle] = useState<Article | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        let cancelled = false
        ;(async () => {
            try {
                const row = await fetchPublicArticleById(String(id))
                if (cancelled) return
                if (!row) {
                    setError('Article not found')
                    setArticle(null)
                } else {
                    setArticle(row as unknown as Article)
                }
            } catch {
                if (!cancelled) setError('Something went wrong')
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [id])

    function authorLine(a: Article): string | null {
        const byName = a.author_name ?? a.users?.full_name ?? null
        if (byName) return byName
        const aid = a.author_id
        if (typeof aid === 'number' && !Number.isNaN(aid)) return `Author #${aid}`
        return null
    }

    function formatDate(iso: string) {
        return new Date(iso).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    if (loading) {
        return (
            <section className="section-shell py-14 max-w-3xl">
                <div className="space-y-4 animate-pulse">
                    <div className="h-4 w-28 rounded bg-ink-300/30" />
                    <div className="h-10 w-3/4 rounded bg-ink-300/30" />
                    <div className="flex gap-3">
                        <div className="h-5 w-24 rounded-full bg-ink-300/30" />
                        <div className="h-5 w-32 rounded bg-ink-300/30" />
                    </div>
                    <div className="space-y-3 pt-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-4 w-full rounded bg-ink-300/20" />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (error || !article) {
        return (
            <section className="section-shell max-w-3xl py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <h1 className="mt-4 text-2xl font-bold text-ink-900">
                    {error === 'Article not found' ? 'Article not found' : 'Something went wrong'}
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
                    {error ?? 'The article you are looking for is unavailable.'}
                </p>
                <Link href="/articles" className="btn-primary mt-6">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to articles
                </Link>
            </section>
        )
    }

    const byline = authorLine(article)

    return (
        <article className="relative">
            <div className="relative overflow-hidden border-b border-ink-300/40 bg-white">
                <div className="absolute inset-0 bg-brand-radial opacity-70 pointer-events-none" aria-hidden="true" />
                <div className="section-shell relative max-w-3xl py-12 sm:py-16">
                    <Link
                        href="/articles"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to articles
                    </Link>

                    <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-ink-900 sm:text-4xl lg:text-[2.75rem] text-balance">
                        {article.title}
                    </h1>

                    <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-500">
                        {byline ? (
                            <>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[0.65rem] font-bold uppercase text-brand-700">
                                        {byline.charAt(0)}
                                    </span>
                                    <span className="font-medium text-ink-700">{byline}</span>
                                </span>
                                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-ink-300" />
                            </>
                        ) : null}
                        <span>{formatDate(article.created_at)}</span>
                    </div>
                </div>
            </div>

            <div className="section-shell max-w-3xl py-10 sm:py-14">
                {article.summary && (
                    <p className="mb-10 rounded-2xl border-l-4 border-brand-500 bg-brand-50/60 px-6 py-4 text-base leading-relaxed text-ink-700 text-pretty">
                        {article.summary}
                    </p>
                )}
                <div className="prose-article">{renderMarkdown(article.content)}</div>

                <div className="mt-14 border-t border-ink-300/40 pt-8">
                    <Link
                        href="/articles"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to all articles
                    </Link>
                </div>
            </div>
        </article>
    )
}
