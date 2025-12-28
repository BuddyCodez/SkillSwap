"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, X, ImageIcon, Send } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface ImageUploadModalProps {
    onClose: () => void
    onUpload: (imageUrl: string) => Promise<void>
}

export function ImageUploadModal({ onClose, onUpload }: ImageUploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file")
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB")
            return
        }

        setSelectedFile(file)

        // Create preview URL
        const reader = new FileReader()
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        setIsUploading(true)
        try {
            // In a real app, you would upload to a cloud storage service
            // For demo purposes, we'll create a blob URL
            const imageUrl = URL.createObjectURL(selectedFile)
            await onUpload(imageUrl)
            toast.success("Image uploaded successfully!")
        } catch (error) {
            toast.error("Failed to upload image")
            console.error("Upload error:", error)
        } finally {
            setIsUploading(false)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()

        const file = e.dataTransfer.files?.[0]
        if (!file) return

        handleFileSelect(file)
    }


    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="bg-gray-800 border-purple-500/30 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-purple-400" />
                        Upload Image
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {!previewUrl ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                            <p className="text-white mb-2">Click to upload or drag and drop</p>
                            <p className="text-purple-300 text-sm">PNG, JPG, GIF up to 5MB</p>

                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleFileSelect(file)
                                }}
                            />

                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                            <div className="relative">
                                <img
                                    src={previewUrl || "/placeholder.svg"}
                                    alt="Preview"
                                    className="w-full h-64 object-cover rounded-lg border border-purple-500/30"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSelectedFile(null)
                                        setPreviewUrl(null)
                                    }}
                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="text-center">
                                <p className="text-white font-medium">{selectedFile?.name}</p>
                                <p className="text-purple-300 text-sm">
                                    {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </motion.div>
                    )}

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
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {isUploading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            {isUploading ? "Uploading..." : "Send Image"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
