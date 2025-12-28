"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Star, Users, MessageCircle, Zap, Code, Palette, Camera, Music, Languages, Sparkles, Heart, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnnouncementBanner } from "@/components/ui/announcement-banner"

// Mock data for live interactions
const mockUsers = [
  { name: "Sarah", skill: "React", wants: "UI/UX Design", avatar: "👩‍💻", rating: 4.9 },
  { name: "Alex", skill: "Photography", wants: "Guitar", avatar: "📸", rating: 4.7 },
  { name: "Maya", skill: "Spanish", wants: "React", avatar: "🌟", rating: 4.8 },
]

const features = [
  {
    icon: Users,
    title: "Connect with Learners",
    description: "Find people who want to learn what you know and teach what you want to learn",
    step: "1"
  },
  {
    icon: MessageCircle,
    title: "Start Conversations",
    description: "Communicate seamlessly with built-in messaging and coordinate your skill exchanges",
    step: "2"
  },
  {
    icon: Star,
    title: "Build Your Reputation",
    description: "Earn ratings and reviews as you help others learn and grow your own skills",
    step: "3"
  },
  {
    icon: Zap,
    title: "Skill Swap Success",
    description: "Complete successful exchanges and unlock new learning opportunities",
    step: "4"
  }
]

export default function LandingPage() {

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <AnnouncementBanner />
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-purple-500/30 bg-gray-800/50 backdrop-blur-xl supports-[backdrop-filter]:bg-gray-800/60">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SkillSwap</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-purple-200 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#demo" className="text-sm font-medium text-purple-200 hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="#community" className="text-sm font-medium text-purple-200 hover:text-white transition-colors">
              Community
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white border-0" asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white border-0" asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container max-w-7xl mx-auto py-24 md:py-32 relative overflow-hidden px-4">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(139,69,255,0.15),transparent_50%)]" />

          {/* Floating blur orbs */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-6"
            >
              <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-900/20 backdrop-blur-sm px-4 py-1.5 text-sm font-medium w-fit">
                <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                <span className="text-purple-200">Knowledge Exchange Platform</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                Learn Anything, <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Teach</span> Everything
              </h1>
              <p className="text-xl text-gray-300 max-w-[600px]">
                Connect with learners worldwide. Trade your skills for new knowledge.
                Build a community where everyone teaches and everyone learns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button size="lg" className="group bg-purple-600 hover:bg-purple-700 text-white border-0 hover:scale-105 active:scale-95 transition-all duration-200" asChild>
                  <Link href="/auth/signup">
                    Start Skill Swapping
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" className="bg-purple-500 hover:bg-purple-600 text-white border-0 hover:scale-105 active:scale-95 transition-all duration-200" asChild>
                  <Link href="#demo">
                    See How It Works
                    <Zap className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Live Stats */}
              <div className="flex items-center gap-6 pt-4 border-t border-purple-500/30">
                <div className="flex items-center gap-2">
                  <div className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-sm text-gray-400">Live learners:</span>
                  <span className="text-sm font-semibold text-green-400">247</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3 text-pink-400" />
                  <span className="text-sm text-gray-400">Active swaps:</span>
                  <span className="text-sm font-semibold text-pink-400">156</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-400">Avg rating:</span>
                  <span className="text-sm font-semibold text-yellow-400">4.8</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <Card className="relative overflow-hidden border-2 border-purple-500/30 bg-gray-800/50 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          S
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Sarah Chen</h3>
                          <p className="text-sm text-gray-400">React Developer</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20">
                        Available
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">Teaching:</span>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">React</Badge>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">TypeScript</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">Learning:</span>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300">UI/UX Design</Badge>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300">Figma</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-purple-500/30">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm text-gray-400 ml-1">(4.9)</span>
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white border-0 hover:scale-105 active:scale-95 transition-all duration-200" asChild>
                        <Link href="/auth/signup">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Connect
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-gray-900/50 backdrop-blur-3xl" />
          <div className="container max-w-7xl mx-auto space-y-16 relative z-10 px-4">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">How SkillSwap Works</h2>
              <p className="text-xl text-gray-300 max-w-[800px] mx-auto">
                Join thousands of learners who are already growing their skills through meaningful exchanges
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <Card className="h-full border-2 border-purple-500/30 bg-gray-800/50 backdrop-blur-xl hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm flex items-center justify-center text-purple-300 mx-auto border border-purple-500/30">
                          <feature.icon className="h-6 w-6" />
                        </div>
                        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center">
                          {feature.step}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-24">
          <div className="container max-w-7xl mx-auto space-y-12 px-4">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">See It In Action</h2>
              <p className="text-xl text-gray-300 max-w-[800px] mx-auto">
                Discover how real people are already swapping skills and growing together
              </p>
            </div>

            <Tabs defaultValue="browse" className="max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-purple-500/30 backdrop-blur-xl">
                <TabsTrigger value="browse" className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-purple-200">Browse Skills</TabsTrigger>
                <TabsTrigger value="connect" className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-purple-200">Connect & Chat</TabsTrigger>
                <TabsTrigger value="swap" className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-purple-200">Complete Swap</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="mt-8">
                <div className="grid md:grid-cols-3 gap-6">
                  {mockUsers.map((user, index) => (
                    <motion.div
                      key={user.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-2 border-purple-500/30 bg-gray-800/50 backdrop-blur-xl hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
                        <CardContent className="p-6 text-center space-y-4">
                          <div className="text-4xl">{user.avatar}</div>
                          <div>
                            <h3 className="font-semibold text-white">{user.name}</h3>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < Math.floor(user.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-500"}`} />
                              ))}
                              <span className="text-sm text-gray-400 ml-1">({user.rating})</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Teaches: {user.skill}
                            </Badge>
                            <br />
                            <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                              Wants: {user.wants}
                            </Badge>
                          </div>
                          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0 hover:scale-105 active:scale-95 transition-all duration-200" size="sm" asChild>
                            <Link href="/auth/signup">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Connect
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="connect" className="mt-8">
                <Card className="max-w-2xl mx-auto border-purple-500/30 bg-gray-800/50 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-purple-900/30 backdrop-blur-sm rounded-lg border border-purple-500/20">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                          S
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">Hey! I saw you&apos;re looking to learn React. I&apos;d love to help you get started!</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-pink-900/30 backdrop-blur-sm rounded-lg ml-8 border border-pink-500/20">
                        <div className="flex-1">
                          <p className="text-sm text-white">That&apos;s amazing! I can teach you UI/UX design in return. When would be a good time to start?</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                          A
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-purple-900/30 backdrop-blur-sm rounded-lg border border-purple-500/20">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                          S
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">Perfect! How about we start with a 1-hour session this weekend?</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="swap" className="mt-8">
                <Card className="max-w-2xl mx-auto border-purple-500/30 bg-gray-800/50 backdrop-blur-xl">
                  <CardContent className="p-6 text-center space-y-6">
                    <div className="flex items-center justify-center">
                      <Trophy className="h-16 w-16 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Swap Completed!</h3>
                      <p className="text-gray-300 mt-2">
                        Congratulations! You&apos;ve successfully completed your skill exchange.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-purple-900/20 backdrop-blur-sm rounded-lg border border-purple-500/20">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📚</div>
                        <p className="text-sm font-medium text-white">You Learned</p>
                        <p className="text-sm text-gray-300">React Basics</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">🎨</div>
                        <p className="text-sm font-medium text-white">You Taught</p>
                        <p className="text-sm text-gray-300">UI/UX Design</p>
                      </div>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0 hover:scale-105 active:scale-95 transition-all duration-200" asChild>
                      <Link href="/auth/signup">
                        <Star className="h-4 w-4 mr-2" />
                        Rate Your Experience
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Community Section */}
        <section id="community" className="bg-gray-800/30 backdrop-blur-sm py-24">
          <div className="container max-w-7xl mx-auto space-y-12 px-4">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Join Our Growing Community</h2>
              <p className="text-xl text-gray-300 max-w-[800px] mx-auto">
                Thousands of learners are already growing their skills through meaningful exchanges
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center space-y-2"
              >
                <div className="text-4xl font-bold text-purple-400">10K+</div>
                <p className="text-lg font-medium text-white">Active Learners</p>
                <p className="text-sm text-gray-400">Growing every day</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center space-y-2"
              >
                <div className="text-4xl font-bold text-purple-400">25K+</div>
                <p className="text-lg font-medium text-white">Successful Swaps</p>
                <p className="text-sm text-gray-400">And counting</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center space-y-2"
              >
                <div className="text-4xl font-bold text-purple-400">4.9★</div>
                <p className="text-lg font-medium text-white">Average Rating</p>
                <p className="text-sm text-gray-400">Highly rated by users</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container max-w-7xl mx-auto py-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 p-12 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />

            {/* Floating blur orbs */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-purple-400/30 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl animate-bounce" />

            <div className="relative z-10 text-center space-y-6 max-w-[800px] mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Your Learning Journey?</h2>
              <p className="text-xl opacity-90">
                Join thousands of learners who are already growing their skills through meaningful exchanges
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100 border-0 hover:scale-105 active:scale-95 transition-all duration-200" asChild>
                  <Link href="/auth/signup">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Skill Swapping
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-black hover:bg-white/90 backdrop-blur-sm hover:scale-105 active:scale-95 transition-all duration-200" asChild>
                  <Link href="/auth/login">
                    Already have an account?
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/30 py-12 bg-gray-900/50 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="font-bold text-white">SkillSwap</span>
          </div>
          <p className="text-sm text-gray-400">© 2025 SkillSwap. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-gray-400 hover:text-purple-300 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-purple-300 transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-purple-300 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
