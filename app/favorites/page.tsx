"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import AnimeCard from "@/components/anime-card"
import Navbar from "@/components/navbar"
import type { Anime } from "@/lib/types"
import API_BASE_URL from '@/lib/utils';

export default function Favorites() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: number, name: string } | null>(null)
  const [favorites, setFavorites] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/login")
      return
    }
    
    const userData = JSON.parse(currentUser)
    setUser(userData)
    
    // Fetch user's favorites from API
    fetchFavorites(userData.id)
  }, [router])

  const fetchFavorites = async (userId: number) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/favorite_animes/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }
      
      const data = await response.json()
      console.log('Fetched favorites:', data)
      
      // Map API response to Anime objects with proper async handling
      const favoriteAnimes = await Promise.all(data.map(async (anime: any) => ({
        id: anime.anime_id,
        name: anime.name,
        image: await fetchAnimeImage(anime.name),
        genres: anime.genre.split(', '),
        rating: anime.rating,
        year: new Date().getFullYear(),
        type: anime.type
      })))
      
      setFavorites(favoriteAnimes)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePlaceholderImage = (animeName: string) => {
    const hash = animeName.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    const hue = hash % 360;
    const saturation = 70 + (hash % 30);
    const lightness = 40 + (hash % 20);
    
    return `https://via.placeholder.com/400x600/${hue.toString(16).padStart(2, '0')}${saturation.toString(16).padStart(2, '0')}${lightness.toString(16).padStart(2, '0')}/ffffff?text=${encodeURIComponent(animeName.substring(0, 20))}`;
  };

  const fetchAnimeImage = async (animeName: string) => {
    try {
      const response = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(animeName)}&page[limit]=1`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.data && data.data.length > 0 && data.data[0].attributes.posterImage) {
        return data.data[0].attributes.posterImage.medium || data.data[0].attributes.posterImage.original;
      }
    } catch (error) {
      console.error('Error fetching anime image from Kitsu:', error);
    }
    return generatePlaceholderImage(animeName);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("accessToken")
    router.push("/login")
  }

  const handleRemoveFromFavorites = async (anime: Anime) => {
    if (!user) return

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/favorite/${anime.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to remove from favorites')
      }

      // Update local state
      setFavorites(favorites.filter((fav) => fav.id !== anime.id))
    } catch (error) {
      console.error('Error removing from favorites:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 text-slate-300 hover:text-white"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
          <p className="text-slate-300">Your collection of favorite anime series</p>
        </div>
        
        {loading ? (
          // Skeleton loading state
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={`skeleton-${i}`} className="bg-slate-800 border-slate-700 animate-pulse">
                <div className="aspect-[2/3] w-full bg-slate-700"></div>
                <div className="p-4">
                  <div className="h-5 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                isFavorite={true}
                onToggleFavorite={() => handleRemoveFromFavorites(anime)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800/50 rounded-lg">
            <h3 className="text-xl font-medium">No favorites yet</h3>
            <p className="text-slate-400 mt-2 mb-6">Start adding some anime to your favorites!</p>
            <Button onClick={() => router.push("/dashboard")} className="bg-purple-600 hover:bg-purple-700">
              Browse Anime
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

