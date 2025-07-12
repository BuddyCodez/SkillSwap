"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, Lightbulb, Target, Edit3 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"

interface Skill {
    id: string
    name: string
    category: string
    description?: string | null
}

interface User {
    skillsOffered: Skill[]
    skillsWanted: Skill[]
}

interface SkillsSectionProps {
    user: User
}

const skillCategories = [
    "Technology",
    "Design",
    "Business",
    "Languages",
    "Music",
    "Sports",
    "Cooking",
    "Arts & Crafts",
    "Education",
    "Other",
]

const SkillBadge = ({ skill, type, onRemove }: { skill: Skill; type: string; onRemove: () => void }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.05 }}
        className="group relative"
    >
        <Badge
            variant="secondary"
            className={`${type === "offered"
                    ? "bg-purple-500/20 text-purple-200 border-purple-500/30"
                    : "bg-blue-500/20 text-blue-200 border-blue-500/30"
                } pr-8 py-2 text-sm`}
        >
            {skill.name}
        </Badge>
        <Button
            size="sm"
            variant="ghost"
            onClick={onRemove}
            className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
            <X className="w-3 h-3" />
        </Button>
    </motion.div>
)

const AddSkillForm = ({
    type,
    onCancel,
    newSkill,
    handleSkillNameChange,
    handleSkillCategoryChange,
    handleAddSkill,
    isPending,
    inputRef
}: {
    type: "offered" | "wanted"
    onCancel: () => void
    newSkill: { name: string; category: string }
    handleSkillNameChange: (value: string) => void
    handleSkillCategoryChange: (value: string) => void
    handleAddSkill: (type: "offered" | "wanted") => void
    isPending: boolean
    inputRef: React.RefObject<HTMLInputElement>
}) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-3 p-4 bg-black/20 rounded-lg border border-purple-500/30"
    >
        <div className="space-y-2">
            <Label className="text-white">Skill Name</Label>
            <Input
                ref={inputRef}
                value={newSkill.name}
                onChange={(e) => handleSkillNameChange(e.target.value)}
                placeholder="e.g., React Development"
                className="bg-black/20 border-purple-500/30 text-white placeholder:text-purple-300"
            />
        </div>

        <div className="space-y-2">
            <Label className="text-white">Category</Label>
            <Select value={newSkill.category} onValueChange={handleSkillCategoryChange}>
                <SelectTrigger className="bg-black/20 border-purple-500/30 text-white">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-purple-500/30">
                    {skillCategories.map((category) => (
                        <SelectItem key={category} value={category} className="text-white hover:bg-purple-600/20">
                            {category}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="flex gap-2">
            <Button
                onClick={() => handleAddSkill(type)}
                disabled={!newSkill.name || !newSkill.category || isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
            >
                Add Skill
            </Button>
            <Button
                variant="outline"
                onClick={onCancel}
                className="border-purple-500/30 text-white hover:bg-purple-600/20 bg-transparent"
            >
                Cancel
            </Button>
        </div>
    </motion.div>
)

export function SkillsSection({ user }: SkillsSectionProps) {
    const [isAddingOffered, setIsAddingOffered] = useState(false)
    const [isAddingWanted, setIsAddingWanted] = useState(false)
    const [newSkill, setNewSkill] = useState({
        name: "",
        category: "",
        description: "",
    })

    const inputRef = useRef<HTMLInputElement>(null)
    const trpc = useTRPC()
    const queryClient = useQueryClient()

    // Focus input when form appears
    useEffect(() => {
        if ((isAddingOffered || isAddingWanted) && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isAddingOffered, isAddingWanted])

    // Create mutation options
    const addSkillMutationOptions = trpc.user.addSkill.mutationOptions()
    const removeSkillMutationOptions = trpc.user.removeSkill.mutationOptions()

    const addSkillMutation = useMutation({
        ...addSkillMutationOptions,
        onSuccess: () => {
            const dashboardQueryKey = trpc.user.getDashboardData.queryKey()
            queryClient.invalidateQueries({ queryKey: dashboardQueryKey })
            toast.success("Skill added successfully!")
        },
        onError: () => {
            toast.error("Failed to add skill")
        },
    })

    const removeSkillMutation = useMutation({
        ...removeSkillMutationOptions,
        onSuccess: () => {
            const dashboardQueryKey = trpc.user.getDashboardData.queryKey()
            queryClient.invalidateQueries({ queryKey: dashboardQueryKey })
            toast.success("Skill removed successfully!")
        },
        onError: () => {
            toast.error("Failed to remove skill")
        },
    })

    const handleSkillNameChange = useCallback((value: string) => {
        setNewSkill((prev) => ({ ...prev, name: value }))
    }, [])

    const handleSkillCategoryChange = useCallback((value: string) => {
        setNewSkill((prev) => ({ ...prev, category: value }))
    }, [])

    const handleAddSkill = async (type: "offered" | "wanted") => {
        if (!newSkill.name || !newSkill.category) return

        try {
            await addSkillMutation.mutateAsync({
                ...newSkill,
                type,
            })
            setNewSkill({ name: "", category: "", description: "" })
            setIsAddingOffered(false)
            setIsAddingWanted(false)
        } catch (error) {
            // Error handled by mutation
        }
    }

    const handleRemoveSkill = async (skillId: string, type: "offered" | "wanted") => {
        await removeSkillMutation.mutateAsync({ skillId, type })
    }

    return (
        <Card className="bg-black/20 backdrop-blur-xl border-purple-500/30 shadow-xl">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Skills Management
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Skills Offered */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-semibold text-white">Skills I Offer</h3>
                            <Badge variant="outline" className="border-purple-500/30 text-purple-200">
                                {user.skillsOffered.length}
                            </Badge>
                        </div>
                        {!isAddingOffered && (
                            <Button
                                size="sm"
                                onClick={() => setIsAddingOffered(true)}
                                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                            </Button>
                        )}
                    </div>

                    <AnimatePresence>
                        {isAddingOffered && (
                            <AddSkillForm
                                type="offered"
                                onCancel={() => setIsAddingOffered(false)}
                                newSkill={newSkill}
                                handleSkillNameChange={handleSkillNameChange}
                                handleSkillCategoryChange={handleSkillCategoryChange}
                                handleAddSkill={handleAddSkill}
                                isPending={addSkillMutation.isPending}
                                inputRef={inputRef}
                            />
                        )}
                    </AnimatePresence>

                    <div className="flex flex-wrap gap-2">
                        <AnimatePresence>
                            {user.skillsOffered.map((skill) => (
                                <SkillBadge
                                    key={skill.id}
                                    skill={skill}
                                    type="offered"
                                    onRemove={() => handleRemoveSkill(skill.id, "offered")}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {user.skillsOffered.length === 0 && !isAddingOffered && (
                        <div className="text-center py-6 text-purple-300">
                            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No skills offered yet</p>
                        </div>
                    )}
                </div>

                {/* Skills Wanted */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-semibold text-white">Skills I Want to Learn</h3>
                            <Badge variant="outline" className="border-blue-500/30 text-blue-200">
                                {user.skillsWanted.length}
                            </Badge>
                        </div>
                        {!isAddingWanted && (
                            <Button
                                size="sm"
                                onClick={() => setIsAddingWanted(true)}
                                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-500/30"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                            </Button>
                        )}
                    </div>

                    <AnimatePresence>
                        {isAddingWanted && (
                            <AddSkillForm
                                type="wanted"
                                onCancel={() => setIsAddingWanted(false)}
                                newSkill={newSkill}
                                handleSkillNameChange={handleSkillNameChange}
                                handleSkillCategoryChange={handleSkillCategoryChange}
                                handleAddSkill={handleAddSkill}
                                isPending={addSkillMutation.isPending}
                                inputRef={inputRef}
                            />
                        )}
                    </AnimatePresence>

                    <div className="flex flex-wrap gap-2">
                        <AnimatePresence>
                            {user.skillsWanted.map((skill) => (
                                <SkillBadge
                                    key={skill.id}
                                    skill={skill}
                                    type="wanted"
                                    onRemove={() => handleRemoveSkill(skill.id, "wanted")}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {user.skillsWanted.length === 0 && !isAddingWanted && (
                        <div className="text-center py-6 text-blue-300">
                            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No learning goals yet</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}