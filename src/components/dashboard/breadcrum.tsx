"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export function Breadcrumb() {
    const pathname = usePathname()
    const segments = pathname.split("/").filter(Boolean)

    const breadcrumbs = segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const label = segment.charAt(0).toUpperCase() + segment.slice(1)

        return {
            label,
            href,
            isLast: index === segments.length - 1,
        }
    })

    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="flex items-center hover:text-gray-900 transition-colors">
                <Home className="w-4 h-4" />
            </Link>

            {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.href} className="flex items-center space-x-2">
                    <ChevronRight className="w-4 h-4" />
                    {breadcrumb.isLast ? (
                        <span className="font-medium text-gray-900">{breadcrumb.label}</span>
                    ) : (
                        <Link href={breadcrumb.href} className="hover:text-gray-900 transition-colors">
                            {breadcrumb.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    )
}
