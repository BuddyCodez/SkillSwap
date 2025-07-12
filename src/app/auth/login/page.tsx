"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Loader2, Sparkles, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-purple-500/30 bg-gray-800/50 backdrop-blur-xl">
                <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">SkillSwap</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 -z-10">
                    <motion.div
                        className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -50, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
                        animate={{
                            x: [0, -100, 0],
                            y: [0, 50, 0],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-2 border-purple-500/30 bg-gray-800/50 backdrop-blur-xl">
                        <CardHeader className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
                            <CardDescription className="text-gray-300">
                                Sign in to continue your learning journey
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    className="bg-gray-700/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-white">Password</Label>
                                    <Link
                                        href="#"
                                        className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        autoComplete="password"
                                        className="bg-gray-700/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 pr-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                                    className="border-purple-500/30 data-[state=checked]:bg-purple-600"
                                />
                                <Label htmlFor="remember" className="text-gray-300">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0"
                                disabled={loading}
                                onClick={async () => {
                                    await signIn.email(
                                        {
                                            email,
                                            password
                                        },
                                        {
                                            onRequest: (ctx) => {
                                                setLoading(true);
                                            },
                                            onResponse: (ctx) => {
                                                setLoading(false);
                                            },
                                            onSuccess: (ctx) => {
                                                // Check user role and redirect accordingly
                                                if (ctx.data.user.role === 'ADMIN') {
                                                    router.push("/admin");
                                                } else {
                                                    router.push("/dashboard");
                                                }
                                            },
                                        },
                                    );
                                }}
                            >
                                {loading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    "Sign In"
                                )}
                            </Button>

                            <div className="text-center text-sm text-gray-400">
                                Don't have an account?{" "}
                                <Link href="/auth/signup" className="text-purple-300 hover:text-purple-200 transition-colors font-medium">
                                    Sign up
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}