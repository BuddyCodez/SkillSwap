"use client"

import { motion } from "framer-motion"
import { MessageCircle, ArrowLeft } from "lucide-react"

export function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex items-center justify-center p-8"
        >
            <div className="text-center max-w-md">
                <div className="relative mb-6">
                    <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto">
                        <MessageCircle className="w-12 h-12 text-purple-400" />
                    </div>
                    <motion.div
                        className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                        }}
                    >
                        <span className="text-white text-sm">💬</span>
                    </motion.div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">Select a conversation</h3>
                <p className="text-purple-300 mb-6 leading-relaxed">
                    Choose a conversation from the sidebar to start chatting with your skill swap partners.
                </p>

                <div className="flex items-center justify-center gap-2 text-purple-400 text-sm">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Pick a conversation to get started</span>
                </div>
            </div>
        </motion.div>
    )
}
