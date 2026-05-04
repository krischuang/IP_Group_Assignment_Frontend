import { updateCurrentUser } from '@/actions/user'

export interface User {
    id: string
    email: string
    full_name?: string
    role: string
    avatar_url?: string
    bio?: string
    created_at?: string
    updated_at?: string
}

/** Profile updates use POST /auth/me (OpenAPI UpdateMeRequest) — no path id */
export const updateUser = async (content: Partial<Pick<User, 'full_name' | 'bio' | 'avatar_url'>>) => {
    const payload: { full_name?: string; bio?: string; image_address?: string | null } = {}
    if (content.full_name !== undefined) payload.full_name = content.full_name
    if (content.bio !== undefined) payload.bio = content.bio
    if (content.avatar_url !== undefined) payload.image_address = content.avatar_url
    return updateCurrentUser(payload)
}
