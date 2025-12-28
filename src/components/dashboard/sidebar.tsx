"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, User, ArrowLeftRight, Star, Calendar, Settings, Menu, LogOut, MessageSquare } from "lucide-react"
import { useSession, signOut } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { Button } from "../ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Swaps", href: "/dashboard/swaps", icon: ArrowLeftRight },
  { name: "Reviews", href: "/dashboard/reviews", icon: Star },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
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
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-black/20 backdrop-blur-xl border-purple-500/30 text-white hover:bg-purple-600/20"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] px-0 bg-black/40 backdrop-blur-xl border-purple-500/30">
            <MobileSidebarContent session={session} pathname={pathname} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-16 lg:w-64 flex-col">
        {/* Animated background blur effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl"
            animate={{
              x: [0, 20, 0],
              y: [0, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl"
            animate={{
              x: [0, -15, 0],
              y: [0, 15, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col h-full bg-black/40 backdrop-blur-xl border-r border-purple-500/30">
          <DesktopSidebarContent session={session} pathname={pathname} />
        </div>
      </aside>
    </>
  )
}

function MobileSidebarContent({ session, pathname }: { session: any; pathname: string }) {
  return (
    <div className="flex h-full flex-col gap-6 relative">
      {/* Background blur effects for mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-24 h-24 bg-purple-500/20 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-blue-500/15 rounded-full blur-xl" />
      </div>

      <div className="relative z-10 flex h-16 items-center border-b border-white/10 px-6 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20">
            <ArrowLeftRight className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg text-white tracking-tight font-bold">SkillSwap</span>
        </div>
      </div>

      {session?.user && (
        <div className="relative z-10 px-6">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <UserAvatar
              user={session.user}
              className="border-2 border-purple-500/30 w-10 h-10"
              fallbackClassName="bg-gradient-to-br from-purple-600 to-blue-600"
            />
            <div className="overflow-hidden">
              <p className="font-medium text-white truncate">{session.user.name}</p>
              <p className="text-xs text-purple-200/70 truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="relative z-10 grid items-start px-4 text-sm font-medium">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
              pathname === item.href
                ? "bg-purple-600/20 text-white border border-purple-500/30 shadow-sm"
                : "text-purple-100/70 hover:text-white hover:bg-white/5",
            )}
          >
            <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-purple-400" : "text-purple-400/70")} />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="relative z-10 mt-auto p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-purple-100/70 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

function DesktopSidebarContent({ session, pathname }: { session: any; pathname: string }) {
  return (
    <>
      <div className="flex h-16 items-center border-b border-white/10 px-4 lg:px-6 bg-white/5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 font-semibold group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
            <ArrowLeftRight className="h-5 w-5 text-white" />
          </div>
          <span className="hidden lg:inline text-lg text-white tracking-tight font-bold">SkillSwap</span>
        </Link>
      </div>

      {session?.user && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer">
            <UserAvatar
              user={session.user}
              className="border-2 border-purple-500/30 w-10 h-10 group-hover:border-purple-500/50 transition-colors"
              fallbackClassName="bg-gradient-to-br from-purple-600 to-blue-600"
            />
            <div className="hidden lg:block overflow-hidden">
              <p className="font-medium text-white truncate text-sm">{session.user.name}</p>
              <p className="text-xs text-purple-200/70 truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                    "group lg:justify-start justify-center",
                    pathname === item.href
                      ? "bg-purple-600/20 text-white border border-purple-500/30 shadow-sm"
                      : "text-purple-100/70 hover:text-white hover:bg-white/5",
                  )}
                >
                  <item.icon className={cn("h-5 w-5 transition-colors", pathname === item.href ? "text-purple-400" : "text-purple-400/70 group-hover:text-purple-400")} />
                  <span className="hidden lg:inline font-medium">{item.name}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden bg-gray-900 border-white/10 text-white">
                {item.name}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:w-full lg:justify-start lg:gap-3 text-purple-100/70 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all rounded-xl h-10"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden lg:inline font-medium">Sign Out</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="lg:hidden bg-gray-900 border-white/10 text-white">
            Sign Out
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  )
}
