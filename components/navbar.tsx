"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface NavbarProps {
  user: { name: string } | null
  onLogout: () => void
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-white">
          Anime<span className="text-purple-500">Explorer</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="text-slate-300 hover:text-white">
            Home
          </Link>
          <Link href="/favorites" className="text-slate-300 hover:text-white">
            Favorites
          </Link>
          <Link href="/recommendations" className="text-slate-300 hover:text-white">
            Recommendations
          </Link>

          {user && (
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-300 hover:text-white">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}

