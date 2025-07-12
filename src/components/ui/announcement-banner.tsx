"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, Info, AlertTriangle, Settings, Wrench } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type AnnouncementType = "INFO" | "WARNING" | "UPDATE" | "MAINTENANCE"

interface Announcement {
    id: string
    title: string
    message: string
    type: AnnouncementType
    timestamp: number
}

const typeConfig = {
    INFO: {
        icon: Info,
        className: "border-blue-500/50 bg-blue-500/10 text-blue-200",
        iconColor: "text-blue-400"
    },
    WARNING: {
        icon: AlertTriangle,
        className: "border-yellow-500/50 bg-yellow-500/10 text-yellow-200",
        iconColor: "text-yellow-400"
    },
    UPDATE: {
        icon: Settings,
        className: "border-green-500/50 bg-green-500/10 text-green-200",
        iconColor: "text-green-400"
    },
    MAINTENANCE: {
        icon: Wrench,
        className: "border-orange-500/50 bg-orange-500/10 text-orange-200",
        iconColor: "text-orange-400"
    }
}

export function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

    // Simulate receiving announcements (in a real app, this would come from WebSocket or polling)
    useEffect(() => {
        // Check localStorage for dismissed announcements
        const dismissed = localStorage.getItem('dismissed-announcements')
        if (dismissed) {
            setDismissedIds(new Set(JSON.parse(dismissed)))
        }

        // Listen for announcement events (this would be replaced with real event system)
        const handleAnnouncement = (event: CustomEvent<Announcement>) => {
            setAnnouncements(prev => {
                // Don't add duplicate announcements
                if (prev.some(a => a.id === event.detail.id)) {
                    return prev
                }
                return [event.detail, ...prev]
            })
        }

        window.addEventListener('skillswap-announcement', handleAnnouncement as EventListener)

        return () => {
            window.removeEventListener('skillswap-announcement', handleAnnouncement as EventListener)
        }
    }, [])

    const dismissAnnouncement = (id: string) => {
        const newDismissed = new Set([...dismissedIds, id])
        setDismissedIds(newDismissed)
        localStorage.setItem('dismissed-announcements', JSON.stringify([...newDismissed]))
    }

    const visibleAnnouncements = announcements.filter(a => !dismissedIds.has(a.id))

    if (visibleAnnouncements.length === 0) {
        return null
    }

    return (
        <div className="fixed top-16 left-0 right-0 z-40 p-4 space-y-2">
            <AnimatePresence>
                {visibleAnnouncements.slice(0, 3).map((announcement) => {
                    const config = typeConfig[announcement.type]
                    const Icon = config.icon

                    return (
                        <motion.div
                            key={announcement.id}
                            initial={{ opacity: 0, y: -50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Alert className={`${config.className} backdrop-blur-sm border max-w-2xl mx-auto relative`}>
                                <Icon className={`h-4 w-4 ${config.iconColor}`} />
                                <AlertTitle className="pr-8">{announcement.title}</AlertTitle>
                                <AlertDescription className="mt-1">
                                    {announcement.message}
                                </AlertDescription>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-white/10"
                                    onClick={() => dismissAnnouncement(announcement.id)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Alert>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}

// Utility function to simulate sending announcements from admin panel
export function triggerAnnouncement(announcement: Omit<Announcement, 'timestamp'>) {
    const event = new CustomEvent('skillswap-announcement', {
        detail: {
            ...announcement,
            timestamp: Date.now()
        }
    })
    window.dispatchEvent(event)
}
