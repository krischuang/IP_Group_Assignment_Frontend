"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Article {
    id: string | number
    title: string
    content: string
    summary: string
    created_at: string
    category?: string | null
    categories?: { name: string } | null
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
                <pre
                    key={i}
                    className="my-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm leading-relaxed text-gray-100"
                >
                    <code>{code}</code>
                </pre>
            )
        }

        if (trimmed.startsWith('## ')) {
            return (
                <h2 key={i} className="mb-3 mt-8 text-xl font-bold text-gray-900">
                    {formatInline(trimmed.slice(3))}
                </h2>
            )
        }

        const listLines = trimmed.split('\n').filter((l) => l.trimStart().startsWith('- '))
        if (listLines.length === trimmed.split('\n').length) {
            return (
                <ul key={i} className="my-3 list-disc space-y-1 pl-6 text-gray-700">
                    {listLines.map((line, j) => (
                        <li key={j}>{formatInline(line.replace(/^\s*-\s*/, ''))}</li>
                    ))}
                </ul>
            )
        }

        return (
            <p key={i} className="my-3 leading-relaxed text-gray-700">
                {formatInline(trimmed)}
            </p>
        )
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
            parts.push(
                <strong key={match.index} className="font-semibold text-gray-900">
                    {match[2]}
                </strong>
            )
        } else if (match[3]) {
            parts.push(
                <code
                    key={match.index}
                    className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-pink-600"
                >
                    {match[3]}
                </code>
            )
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
        fetch(`/api/articles/${id}`)
            .then(async (r) => {
                if (!r.ok) throw new Error('Article not found')
                return r.json()
            })
            .then(setArticle)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false))
    }, [id])

    function getCategoryName(a: Article) {
        return a.category ?? a.categories?.name ?? null
    }

    function getAuthorName(a: Article) {
        return a.author_name ?? a.users?.full_name ?? null
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
            <section className="mx-auto max-w-3xl px-4 py-12">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 w-20 rounded bg-gray-200" />
                    <div className="h-8 w-3/4 rounded bg-gray-200" />
                    <div className="flex gap-3">
                        <div className="h-5 w-24 rounded-full bg-gray-200" />
                        <div className="h-5 w-32 rounded bg-gray-200" />
                    </div>
                    <div className="space-y-3 pt-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-4 w-full rounded bg-gray-200" />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (error || !article) {
        return (
            <section className="mx-auto max-w-3xl px-4 py-12 text-center">
                <p className="mb-4 text-gray-500">{error ?? 'Article not found.'}</p>
                <Link href="/articles" className="text-sm font-medium text-blue-600 hover:underline">
                    &larr; Back to articles
                </Link>
            </section>
        )
    }

    return (
        <article className="mx-auto max-w-3xl px-4 py-12">
            <Link
                href="/articles"
                className="mb-6 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
                &larr; Back to articles
            </Link>

            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
                {article.title}
            </h1>

            <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {getCategoryName(article) && (
                    <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-700">
                        {getCategoryName(article)}
                    </span>
                )}
                {getAuthorName(article) && <span>By {getAuthorName(article)}</span>}
                <span>{formatDate(article.created_at)}</span>
            </div>

            <div className="prose-custom">
                {renderMarkdown(article.content)}
            </div>
        </article>
    )
}
