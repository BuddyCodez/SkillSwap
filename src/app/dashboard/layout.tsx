import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Breadcrumb } from "@/components/dashboard/breadcrum"


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full">
            {/* Sidebar is fixed and positioned properly */}
            <Sidebar />

            {/* Main content area with proper spacing */}
            <div className="flex flex-col w-full md:pl-16 lg:pl-64">
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Breadcrumb />
                    <div className="mt-4">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}