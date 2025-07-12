"use client"

import { useState } from "react"
import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Send, AlertTriangle, Info, Settings, Wrench } from "lucide-react"
import { toast } from "sonner"
import { triggerAnnouncement } from "@/components/ui/announcement-banner"

type AnnouncementType = "INFO" | "WARNING" | "UPDATE" | "MAINTENANCE"

const typeConfig = {
    INFO: {
        icon: Info,
        color: "bg-blue-600",
        label: "Information"
    },
    WARNING: {
        icon: AlertTriangle,
        color: "bg-yellow-600",
        label: "Warning"
    },
    UPDATE: {
        icon: Settings,
        color: "bg-green-600",
        label: "Update"
    },
    MAINTENANCE: {
        icon: Wrench,
        color: "bg-orange-600",
        label: "Maintenance"
    }
}

export function PlatformMessaging() {
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [announcementType, setAnnouncementType] = useState<AnnouncementType>("INFO")
    const [sentAnnouncements, setSentAnnouncements] = useState<Array<{
        id: string
        title: string
        message: string
        type: AnnouncementType
        sentAt: Date
    }>>([])

    const { data: session } = useSession()
    const trpc = useTRPC()

    const sendAnnouncementMutationOptions = trpc.admin.sendAnnouncement.mutationOptions()
    const sendAnnouncementMutation = useMutation({
        ...sendAnnouncementMutationOptions,
        onSuccess: (data) => {
            toast.success("Announcement sent successfully!")

            // Trigger the announcement for all users
            triggerAnnouncement({
                id: data.announcementId,
                title,
                message,
                type: announcementType
            })

            // Add to local state for display
            setSentAnnouncements(prev => [{
                id: data.announcementId,
                title,
                message,
                type: announcementType,
                sentAt: new Date()
            }, ...prev])
            // Reset form
            setTitle("")
            setMessage("")
            setAnnouncementType("INFO")
        },
        onError: (error) => {
            toast.error("Failed to send announcement")
            console.error(error)
        }
    })

    const handleSendAnnouncement = () => {
        if (!title.trim() || !message.trim()) {
            toast.error("Please fill in both title and message")
            return
        }

        sendAnnouncementMutation.mutate({
            title: title.trim(),
            message: message.trim(),
            type: announcementType
        })
    }

    return (
        <div className="space-y-6">
            {/* Send Announcement */}
            <Card className="bg-gray-800/50 border-purple-500/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <MessageSquare className="h-5 w-5" />
                        Platform Messaging
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Send platform-wide announcements to all users
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Announcement Title</label>
                            <Input
                                placeholder="Enter announcement title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-gray-700/50 border-gray-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Type</label>
                            <Select value={announcementType} onValueChange={(value: AnnouncementType) => setAnnouncementType(value)}>
                                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-600">
                                    {Object.entries(typeConfig).map(([key, config]) => {
                                        const Icon = config.icon
                                        return (
                                            <SelectItem key={key} value={key} className="text-white">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    {config.label}
                                                </div>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-300">Message</label>
                        <Textarea
                            placeholder="Enter your announcement message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-gray-700/50 border-gray-600 text-white min-h-32"
                            rows={4}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                            This announcement will be sent to all platform users
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    // Test different types of announcements
                                    const sampleAnnouncements = [
                                        { type: "INFO" as const, title: "Platform Update", message: "New features have been added to improve your SkillSwap experience!" },
                                        { type: "WARNING" as const, title: "Maintenance Notice", message: "Scheduled maintenance will occur this Sunday from 2-4 AM EST." },
                                        { type: "UPDATE" as const, title: "New Skills Added", message: "We've added new skill categories including AI/ML and Blockchain development." }
                                    ]

                                    sampleAnnouncements.forEach((ann, index) => {
                                        setTimeout(() => {
                                            triggerAnnouncement({
                                                id: 'sample-' + Date.now() + '-' + index,
                                                ...ann
                                            })
                                        }, index * 1000)
                                    })

                                    toast.success("Sample announcements triggered!")
                                }}
                                variant="outline"
                                className="bg-blue-600 border-blue-500 text-white hover:bg-blue-700"
                            >
                                Send Sample Announcements
                            </Button>
                            <Button
                                onClick={() => {
                                    triggerAnnouncement({
                                        id: 'test-' + Date.now(),
                                        title: "Test Announcement",
                                        message: "This is a test announcement to verify the system is working.",
                                        type: "INFO"
                                    })
                                    toast.success("Test announcement triggered!")
                                }}
                                variant="outline"
                                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                            >
                                Test Announcement
                            </Button>
                            <Button
                                onClick={handleSendAnnouncement}
                                disabled={sendAnnouncementMutation.isPending || !title.trim() || !message.trim()}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                {sendAnnouncementMutation.isPending ? "Sending..." : "Send Announcement"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sent Announcements History */}
            <Card className="bg-gray-800/50 border-purple-500/30">
                <CardHeader>
                    <CardTitle className="text-white">Recent Announcements</CardTitle>
                    <CardDescription className="text-gray-400">
                        History of sent platform announcements
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {sentAnnouncements.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No announcements sent yet</p>
                            <p className="text-sm">Send your first platform-wide announcement above</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sentAnnouncements.map((announcement) => {
                                const config = typeConfig[announcement.type]
                                const Icon = config.icon

                                return (
                                    <div
                                        key={announcement.id}
                                        className="p-4 border border-gray-600 rounded-lg bg-gray-700/30"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge className={`${config.color} text-white`}>
                                                    <Icon className="h-3 w-3 mr-1" />
                                                    {config.label}
                                                </Badge>
                                                <h3 className="font-semibold text-white">{announcement.title}</h3>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {announcement.sentAt.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm">{announcement.message}</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
