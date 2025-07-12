"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Participant {
    id: string
    name: string
    image?: string | null
}

interface TypingIndicatorProps {
    participant: Participant
}

export function TypingIndicator({ participant }: TypingIndicatorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-3 items-end"
        >
            <Avatar className="w-8 h-8 border border-purple-500/30">
                <AvatarImage src={participant.image || ""} />
                <AvatarFallback className="bg-purple-600 text-white text-xs">
                    {participant.name?.charAt(0) || "U"}
                </AvatarFallback>
            </Avatar>

            <div className="bg-gray-700/50 border border-purple-500/20 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-purple-400 rounded-full"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    )
}
