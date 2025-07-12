"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Plus, X, Calendar, Edit3 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"

interface Availability {
    id: string
    day: string
    time: string
}

interface User {
    availability: Availability[]
}

interface AvailabilitySectionProps {
    user: User
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Weekends", "Weekdays"]

const times = [
    "Early Morning (6-9 AM)",
    "Morning (9-12 PM)",
    "Afternoon (12-5 PM)",
    "Evening (5-8 PM)",
    "Night (8-11 PM)",
    "Late Night (11 PM+)",
    "Flexible",
]

export function AvailabilitySection({ user }: AvailabilitySectionProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [availability, setAvailability] = useState(user.availability)
    const [newSlot, setNewSlot] = useState({ day: "", time: "" })

    const trpc = useTRPC()
    const queryClient = useQueryClient()

    // Create mutation options
    const updateAvailabilityMutationOptions = trpc.user.updateAvailability.mutationOptions()

    const updateAvailabilityMutation = useMutation({
        ...updateAvailabilityMutationOptions,
        onSuccess: () => {
            const dashboardQueryKey = trpc.user.getDashboardData.queryKey()
            queryClient.invalidateQueries({ queryKey: dashboardQueryKey })
            setIsEditing(false)
            toast.success("Availability updated successfully!")
        },
        onError: () => {
            toast.error("Failed to update availability")
        },
    })

    const handleSave = async () => {
        await updateAvailabilityMutation.mutateAsync({
            availability: availability.map(({ day, time }) => ({ day, time })),
        })
    }

    const handleAddSlot = () => {
        if (!newSlot.day || !newSlot.time) return

        const exists = availability.some((slot) => slot.day === newSlot.day && slot.time === newSlot.time)
        if (exists) {
            toast.error("This time slot already exists")
            return
        }

        setAvailability([...availability, { ...newSlot, id: Date.now().toString() }])
        setNewSlot({ day: "", time: "" })
    }

    const handleRemoveSlot = (index: number) => {
        setAvailability(availability.filter((_, i) => i !== index))
    }

    const handleCancel = () => {
        setAvailability(user.availability)
        setNewSlot({ day: "", time: "" })
        setIsEditing(false)
    }

    return (
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Availability
                </CardTitle>
                {!isEditing && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                        <Edit3 className="w-4 h-4" />
                    </Button>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {isEditing ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        {/* Add new slot */}
                        <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
                            <h4 className="text-white font-medium">Add Time Slot</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Select value={newSlot.day} onValueChange={(value) => setNewSlot({ ...newSlot, day: value })}>
                                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                        <SelectValue placeholder="Select day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {days.map((day) => (
                                            <SelectItem key={day} value={day}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={newSlot.time} onValueChange={(value) => setNewSlot({ ...newSlot, time: value })}>
                                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {times.map((time) => (
                                            <SelectItem key={time} value={time}>
                                                {time}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={handleAddSlot}
                                disabled={!newSlot.day || !newSlot.time}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Slot
                            </Button>
                        </div>

                        {/* Current slots */}
                        <div className="space-y-2">
                            <h4 className="text-white font-medium">Current Availability</h4>
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {availability.map((slot, index) => (
                                        <motion.div
                                            key={`${slot.day}-${slot.time}-${index}`}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-4 h-4 text-purple-400" />
                                                <span className="text-white">{slot.day}</span>
                                                <span className="text-white/60">•</span>
                                                <span className="text-white/80">{slot.time}</span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleRemoveSlot(index)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {availability.length === 0 && (
                                <div className="text-center py-6 text-white/50">
                                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No availability set</p>
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSave}
                                disabled={updateAvailabilityMutation.isPending}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {updateAvailabilityMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                            >
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                        {user.availability.length > 0 ? (
                            <div className="space-y-2">
                                {user.availability.map((slot, index) => (
                                    <motion.div
                                        key={`${slot.day}-${slot.time}-${index}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                                    >
                                        <Clock className="w-4 h-4 text-purple-400" />
                                        <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                                            {slot.day}
                                        </Badge>
                                        <span className="text-white/60">•</span>
                                        <span className="text-white/80">{slot.time}</span>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-white/30 mx-auto mb-3" />
                                <p className="text-white/50">No availability set</p>
                                <p className="text-white/30 text-sm">Click edit to add your available times</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </CardContent>
        </Card>
    )
}
