/** Map backend payloads (OpenAPI) to shapes the UI expects. */

export function excerptFromContent(content: string, maxLen = 200): string {
    if (!content) return ''
    const plain = content
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/[#*_`[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    if (!plain) return ''
    return plain.length > maxLen ? plain.slice(0, maxLen).trimEnd() + '…' : plain
}

/** ArticleResponse vs legacy UI fields (`id`, summary, timestamps). */
export function normalizeArticleResponse(raw: Record<string, unknown>): Record<string, unknown> {
    const content = typeof raw.content === 'string' ? raw.content : ''
    const idVal = raw.article_id ?? raw.id
    const id = idVal != null ? String(idVal) : ''
    const created_at =
        typeof raw.create_time === 'string'
            ? raw.create_time
            : typeof raw.created_at === 'string'
              ? raw.created_at
              : ''
    const updated_at =
        typeof raw.update_time === 'string'
            ? raw.update_time
            : typeof raw.updated_at === 'string'
              ? raw.updated_at
              : ''
    const summaryLegacy = typeof raw.summary === 'string' ? raw.summary : null

    return {
        ...raw,
        id,
        article_id: raw.article_id,
        title: typeof raw.title === 'string' ? raw.title : '',
        content,
        summary: summaryLegacy ?? excerptFromContent(content, 240),
        category: typeof raw.category === 'string' ? raw.category : null,
        categories: raw.categories ?? null,
        author_name: typeof raw.author_name === 'string' ? raw.author_name : null,
        users: raw.users ?? null,
        author_id: raw.author_id,
        published: typeof raw.published === 'boolean' ? raw.published : true,
        created_at,
        updated_at,
        ai_job_id: typeof raw.ai_job_id === 'string' ? raw.ai_job_id : null,
        ai_summary: typeof raw.ai_summary === 'string' ? raw.ai_summary : null,
        ai_key_points: Array.isArray(raw.ai_key_points) ? raw.ai_key_points as string[] : null,
        ai_tags: Array.isArray(raw.ai_tags) ? raw.ai_tags as string[] : null,
    }
}

export function normalizeArticlesList(data: unknown): Record<string, unknown>[] {
    if (!Array.isArray(data)) return []
    return data.map((x) => normalizeArticleResponse(x as Record<string, unknown>))
}

/** MeResponse -> UI User */
export function normalizeMe(raw: Record<string, unknown>) {
    const uid = raw.user_id ?? raw.id
    return {
        id: uid != null ? String(uid) : '',
        email: String(raw.email ?? ''),
        full_name: String(raw.full_name ?? ''),
        role: typeof raw.role === 'string' ? raw.role : 'User',
        bio: raw.bio == null || raw.bio === '' ? undefined : String(raw.bio),
        avatar_url:
            typeof raw.image_address === 'string' && raw.image_address
                ? raw.image_address
                : typeof raw.avatar_url === 'string'
                  ? raw.avatar_url
                  : undefined,
        created_at:
            typeof raw.create_time === 'string'
                ? raw.create_time
                : typeof raw.created_at === 'string'
                  ? raw.created_at
                  : undefined,
        updated_at:
            typeof raw.update_time === 'string'
                ? raw.update_time
                : typeof raw.updated_at === 'string'
                  ? raw.updated_at
                  : undefined,
    }
}

/** UserSummary */
export function normalizeUserSummary(raw: Record<string, unknown>) {
    const uid = raw.user_id ?? raw.id
    return {
        id: uid != null ? String(uid) : '',
        email: String(raw.email ?? ''),
        full_name: String(raw.full_name ?? ''),
        role: typeof raw.role === 'string' ? raw.role : 'User',
        bio: raw.bio == null || raw.bio === '' ? undefined : String(raw.bio),
        created_at:
            typeof raw.create_time === 'string'
                ? raw.create_time
                : typeof raw.created_at === 'string'
                  ? raw.created_at
                  : undefined,
        updated_at:
            typeof raw.update_time === 'string'
                ? raw.update_time
                : typeof raw.updated_at === 'string'
                  ? raw.updated_at
                  : undefined,
    }
}

/** GET /admin/users returns { total, users } per OpenAPI */
export function normalizeAdminUsersPayload(data: unknown): Record<string, unknown>[] {
    if (Array.isArray(data)) {
        return data.map((x) => normalizeUserSummary(x as Record<string, unknown>))
    }
    if (!data || typeof data !== 'object') return []
    const users = (data as Record<string, unknown>).users
    if (!Array.isArray(users)) return []
    return users.map((x) => normalizeUserSummary(x as Record<string, unknown>))
}

export function toArticleCreateBody(payload: Record<string, unknown>): { title: string; content: string } | null {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    const content = typeof payload.content === 'string' ? payload.content.trim() : ''
    if (!title || !content) return null
    return { title, content }
}

/** ArticleUpdate: optional title, content (null clears in API — we omit nulls if absent) */
export function toArticleUpdateBody(payload: Record<string, unknown>): Record<string, string | null> {
    const out: Record<string, string | null> = {}
    if ('title' in payload) {
        out.title = typeof payload.title === 'string' ? payload.title : null
    }
    if ('content' in payload) {
        out.content = typeof payload.content === 'string' ? payload.content : null
    }
    return out
}

export function toApiRole(role: unknown): 'Admin' | 'User' | undefined {
    if (typeof role !== 'string') return undefined
    const r = role.toLowerCase()
    if (r === 'admin') return 'Admin'
    if (r === 'user') return 'User'
    return undefined
}
