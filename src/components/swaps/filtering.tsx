"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Star, Calendar, Tag, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface AdvancedFiltersProps {
    filters: {
        skills: string[]
        location: string
        rating: number
        availability: string
        category: string
    }
    onFiltersChange: (filters: any) => void
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

const availabilityOptions = ["Weekdays", "Weekends", "Mornings", "Afternoons", "Evenings", "Flexible"]

const popularSkills = [
    "React",
    "JavaScript",
    "Python",
    "Photoshop",
    "Excel",
    "Spanish",
    "Guitar",
    "Cooking",
    "Photography",
    "Marketing",
    "Writing",
    "Design",
    "Yoga",
    "Piano",
]

export function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
    const [skillInput, setSkillInput] = useState("")

    const handleAddSkill = (skill: string) => {
        if (skill && !filters.skills.includes(skill)) {
            onFiltersChange({
                ...filters,
                skills: [...filters.skills, skill],
            })
        }
        setSkillInput("")
    }

    const handleRemoveSkill = (skill: string) => {
        onFiltersChange({
            ...filters,
            skills: filters.skills.filter((s) => s !== skill),
        })
    }

    const handleClearFilters = () => {
        onFiltersChange({
            skills: [],
            location: "",
            rating: 0,
            availability: "",
            category: "",
        })
        setSkillInput("")
    }

    const hasActiveFilters =
        filters.skills.length > 0 || filters.location || filters.rating > 0 || filters.availability || filters.category

    return (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="bg-gray-800/30 border-purple-500/20">
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Tag className="w-5 h-5 text-purple-400" />
                            Advanced Filters
                        </h3>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="text-purple-300 hover:text-white hover:bg-purple-600/20"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Clear All
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Skills Filter */}
                        <div className="space-y-3">
                            <Label className="text-white flex items-center gap-2">
                                <Tag className="w-4 h-4 text-purple-400" />
                                Skills
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add skill..."
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault()
                                            handleAddSkill(skillInput)
                                        }
                                    }}
                                    className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-purple-300"
                                />
                                <Button
                                    onClick={() => handleAddSkill(skillInput)}
                                    disabled={!skillInput}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    Add
                                </Button>
                            </div>

                            {/* Popular Skills */}
                            <div className="space-y-2">
                                <span className="text-sm text-purple-300">Popular:</span>
                                <div className="flex flex-wrap gap-1">
                                    {popularSkills.slice(0, 6).map((skill) => (
                                        <Button
                                            key={skill}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAddSkill(skill)}
                                            disabled={filters.skills.includes(skill)}
                                            className="h-6 px-2 text-xs text-purple-200 hover:text-white hover:bg-purple-600/20 border border-purple-500/30"
                                        >
                                            {skill}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Selected Skills */}
                            {filters.skills.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-sm text-purple-300">Selected:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {filters.skills.map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant="secondary"
                                                className="bg-purple-500/20 text-purple-200 border-purple-500/30 pr-1"
                                            >
                                                {skill}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveSkill(skill)}
                                                    className="h-4 w-4 p-0 ml-1 hover:bg-red-500/20"
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Location Filter */}
                        <div className="space-y-3">
                            <Label className="text-white flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-400" />
                                Location
                            </Label>
                            <Input
                                placeholder="City, Country"
                                value={filters.location}
                                onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
                                className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-purple-300"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-3">
                            <Label className="text-white">Category</Label>
                            <Select
                                value={filters.category || undefined}
                                onValueChange={(value) => onFiltersChange({ ...filters, category: value || "" })}
                            >
                                <SelectTrigger className="bg-gray-800/50 border-purple-500/30 text-white">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-purple-500/30">
                                    {skillCategories.map((category) => (
                                        <SelectItem key={category} value={category} className="text-white hover:bg-purple-600/20">
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Rating Filter */}
                        <div className="space-y-3">
                            <Label className="text-white flex items-center gap-2">
                                <Star className="w-4 h-4 text-purple-400" />
                                Minimum Rating: {filters.rating.toFixed(1)}
                            </Label>
                            <Slider
                                value={[filters.rating]}
                                onValueChange={([value]) => onFiltersChange({ ...filters, rating: value })}
                                max={5}
                                min={0}
                                step={0.5}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-purple-300">
                                <span>0.0</span>
                                <span>5.0</span>
                            </div>
                        </div>

                        {/* Availability Filter */}
                        <div className="space-y-3">
                            <Label className="text-white flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                Availability
                            </Label>
                            <Select
                                value={filters.availability || undefined}
                                onValueChange={(value) => onFiltersChange({ ...filters, availability: value || "" })}
                            >
                                <SelectTrigger className="bg-gray-800/50 border-purple-500/30 text-white">
                                    <SelectValue placeholder="Any time" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-purple-500/30">
                                    {availabilityOptions.map((option) => (
                                        <SelectItem key={option} value={option} className="text-white hover:bg-purple-600/20">
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {hasActiveFilters && (
                        <div className="pt-4 border-t border-purple-500/20">
                            <div className="flex items-center gap-2 text-sm text-purple-300">
                                <span>Active filters:</span>
                                {filters.skills.length > 0 && (
                                    <Badge variant="outline" className="border-purple-500/30 text-purple-200">
                                        {filters.skills.length} skill{filters.skills.length !== 1 ? "s" : ""}
                                    </Badge>
                                )}
                                {filters.location && (
                                    <Badge variant="outline" className="border-purple-500/30 text-purple-200">
                                        📍 {filters.location}
                                    </Badge>
                                )}
                                {filters.rating > 0 && (
                                    <Badge variant="outline" className="border-purple-500/30 text-purple-200">
                                        ⭐ {filters.rating}+
                                    </Badge>
                                )}
                                {filters.availability && (
                                    <Badge variant="outline" className="border-purple-500/30 text-purple-200">
                                        📅 {filters.availability}
                                    </Badge>
                                )}
                                {filters.category && (
                                    <Badge variant="outline" className="border-purple-500/30 text-purple-200">
                                        🏷️ {filters.category}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
