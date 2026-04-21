import { supabaseClient } from "@/util/supabase/client"

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

export const getUserByEmail = async (email: string): Promise<User | null> => {
    const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("email", email)
        .single()

    if (error) {
        console.error("Error fetching user:", error)
        return null
    }
    return data as User
}

export const getUserById = async (id: string): Promise<User | null> => {
    const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching user:", error)
        return null
    }
    return data as User
}

export const updateUser = async (id: string, content: Partial<User>) => {
    const { data, error } = await supabaseClient
        .from("users")
        .update(content)
        .eq("id", id)
        .select()
        .single()

    if (error) {
        console.error("Error updating user:", error)
        return null
    }
    return data as User
}
