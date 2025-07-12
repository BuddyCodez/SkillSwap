"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface User {
    id: string
    name: string
    image?: string | null
    skillsOffered: Array<{
        id: string
        name: string
        category: string
    }>
    skillsWanted: Array<{
        id: string
        name: string
        category: string
    }>
}

interface SwapRequestModalProps {
    user: User
    currentUserSkills: Array<{
        id: string
        name: string
        category: string
    }>
    onClose: () => void
    onSubmit: (data: {
        toUserId: string
        skillOfferedId: string
        skillWantedId: string
        message?: string
    }) => Promise<void>
    isLoading: boolean
}

export function SwapRequestModal({ user, currentUserSkills, onClose, onSubmit, isLoading }: SwapRequestModalProps) {
    const [mySkillId, setMySkillId] = useState("")
    const [theirSkillId, setTheirSkillId] = useState("")
    const [message, setMessage] = useState("")

    const handleSubmit = async () => {
        if (!mySkillId || !theirSkillId) return

        await onSubmit({
            toUserId: user.id,
            skillOfferedId: mySkillId,
            skillWantedId: theirSkillId,
            message: message.trim() || undefined,
        })
    }

    const selectedMySkill = currentUserSkills.find((s) => s.id === mySkillId)
    const selectedTheirSkill = user.skillsOffered.find((s) => s.id === theirSkillId)

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="bg-gray-800 border-purple-500/30 max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback className="bg-purple-600 text-white">{user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        Request Swap with {user.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Skill Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <Label className="text-white">I will teach:</Label>
                            <Select value={mySkillId} onValueChange={setMySkillId}>
                                <SelectTrigger className="bg-gray-800/50 border-purple-500/30 text-white">
                                    <SelectValue placeholder="Select your skill" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-purple-500/30">
                                    {currentUserSkills.map((skill) => (
                                        <SelectItem key={skill.id} value={skill.id} className="text-white hover:bg-purple-600/20">
                                            {skill.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-white">I want to learn:</Label>
                            <Select value={theirSkillId} onValueChange={setTheirSkillId}>
                                <SelectTrigger className="bg-gray-800/50 border-purple-500/30 text-white">
                                    <SelectValue placeholder="Select their skill" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-purple-500/30">
                                    {user.skillsOffered.map((skill) => (
                                        <SelectItem key={skill.id} value={skill.id} className="text-white hover:bg-purple-600/20">
                                            {skill.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Swap Preview */}
                    {selectedMySkill && selectedTheirSkill && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                            <Card className="bg-purple-500/10 border-purple-500/30">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-center gap-4">
                                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                            You teach: {selectedMySkill.name}
                                        </Badge>
                                        <ArrowRight className="w-5 h-5 text-purple-400" />
                                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                            You learn: {selectedTheirSkill.name}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Message */}
                    <div className="space-y-3">
                        <Label className="text-white">Message (optional)</Label>
                        <Textarea
                            placeholder="Introduce yourself and explain why you'd like to swap skills..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-purple-300 min-h-[100px]"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="border-purple-500/30 text-white hover:bg-purple-600/20 bg-transparent"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!mySkillId || !theirSkillId || isLoading}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {isLoading ? (
                                "Sending..."
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Request
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
