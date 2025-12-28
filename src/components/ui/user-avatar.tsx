"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface UserAvatarProps extends React.ComponentPropsWithoutRef<typeof Avatar> {
    user: {
        name?: string | null
        image?: string | null
    }
    fallbackClassName?: string
}

export function UserAvatar({ user, className, fallbackClassName, ...props }: UserAvatarProps) {
    const [imageError, setImageError] = React.useState(false)

    return (
        <Avatar className={cn("relative overflow-hidden", className)} {...props}>
            {user.image && !imageError ? (
                <div className="relative w-full h-full">
                    <Image
                        src={user.image}
                        alt={user.name || "User avatar"}
                        fill
                        className="object-cover"
                        onError={() => setImageError(true)}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            ) : (
                <AvatarFallback className={cn("bg-purple-600 text-white font-medium", fallbackClassName)}>
                    {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
            )}
        </Avatar>
    )
}
