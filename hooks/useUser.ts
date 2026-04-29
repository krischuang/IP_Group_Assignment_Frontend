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

export const updateUser = async (id: string | number, content: Partial<User>) => {
    return updateCurrentUser(id, content as Record<string, unknown>)
}
