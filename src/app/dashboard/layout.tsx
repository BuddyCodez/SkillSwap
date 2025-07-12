import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Breadcrumb } from "@/components/dashboard/breadcrum"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900">
            {/* Global animated background blur effects */}
            {/* <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
            </div> */}

            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden md:ml-16 lg:ml-64">
                <main className="flex-1 overflow-y-auto relative z-10">
                    <div className="p-6">
                        <Breadcrumb />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
