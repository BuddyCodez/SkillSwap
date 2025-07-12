"use client"

import { motion } from "framer-motion"
import { Check, CheckCheck, Download } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Message {
    id: string
    content: string
    createdAt: string
    senderId: string
    type: "text" | "image"
    status?: "sent" | "delivered" | "read"
}

interface Participant {
    id: string
    name: string
    image?: string | null
}

interface MessageBubbleProps {
    message: Message
    isOwn: boolean
    showAvatar: boolean
    participant: Participant | null
}

export function MessageBubble({ message, isOwn, showAvatar, participant }: MessageBubbleProps) {
    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
    }

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case "delivered":
                return <CheckCheck className="w-3 h-3 text-purple-400" />
            case "read":
                return <CheckCheck className="w-3 h-3 text-blue-400" />
            default:
                return <Check className="w-3 h-3 text-purple-400" />
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn("flex gap-3 group", isOwn ? "justify-end" : "justify-start")}
        >
            {/* Avatar for other user */}
            {!isOwn && (
                <div className="flex-shrink-0">
                    {showAvatar ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Avatar className="w-8 h-8 border-2 border-purple-500/30 shadow-lg">
                                <AvatarImage src={participant?.image || ""} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-700 text-white text-xs font-semibold">
                                    {participant?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </motion.div>
                    ) : (
                        <div className="w-8 h-8" />
                    )}
                </div>
            )}

            <div className={cn("flex flex-col max-w-[75%] lg:max-w-[60%]", isOwn ? "items-end" : "items-start")}>
                {/* Message Content */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                        "relative rounded-2xl px-4 py-3 max-w-full break-words shadow-lg backdrop-blur-sm border transition-all duration-200",
                        isOwn
                            ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white border-purple-500/30 rounded-br-md"
                            : "bg-gray-800/80 text-white border-gray-700/50 rounded-bl-md"
                    )}
                >
                    {/* Message tail */}
                    <div
                        className={cn(
                            "absolute w-3 h-3 rotate-45 border",
                            isOwn
                                ? "bg-gradient-to-br from-purple-600 to-blue-600 border-purple-500/30 -bottom-1.5 right-3"
                                : "bg-gray-800/80 border-gray-700/50 -bottom-1.5 left-3"
                        )}
                    />

                    {message.type === "image" ? (
                        <div className="relative group/image">
                            <img
                                src={message.content || "/placeholder.svg"}
                                alt="Shared image"
                                className="max-w-full h-auto rounded-xl cursor-pointer hover:opacity-90 transition-all duration-200 relative z-10"
                                style={{ maxHeight: "300px", maxWidth: "250px" }}
                                onClick={() => window.open(message.content, "_blank")}
                            />

                            {/* Image overlay on hover */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-xl z-20">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                                    onClick={() => {
                                        const link = document.createElement("a")
                                        link.href = message.content
                                        link.download = "image.jpg"
                                        link.click()
                                    }}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm leading-relaxed relative z-10">{message.content}</p>
                    )}
                </motion.div>

                {/* Message Info */}
                <div className={cn(
                    "flex items-center gap-2 mt-2 text-xs opacity-70 group-hover:opacity-100 transition-opacity",
                    isOwn ? "flex-row-reverse" : "flex-row"
                )}>
                    <span className={cn(isOwn ? "text-purple-200" : "text-gray-300")}>
                        {formatTime(message.createdAt)}
                    </span>
                    {isOwn && message.status && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {getStatusIcon(message.status)}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Spacer for own messages */}
            {isOwn && <div className="w-8" />}
        </motion.div>
    )
}
