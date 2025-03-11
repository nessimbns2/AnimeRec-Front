"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, Heart, Star, Search, Menu, X } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      setUser(JSON.parse(currentUser))
    }
  }, [])

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navbar */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            AnimeRec
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Button
            variant="outline"
            className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
            onClick={() => router.push("/login")}
          >
            Log In
          </Button>
          <Button
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-sm absolute z-50 w-full py-4 px-6 border-b border-slate-800">
          <div className="flex flex-col space-y-4">
            <Button
              variant="outline"
              className="border-purple-500 text-purple-300 hover:bg-purple-500/10 w-full"
              onClick={() => router.push("/login")}
            >
              Log In
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 w-full"
              onClick={() => router.push("/signup")}
            >
              Sign Up
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-16 pb-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Discover Your Next{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Favorite Anime
              </span>
            </h1>
            <p className="text-slate-300 mb-8 text-lg max-w-xl mx-auto md:mx-0">
              Get personalized recommendations based on your taste. Connect with others who share your anime interests
              and expand your watchlist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-6 h-auto"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="relative w-full h-[500px] max-w-[500px] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"></div>
              <img
              src="/Osaka.webp?height=500&width=500"
              alt="Anime characters"
              className="relative z-10 rounded-2xl shadow-2xl shadow-purple-900/50 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="mt-32">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6 text-center h-full hover:border-purple-500/50 transition-all duration-300">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <CardContent className="pt-8 pb-4 px-4">
                  <UserPlus className="h-12 w-12 text-purple-400 mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-3 text-white">Sign Up</h3>
                  <p className="text-slate-300 text-white">Create an account to get started with personalized recommendations.</p>
                </CardContent>
              </Card>
              <div className="hidden lg:block absolute top-1/2 left-full w-12 h-1 bg-gradient-to-r from-purple-500 to-transparent -translate-y-1/2"></div>
            </div>

            <div className="relative">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6 text-center h-full hover:border-purple-500/50 transition-all duration-300">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <CardContent className="pt-8 pb-4 px-4">
                  <Heart className="h-12 w-12 text-purple-400 mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-3 text-white">Add Favorites</h3>
                  <p className="text-slate-300 text-white">Add your favorite anime to your list to help us understand your preferences.</p>
                </CardContent>
              </Card>
              <div className="hidden lg:block absolute top-1/2 left-full w-12 h-1 bg-gradient-to-r from-purple-500 to-transparent -translate-y-1/2"></div>
            </div>

            <div className="relative">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6 text-center h-full hover:border-purple-500/50 transition-all duration-300">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <CardContent className="pt-8 pb-4 px-4">
                  <Star className="h-12 w-12 text-purple-400 mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-3 text-white">Get Recommendations</h3>
                  <p className="text-slate-300 text-white">Receive personalized recommendations based on your favorites and viewing history.</p>
                </CardContent>
              </Card>
              <div className="hidden lg:block absolute top-1/2 left-full w-12 h-1 bg-gradient-to-r from-purple-500 to-transparent -translate-y-1/2"></div>
            </div>

            <div>
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6 text-center h-full hover:border-purple-500/50 transition-all duration-300">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                  4
                </div>
                <CardContent className="pt-8 pb-4 px-4">
                  <Search className="h-12 w-12 text-purple-400 mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-3 text-white">Discover New Anime</h3>
                  <p className="text-slate-300 text-white">Expand your watchlist with new anime discoveries and track what you've watched.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <Card className="bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border-purple-700/30 p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/banner.jpg')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
            <CardContent className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to find your next favorite anime?</h2>
              <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of anime fans who have discovered new series they love through AnimeRec.
              </p>
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-6 h-auto"
                onClick={handleGetStarted}
              >
                Get Started Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-slate-400">
            <p>© {new Date().getFullYear()} AnimeRec. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

