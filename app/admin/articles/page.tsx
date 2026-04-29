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
            <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4' />
                    <p className='text-gray-600 font-medium'>Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100'>
            {/* Header */}
            <div className='bg-gradient-to-r from-red-600 to-red-700 text-white'>
                <div className='max-w-6xl mx-auto px-6 pt-20 md:pt-24 pb-10'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <div className='flex items-center space-x-3 mb-2'>
                                <Link href='/admin' className='text-red-200 hover:text-white transition-colors text-sm'>
                                    Dashboard
                                </Link>
                                <span className='text-red-300'>/</span>
                                <span className='text-sm'>Articles</span>
                            </div>
                            <h1 className='text-3xl font-bold'>Manage Articles</h1>
                            <p className='text-red-100 mt-1'>Create, edit, and manage all articles</p>
                        </div>
                        <button
                            onClick={() => {
                                resetForm()
                                setShowForm(true)
                            }}
                            className='bg-white text-red-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-red-50 transition-colors shadow-lg'
                        >
                            + New Article
                        </button>
                    </div>
                </div>
            </div>

            <div className='max-w-6xl mx-auto px-6 py-8'>
                {/* Toast Message */}
                {message && (
                    <div
                        className={`mb-6 px-5 py-4 rounded-xl text-sm font-medium flex items-center justify-between ${
                            message.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                    >
                        <span>{message.text}</span>
                        <button onClick={() => setMessage(null)} className='ml-4 opacity-60 hover:opacity-100'>
                            &times;
                        </button>
                    </div>
                )}

                {/* Create / Edit Form */}
                {showForm && (
                    <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8'>
                        <div className='flex items-center justify-between mb-6'>
                            <h2 className='text-xl font-bold text-gray-800'>
                                {editingId ? 'Edit Article' : 'Create New Article'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className='text-gray-400 hover:text-gray-600 transition-colors'
                            >
                                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className='space-y-5'>
                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-1.5'>
                                    Title <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='text'
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-gray-900'
                                    placeholder='Enter article title'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Summary</label>
                                <textarea
                                    value={form.summary}
                                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                                    rows={3}
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-gray-900 resize-vertical'
                                    placeholder='Brief summary of the article'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-1.5'>
                                    Content <span className='text-red-500'>*</span>
                                </label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    rows={10}
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-gray-900 resize-vertical'
                                    placeholder='Write the full article content here...'
                                />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                <div>
                                    <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white'
                                    >
                                        <option value=''>Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className='flex items-center pt-7'>
                                    <label className='relative inline-flex items-center cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={form.published}
                                            onChange={(e) => setForm({ ...form, published: e.target.checked })}
                                            className='sr-only peer'
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" />
                                        <span className='ml-3 text-sm font-semibold text-gray-700'>
                                            {form.published ? 'Published' : 'Draft'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className='flex items-center space-x-3 pt-2'>
                                <button
                                    type='submit'
                                    disabled={saving}
                                    className='bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    {saving
                                        ? 'Saving...'
                                        : editingId
                                          ? 'Update Article'
                                          : 'Create Article'}
                                </button>
                                <button
                                    type='button'
                                    onClick={resetForm}
                                    className='px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors'
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Articles Table */}
                <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
                    <div className='px-6 py-5 border-b border-gray-100'>
                        <h2 className='text-lg font-bold text-gray-800'>
                            All Articles
                            {!articlesLoading && (
                                <span className='ml-2 text-sm font-normal text-gray-500'>
                                    ({articles.length} total)
                                </span>
                            )}
                        </h2>
                    </div>

                    {articlesLoading ? (
                        <div className='p-12 text-center'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-3' />
                            <p className='text-gray-500 text-sm'>Loading articles...</p>
                        </div>
                    ) : articles.length === 0 ? (
                        <div className='p-12 text-center'>
                            <svg className='w-12 h-12 text-gray-300 mx-auto mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' />
                            </svg>
                            <p className='text-gray-500 font-medium'>No articles yet</p>
                            <p className='text-gray-400 text-sm mt-1'>Create your first article to get started.</p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='bg-gray-50 text-left'>
                                        <th className='px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Title</th>
                                        <th className='px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Category</th>
                                        <th className='px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Status</th>
                                        <th className='px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Date</th>
                                        <th className='px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {articles.map((article) => (
                                        <tr key={article.id} className='hover:bg-gray-50 transition-colors'>
                                            <td className='px-6 py-4'>
                                                <p className='font-medium text-gray-900 truncate max-w-xs'>
                                                    {article.title}
                                                </p>
                                                {article.summary && (
                                                    <p className='text-sm text-gray-500 truncate max-w-xs mt-0.5'>
                                                        {article.summary}
                                                    </p>
                                                )}
                                            </td>
                                            <td className='px-6 py-4'>
                                                {article.category ? (
                                                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                                        {article.category}
                                                    </span>
                                                ) : (
                                                    <span className='text-gray-400 text-sm'>-</span>
                                                )}
                                            </td>
                                            <td className='px-6 py-4'>
                                                <button
                                                    onClick={() => handleTogglePublished(article)}
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                                                        article.published
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                    }`}
                                                    title='Click to toggle status'
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${article.published ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                    {article.published ? 'Published' : 'Draft'}
                                                </button>
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-500'>
                                                {new Date(article.created_at).toLocaleDateString('en-AU', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className='px-6 py-4'>
                                                <div className='flex items-center justify-end space-x-2'>
                                                    <button
                                                        onClick={() => handleEdit(article)}
                                                        className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                                                        title='Edit article'
                                                    >
                                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                                                        </svg>
                                                    </button>

                                                    {deleteConfirm === article.id ? (
                                                        <div className='flex items-center space-x-1'>
                                                            <button
                                                                onClick={() => handleDelete(article.id)}
                                                                className='px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors'
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className='px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(article.id)}
                                                            className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                                                            title='Delete article'
                                                        >
                                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
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
