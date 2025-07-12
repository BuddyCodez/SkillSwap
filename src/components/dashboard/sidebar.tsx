"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, ArrowLeftRight, Star, Calendar, Settings, Menu, LogOut } from "lucide-react"

import { useSession, signOut } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Swaps", href: "/dashboard/swaps", icon: ArrowLeftRight },
    { name: "Reviews", href: "/dashboard/reviews", icon: Star },
    { name: "Schedule", href: "/dashboard/schedule", icon: Calendar },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()

    return (
        <>
            {/* Mobile Sidebar Trigger */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <Menu className="h-4 w-4" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] px-0">
                        <MobileSidebarContent session={session} pathname={pathname} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-16 lg:w-64 flex-col border-r bg-background">
                <DesktopSidebarContent session={session} pathname={pathname} />
            </aside>
        </>
    )
}

function MobileSidebarContent({ session, pathname }: { session: any, pathname: string }) {
    return (
        <div className="flex h-full flex-col gap-6">
            <div className="flex h-16 items-center border-b px-6">
                <div className="flex items-center gap-2 font-semibold">
                    <ArrowLeftRight className="h-6 w-6 text-primary" />
                    <span className="text-lg">SkillSwap</span>
                </div>
            </div>

            {session?.user && (
                <div className="px-6">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={session.user.image} />
                            <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{session.user.name}</p>
                            <p className="text-sm text-muted-foreground">{session.user.email}</p>
                        </div>
                    </div>
                </div>
            )}

            <nav className="grid items-start px-4 text-sm font-medium">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                            pathname === item.href
                                ? "bg-muted text-primary"
                                : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="mt-auto p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => signOut()}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}

function DesktopSidebarContent({ session, pathname }: { session: any, pathname: string }) {
    return (
        <>
            <div className="flex h-16 items-center border-b px-4 lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <ArrowLeftRight className="h-6 w-6 text-primary" />
                    <span className="hidden lg:inline text-lg">SkillSwap</span>
                </Link>
            </div>

            {session?.user && (
                <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={session.user.image} />
                            <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:block">
                            <p className="font-medium">{session.user.name}</p>
                            <p className="text-sm text-muted-foreground">{session.user.email}</p>
                        </div>
                    </div>
                </div>
            )}

            <nav className="flex-1 overflow-y-auto py-2">
                <div className="flex flex-col gap-1 px-2">
                    {navItems.map((item) => (
                        <Tooltip key={item.name}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                                        "group lg:justify-start justify-center",
                                        pathname === item.href
                                            ? "bg-muted text-primary"
                                            : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="hidden lg:inline">{item.name}</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="lg:hidden">
                                {item.name}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </nav>

            <div className="p-4 border-t">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:w-full lg:justify-start lg:gap-2"
                            onClick={() => signOut()}
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="hidden lg:inline">Sign Out</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="lg:hidden">
                        Sign Out
                    </TooltipContent>
                </Tooltip>
            </div>
        </>
    )
}