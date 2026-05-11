"use client"

import { useEffect, useRef, useState } from 'react'
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
    ai_job_id?: string | null
    ai_summary?: string | null
    ai_key_points?: string[] | null
    ai_tags?: string[] | null
}

interface AISummaryResult {
    title: string
    summary: string
    key_points: string[]
    tags?: string[] | null
}

interface JobPoll {
    status: 'pending' | 'running' | 'completed' | 'failed'
    progress: number
    message: string
    result: AISummaryResult | null
    error: string | null
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

function SparkleIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3 L13.5 8 L19 8 L14.5 11.5 L16 17 L12 13.5 L8 17 L9.5 11.5 L5 8 L10.5 8 Z" />
        </svg>
    )
}

export default function ArticlePage() {
    const { id } = useParams<{ id: string }>()
    const [article, setArticle] = useState<Article | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [jobPoll, setJobPoll] = useState<JobPoll | null>(null)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        if (!id) return
        let cancelled = false
        ;(async () => {
            try {
                const row = await fetchPublicArticleById(String(id))
                if (cancelled) return
                if (!row) {
                    setError('Article not found')
                } else {
                    setArticle(row as unknown as Article)
                }
            } catch {
                if (!cancelled) setError('Something went wrong')
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => { cancelled = true }
    }, [id])

    useEffect(() => {
        if (!article?.ai_job_id || article.ai_summary) return

        const jobId = article.ai_job_id
        let stopped = false

        const poll = async () => {
            try {
                const res = await fetch(`/bff/ai-tools/summary/jobs/${jobId}`)
                if (!res.ok || stopped) return
                const data: JobPoll = await res.json()
                setJobPoll(data)
                if (data.status === 'completed' || data.status === 'failed') {
                    if (intervalRef.current) clearInterval(intervalRef.current)
                }
            } catch { /* ignore network hiccups */ }
        }

        poll()
        intervalRef.current = setInterval(poll, 3000)
        return () => {
            stopped = true
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [article])

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

    // Resolve which AI data to show: DB-stored wins, else use live poll result
    const aiData: AISummaryResult | null = article.ai_summary
        ? { title: article.title, summary: article.ai_summary, key_points: article.ai_key_points ?? [], tags: article.ai_tags }
        : jobPoll?.result ?? null

    const isPolling = !article.ai_summary && !!article.ai_job_id && (!jobPoll || jobPoll.status === 'pending' || jobPoll.status === 'running')
    const pollFailed = jobPoll?.status === 'failed'
    const pollProgress = jobPoll?.progress ?? 0
    const pollMessage = jobPoll?.message ?? 'Initialising AI summary…'

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
                    <p className="mb-8 rounded-2xl border-l-4 border-brand-500 bg-brand-50/60 px-6 py-4 text-base leading-relaxed text-ink-700 text-pretty">
                        {article.summary}
                    </p>
                )}

                {/* AI summary — progress bar while running */}
                {isPolling && (
                    <div className="mb-8 rounded-2xl border border-brand-200 bg-brand-50/50 p-6">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-white">
                                <SparkleIcon />
                            </div>
                            <span className="text-sm font-semibold text-brand-700">AI Summary</span>
                            <span className="ml-auto text-xs tabular-nums text-ink-500">{pollProgress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-brand-100">
                            <div
                                className="h-full rounded-full bg-brand-gradient transition-all duration-500 ease-out"
                                style={{ width: `${Math.max(pollProgress, 4)}%` }}
                            />
                        </div>
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
                            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-400" />
                            {pollMessage}
                        </p>
                    </div>
                )}

                {/* AI summary — failed state */}
                {pollFailed && (
                    <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-red-800">AI summary failed</p>
                            <p className="mt-0.5 text-xs text-red-600">{jobPoll?.error ?? 'Unknown error'}</p>
                        </div>
                    </div>
                )}

                {/* AI summary — completed result */}
                {aiData && (
                    <div className="mb-8 rounded-2xl border border-brand-200 bg-brand-50/50 p-6">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-white">
                                <SparkleIcon />
                            </div>
                            <span className="text-sm font-semibold text-brand-700">AI Summary</span>
                        </div>

                        <p className="text-sm leading-relaxed text-ink-700">{aiData.summary}</p>

                        {aiData.key_points.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-400">
                                    Key Points
                                </p>
                                <ul className="space-y-1.5">
                                    {aiData.key_points.map((pt, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
                                            <span className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                                            {pt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {aiData.tags && aiData.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                                {aiData.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
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
