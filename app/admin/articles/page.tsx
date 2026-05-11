'use client'

import { useUser } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createArticleAction, deleteArticleAction, updateArticleAction } from '@/actions/articles'
import { fetchPublicArticlesList } from '@/util/api/publicArticles'
import type { Article } from '@/types/article'

interface ArticleForm {
    title: string
    content: string
}

const emptyForm: ArticleForm = {
    title: '',
    content: '',
}

/** Backend ArticleCreate / ArticleUpdate: title + content only (OpenAPI). */
export default function AdminArticles() {
    const { user, loading, isAdmin } = useUser()
    const router = useRouter()

    const [articles, setArticles] = useState<Article[]>([])
    const [articlesLoading, setArticlesLoading] = useState(true)
    const [form, setForm] = useState<ArticleForm>(emptyForm)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/sign-in')
            return
        }
        if (!loading && user && !isAdmin) {
            router.push('/')
            return
        }
    }, [user, loading, isAdmin, router])

    const fetchArticles = useCallback(async () => {
        setArticlesLoading(true)
        try {
            const data = await fetchPublicArticlesList()
            setArticles(data as unknown as Article[])
        } catch (err: unknown) {
            console.error('Error fetching articles:', err)
            setMessage({ type: 'error', text: 'Failed to load articles.' })
        } finally {
            setArticlesLoading(false)
        }
    }, [])

    useEffect(() => {
        if (user && isAdmin) {
            fetchArticles()
        }
    }, [user, isAdmin, fetchArticles])

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 4000)
            return () => clearTimeout(timer)
        }
    }, [message])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title.trim() || !form.content.trim()) {
            setMessage({ type: 'error', text: 'Title and content are required.' })
            return
        }

        setSaving(true)
        try {
            const payload = {
                title: form.title.trim(),
                content: form.content.trim(),
            }
            const result = editingId
                ? await updateArticleAction(editingId, payload)
                : await createArticleAction(payload)
            if (!result.ok) throw new Error(result.error)

            if (!editingId && result.ok) {
                const articleId = result.article.id ?? result.article.article_id
                if (articleId) {
                    router.push(`/articles/${articleId}`)
                    return
                }
            }

            setMessage({
                type: 'success',
                text: editingId ? 'Article updated successfully.' : 'Article created successfully.',
            })
            resetForm()
            fetchArticles()
        } catch (err: unknown) {
            setMessage({
                type: 'error',
                text: err instanceof Error ? err.message : 'Failed to save article.',
            })
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (article: Article) => {
        setForm({
            title: article.title,
            content: article.content ?? '',
        })
        setEditingId(String(article.id))
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await deleteArticleAction(id)
            if (!res.ok) throw new Error(res.error)
            setMessage({ type: 'success', text: 'Article deleted successfully.' })
            setDeleteConfirm(null)
            fetchArticles()
        } catch (err: unknown) {
            setMessage({
                type: 'error',
                text: err instanceof Error ? err.message : 'Failed to delete article.',
            })
        }
    }

    const resetForm = () => {
        setForm(emptyForm)
        setEditingId(null)
        setShowForm(false)
    }

    if (loading || !user || !isAdmin) {
        return (
            <div className="flex min-h-[calc(100vh-68px)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-ink-300/40 border-t-brand-600" />
                    <p className="font-medium text-ink-500">Loading…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative">
            <div className="relative overflow-hidden bg-brand-gradient text-white">
                <div className="absolute inset-0 bg-grid opacity-[0.1] pointer-events-none" aria-hidden="true" />
                <div className="section-shell relative py-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <nav className="mb-2 flex items-center gap-2 text-sm text-white/75" aria-label="Breadcrumb">
                                <Link href="/admin" className="transition-colors hover:text-white">
                                    Dashboard
                                </Link>
                                <span className="text-white/50">/</span>
                                <span className="font-medium">Articles</span>
                            </nav>
                            <h1 className="text-3xl font-bold tracking-tight">Manage Articles</h1>
                            <p className="mt-1 max-w-xl text-sm text-white/85">
                                Create and edit articles. The API accepts <strong className="text-white">title</strong> and{' '}
                                <strong className="text-white">content</strong> only (markdown in content is supported in
                                the reader).
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                resetForm()
                                setShowForm(true)
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-brand-700 shadow-elevated transition-all duration-200 hover:scale-[1.02] hover:bg-white/95"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            New article
                        </button>
                    </div>
                </div>
            </div>

            <div className="section-shell py-8">
                {message && (
                    <div
                        role="alert"
                        className={`mb-6 flex items-center justify-between rounded-xl border px-5 py-3.5 text-sm font-medium shadow-soft animate-fade-in ${
                            message.type === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                    >
                        <span className="flex items-center gap-2.5">{message.text}</span>
                        <button onClick={() => setMessage(null)} className="ml-4 opacity-60 hover:opacity-100" aria-label="Dismiss">
                            ×
                        </button>
                    </div>
                )}

                {showForm && (
                    <div className="card mb-8 p-8 shadow-elevated animate-fade-in">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-ink-900">{editingId ? 'Edit article' : 'Create new article'}</h2>
                                <p className="text-sm text-ink-500">Provide a title and the full markdown body.</p>
                            </div>
                            <button type="button" onClick={resetForm} className="rounded-lg p-2 text-ink-500 hover:bg-ink-300/20" aria-label="Close form">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="field-label">
                                    Title <span className="text-brand-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="field-input"
                                    placeholder="Article title"
                                />
                            </div>
                            <div>
                                <label className="field-label">
                                    Content <span className="text-brand-600">*</span>
                                </label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    rows={14}
                                    className="field-input resize-y font-mono text-[0.9rem]"
                                    placeholder={"## Heading\n\nWrite markdown here...\n"}
                                />
                                <p className="mt-1.5 text-xs text-ink-500">Preview excerpts on listings are derived from this content automatically.</p>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button type="submit" disabled={saving} className="btn-primary px-7 py-3">
                                    {saving ? 'Saving…' : editingId ? 'Update article' : 'Create article'}
                                </button>
                                <button type="button" onClick={resetForm} className="btn-ghost px-5 py-3">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="card overflow-hidden">
                    <div className="border-b border-ink-300/30 px-6 py-5">
                        <h2 className="text-base font-bold text-ink-900">
                            All articles
                            {!articlesLoading && <span className="ml-2 text-sm font-normal text-ink-500">({articles.length})</span>}
                        </h2>
                    </div>

                    {articlesLoading ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-[3px] border-ink-300/40 border-t-brand-600" />
                            <p className="text-sm text-ink-500">Loading articles…</p>
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="font-semibold text-ink-900">No articles yet</p>
                            <p className="mt-1 text-sm text-ink-500">Create one with the button above.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-ink-300/30 bg-surface-subtle text-left">
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Title</th>
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Preview</th>
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Updated</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ink-300/20">
                                    {articles.map((article) => (
                                        <tr key={article.id} className="transition-colors hover:bg-surface-muted">
                                            <td className="max-w-[12rem] px-6 py-4">
                                                <p className="truncate font-medium text-ink-900">{article.title}</p>
                                            </td>
                                            <td className="max-w-[20rem] px-6 py-4">
                                                <p className="line-clamp-2 text-sm text-ink-500">{article.summary || '—'}</p>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-ink-500">
                                                {(article.updated_at || article.created_at) &&
                                                    new Date(article.updated_at || article.created_at).toLocaleDateString('en-AU', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/articles/${article.id}`} className="rounded-lg p-2 text-ink-700 hover:bg-brand-50 hover:text-brand-700" title="View">
                                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                            <circle cx="12" cy="12" r="3" />
                                                        </svg>
                                                    </Link>
                                                    <button type="button" onClick={() => handleEdit(article)} className="rounded-lg p-2 text-ink-700 hover:bg-brand-50 hover:text-brand-700" title="Edit">
                                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>

                                                    {deleteConfirm === String(article.id) ? (
                                                        <div className="flex items-center gap-1">
                                                            <button type="button" onClick={() => handleDelete(String(article.id))} className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
                                                                Confirm
                                                            </button>
                                                            <button type="button" onClick={() => setDeleteConfirm(null)} className="rounded-lg bg-ink-300/30 px-2.5 py-1.5 text-xs font-semibold text-ink-700">
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button type="button" onClick={() => setDeleteConfirm(String(article.id))} className="rounded-lg p-2 text-ink-700 hover:bg-red-50 hover:text-red-600" title="Delete">
                                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="3 6 5 6 21 6" />
                                                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
