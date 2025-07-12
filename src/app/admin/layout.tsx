"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, isPending } = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const trpc = useTRPC()

    const adminCheckQueryOptions = trpc.admin.checkAdminRole.queryOptions()
    const { data: adminCheck, isLoading: isCheckingAdmin, error } = useQuery({
        ...adminCheckQueryOptions,
        enabled: !!session?.user,
        retry: false,
        refetchOnWindowFocus: false
    })

    useEffect(() => {
        if (!isPending) {
            if (!session) {
                router.push("/auth/login")
                return
            }

            // Wait for admin check to complete
            if (!isCheckingAdmin) {
                if (error || !adminCheck) {
                    router.push("/dashboard")
                    return
                }
                setIsLoading(false)
            }
        }
    }, [session, isPending, adminCheck, isCheckingAdmin, error, router])

    if (isPending || isLoading || isCheckingAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            {children}
        </div>
    )
}
