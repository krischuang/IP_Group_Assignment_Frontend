export interface Article {
    id: string | number
    title: string
    content: string
    summary: string
    created_at: string
    updated_at?: string
    author_id?: number | null
    author_name?: string | null
    users?: { full_name: string; email: string } | null
    ai_job_id?: string | null
    ai_summary?: string | null
    ai_key_points?: string[] | null
    ai_tags?: string[] | null
}
