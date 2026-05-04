'use client'

import { useUser } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Article {
    id: string
    title: string
    summary: string
    content: string
    category: string
    published: boolean
    created_at: string
    updated_at: string
}

interface ArticleForm {
    title: string
    summary: string
    content: string
    category: string
    published: boolean
}

const emptyForm: ArticleForm = {
    title: '',
    summary: '',
    content: '',
    category: '',
    published: false,
}

export default function AdminArticles() {
    const { user, profile, loading, isAdmin } = useUser()
    const router = useRouter()

    const [articles, setArticles] = useState<Article[]>([])
    const [categories, setCategories] = useState<string[]>([])
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
            const res = await fetch('/api/articles')
            if (!res.ok) throw new Error('Failed to fetch articles')
            const data = await res.json()
            setArticles(data)
        } catch (err: any) {
            console.error('Error fetching articles:', err)
            setMessage({ type: 'error', text: 'Failed to load articles.' })
        } finally {
            setArticlesLoading(false)
        }
    }, [])

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/categories')
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data)) {
                    setCategories(data.map((c: { name: string }) => c.name))
                }
            }
        } catch (err) {
            console.error('Error fetching categories:', err)
        }
    }, [])

    useEffect(() => {
        if (user && isAdmin) {
            fetchArticles()
            fetchCategories()
        }
    }, [user, isAdmin, fetchArticles, fetchCategories])

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
            const url = editingId ? `/api/articles/${editingId}` : '/api/articles'
            const method = editingId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    summary: form.summary,
                    content: form.content,
                    category: form.category,
                    published: form.published,
                }),
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.error || 'Failed to save article')
            }

            setMessage({
                type: 'success',
                text: editingId ? 'Article updated successfully.' : 'Article created successfully.',
            })
            resetForm()
            fetchArticles()
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to save article.' })
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (article: Article) => {
        setForm({
            title: article.title,
            summary: article.summary || '',
            content: article.content,
            category: article.category || '',
            published: article.published,
        })
        setEditingId(article.id)
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete article')
            setMessage({ type: 'success', text: 'Article deleted successfully.' })
            setDeleteConfirm(null)
            fetchArticles()
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to delete article.' })
        }
    }

    const handleTogglePublished = async (article: Article) => {
        try {
            const res = await fetch(`/api/articles/${article.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ published: !article.published }),
            })
            if (!res.ok) throw new Error('Failed to update status')
            setMessage({
                type: 'success',
                text: `Article ${!article.published ? 'published' : 'unpublished'}.`,
            })
            fetchArticles()
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to toggle status.' })
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
            {/* Header */}
            <div className="relative overflow-hidden bg-brand-gradient text-white">
                <div className="absolute inset-0 bg-grid opacity-[0.1] pointer-events-none" aria-hidden="true" />
                <div className="section-shell relative py-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <nav className="mb-2 flex items-center gap-2 text-sm text-white/75" aria-label="Breadcrumb">
                                <Link href="/admin" className="transition-colors hover:text-white">Dashboard</Link>
                                <span className="text-white/50">/</span>
                                <span className="font-medium">Articles</span>
                            </nav>
                            <h1 className="text-3xl font-bold tracking-tight">Manage Articles</h1>
                            <p className="mt-1 text-white/85">Create, edit, and manage all articles</p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setShowForm(true) }}
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
                {/* Toast */}
                {message && (
                    <div
                        role="alert"
                        className={`mb-6 flex items-center justify-between rounded-xl border px-5 py-3.5 text-sm font-medium shadow-soft animate-fade-in ${
                            message.type === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                    >
                        <span className="flex items-center gap-2.5">
                            {message.type === 'success' ? (
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            )}
                            {message.text}
                        </span>
                        <button onClick={() => setMessage(null)} className="ml-4 opacity-60 transition-opacity hover:opacity-100" aria-label="Dismiss">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Form */}
                {showForm && (
                    <div className="card mb-8 p-8 shadow-elevated animate-fade-in">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-ink-900">
                                    {editingId ? 'Edit article' : 'Create new article'}
                                </h2>
                                <p className="text-sm text-ink-500">
                                    {editingId ? 'Update article details and save' : 'Fill in the details for the new article'}
                                </p>
                            </div>
                            <button
                                onClick={resetForm}
                                className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-300/20 hover:text-ink-900"
                                aria-label="Close form"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                    placeholder="Enter article title"
                                />
                            </div>

                            <div>
                                <label className="field-label">Summary</label>
                                <textarea
                                    value={form.summary}
                                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                                    rows={3}
                                    className="field-input resize-y"
                                    placeholder="Brief summary of the article"
                                />
                            </div>

                            <div>
                                <label className="field-label">
                                    Content <span className="text-brand-600">*</span>
                                </label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    rows={12}
                                    className="field-input resize-y font-mono text-[0.9rem]"
                                    placeholder="Write the full article content here. Supports basic markdown: ## headings, **bold**, `code`, - lists, and ``` code blocks."
                                />
                                <p className="mt-1.5 text-xs text-ink-500">
                                    Supports basic markdown: <code className="rounded bg-brand-50 px-1 py-0.5 font-mono text-[0.72rem] text-brand-700">##</code> headings,
                                    <code className="ml-1 rounded bg-brand-50 px-1 py-0.5 font-mono text-[0.72rem] text-brand-700">**bold**</code>,
                                    <code className="ml-1 rounded bg-brand-50 px-1 py-0.5 font-mono text-[0.72rem] text-brand-700">`code`</code>, lists and fences.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="field-label">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="field-input bg-white"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <label className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-ink-300/60 bg-white px-4 py-2.5 transition-colors hover:border-brand-300">
                                        <div>
                                            <p className="text-sm font-semibold text-ink-900">
                                                {form.published ? 'Published' : 'Draft'}
                                            </p>
                                            <p className="text-xs text-ink-500">
                                                {form.published ? 'Visible to all readers' : 'Only admins can see it'}
                                            </p>
                                        </div>
                                        <div className="relative inline-flex">
                                            <input
                                                type="checkbox"
                                                checked={form.published}
                                                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                                                className="peer sr-only"
                                            />
                                            <div className="h-6 w-11 rounded-full bg-ink-300/40 transition-colors peer-focus:ring-4 peer-focus:ring-brand-100 peer-checked:bg-emerald-500" />
                                            <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button type="submit" disabled={saving} className="btn-primary px-7 py-3">
                                    {saving ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Saving…
                                        </>
                                    ) : editingId ? 'Update article' : 'Create article'}
                                </button>
                                <button type="button" onClick={resetForm} className="btn-ghost px-5 py-3">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Articles Table */}
                <div className="card overflow-hidden">
                    <div className="flex items-center justify-between border-b border-ink-300/30 px-6 py-5">
                        <h2 className="text-base font-bold text-ink-900">
                            All articles
                            {!articlesLoading && (
                                <span className="ml-2 text-sm font-normal text-ink-500">
                                    ({articles.length} total)
                                </span>
                            )}
                        </h2>
                    </div>

                    {articlesLoading ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-[3px] border-ink-300/40 border-t-brand-600" />
                            <p className="text-sm text-ink-500">Loading articles…</p>
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <p className="mt-4 font-semibold text-ink-900">No articles yet</p>
                            <p className="mt-1 text-sm text-ink-500">Create your first article to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-ink-300/30 bg-surface-subtle text-left">
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Title</th>
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Category</th>
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Status</th>
                                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ink-300/20">
                                    {articles.map((article) => (
                                        <tr key={article.id} className="transition-colors hover:bg-surface-muted">
                                            <td className="px-6 py-4">
                                                <p className="max-w-xs truncate font-medium text-ink-900">{article.title}</p>
                                                {article.summary && (
                                                    <p className="mt-0.5 max-w-xs truncate text-sm text-ink-500">{article.summary}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {article.category ? (
                                                    <span className="badge-brand">{article.category}</span>
                                                ) : (
                                                    <span className="text-sm text-ink-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleTogglePublished(article)}
                                                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                                                        article.published
                                                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                                    }`}
                                                    title="Click to toggle status"
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${article.published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                    {article.published ? 'Published' : 'Draft'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-ink-500">
                                                {new Date(article.created_at).toLocaleDateString('en-AU', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEdit(article)}
                                                        className="rounded-lg p-2 text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                                                        title="Edit article"
                                                    >
                                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>

                                                    {deleteConfirm === article.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleDelete(article.id)}
                                                                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="rounded-lg bg-ink-300/30 px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:bg-ink-300/50"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(article.id)}
                                                            className="rounded-lg p-2 text-ink-700 transition-colors hover:bg-red-50 hover:text-red-600"
                                                            title="Delete article"
                                                        >
                                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="3 6 5 6 21 6" />
                                                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                                <line x1="10" y1="11" x2="10" y2="17" />
                                                                <line x1="14" y1="11" x2="14" y2="17" />
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
