import { createClient } from "@/util/supabase/client"
import { AuthError, User as AuthUser } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { getUserByEmail, User } from "./useUser"

export const useUser = () => {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [profile, setProfile] = useState<User | null>(null)
    const [error, setError] = useState<AuthError | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const logout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
    }

    useEffect(() => {
        const getUser = async () => {
            setLoading(true)
            const { data, error } = await supabase.auth.getUser()
            if (data.user) {
                setUser(data.user)
                setError(null)
                const userData = await getUserByEmail(data.user.email || "")
                setProfile(userData)
            }
            if (error) {
                setError(error)
                setUser(null)
                setProfile(null)
            }
            setLoading(false)
        }
        getUser()

        const { data: authStateChangeSub } = supabase.auth.onAuthStateChange(() => {
            getUser()
        })
        return () => {
            authStateChangeSub.subscription.unsubscribe()
        }
    }, [])

    return {
        user,
        profile,
        error,
        loading,
        logout,
        isAdmin: profile?.role === "admin",
    }
}
