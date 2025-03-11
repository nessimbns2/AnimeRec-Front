"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, RefreshCw } from "lucide-react"
import AnimeCard from "@/components/anime-card"
import Navbar from "@/components/navbar"
import type { Anime } from "@/lib/types"
import API_BASE_URL from '@/lib/utils';

export default function Recommendations() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: number, name: string } | null>(null)
  const [favorites, setFavorites] = useState<Anime[]>([])
  const [recommendations, setRecommendations] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(currentUser)
    setUser(userData)
    
    // Fetch favorites and then generate recommendations
    fetchFavorites(userData.id)
  }, [router])

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

  const generatePlaceholderImage = (animeName: string) => {
    const hash = animeName.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    const hue = hash % 360;
    const saturation = 70 + (hash % 30);
    const lightness = 40 + (hash % 20);
    
    return `https://via.placeholder.com/400x600/${hue.toString(16).padStart(2, '0')}${saturation.toString(16).padStart(2, '0')}${lightness.toString(16).padStart(2, '0')}/ffffff?text=${encodeURIComponent(animeName.substring(0, 20))}`;
  };

  const fetchFavorites = async (userId: number) => {
    try {
      setInitialLoading(true)
      const response = await fetch(`${API_BASE_URL}/users/${userId}/favorite_animes/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }
      
      const data = await response.json()
      
      // Map API response to Anime objects
      const favoriteAnimes = await Promise.all(data.map(async (anime: any) => ({
        id: anime.anime_id,
        name: anime.name,
        image: await fetchAnimeImage(anime.name),
        genres: anime.genre ? anime.genre.split(', ') : [],
        rating: anime.rating,
        year: new Date().getFullYear(),
        type: anime.type
      })))
      
      setFavorites(favoriteAnimes)
      
      // Generate recommendations if there are favorites
      if (favoriteAnimes.length > 0) {
        generateRecommendations(userId)
      } else {
        setInitialLoading(false)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
      setInitialLoading(false)
    }
  }

  const generateRecommendations = async (userId: number) => {
    setLoading(true)
    try {
      // Fetch recommendations from the API
      const response = await fetch(`${API_BASE_URL}/users/recommend/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      let recommendedAnimes: Anime[] = [];
      
      if (response.ok) {
        const data = await response.json();
        console.log('Raw API response:', data);
        recommendedAnimes = await Promise.all(data.map(async (anime: any) => ({
          id: anime.anime_id,
          name: anime.name,
          image: await fetchAnimeImage(anime.name),
          genres: anime.genre ? anime.genre.split(', ') : [],
          rating: anime.rating,
          year: new Date().getFullYear(),
          type: anime.type
        })));
      } else {
        console.error('Error fetching recommendations:', await response.text());
      }
      
      console.log('Fetched recommendations:', recommendedAnimes);
      setRecommendations(recommendedAnimes);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("accessToken")
    router.push("/login")
  }

  const handleAddToFavorites = async (anime: Anime) => {
    if (!user) return;

    const isFav = favorites.some(fav => fav.id === anime.id);
    const method = isFav ? "DELETE" : "POST";
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/favorite/${anime.id}`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update favorites');
      }

      if (isFav) {
        // Remove from favorites
        setFavorites(favorites.filter(fav => fav.id !== anime.id));
      } else {
        // Add to favorites
        setFavorites([...favorites, anime]);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  }

  const isFavorite = (animeId: number) => {
    return favorites.some((fav) => fav.id === animeId);
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
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Recommendations</h1>
            <p className="text-slate-300">Based on your favorite anime</p>
          </div>
          <Button
            variant="outline"
            className="mt-4 md:mt-0 border-purple-600 text-purple-400 hover:bg-purple-950/30"
            onClick={() => generateRecommendations(user!.id)}
            disabled={loading || favorites.length === 0}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Recommendations
          </Button>
        </div>
        {favorites.length === 0 && !initialLoading ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-lg">
            <h3 className="text-xl font-medium">No favorites yet</h3>
            <p className="text-slate-400 mt-2 mb-6">Add some anime to your favorites to get recommendations!</p>
            <Button onClick={() => router.push("/dashboard")} className="bg-purple-600 hover:bg-purple-700">
              Browse Anime
            </Button>
          </div>
        ) : initialLoading || loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden bg-slate-800 border-slate-700 animate-pulse">
                <div className="aspect-[2/3] w-full bg-slate-700"></div>
                <div className="p-4">
                  <div className="h-5 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2 mb-3"></div>
                  <div className="flex gap-1">
                    <div className="h-6 bg-slate-700 rounded w-16"></div>
                    <div className="h-6 bg-slate-700 rounded w-16"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.map((anime, index) => (
              <AnimeCard
                key={anime.id ? `anime-${anime.id}` : `anime-index-${index}`}
                anime={anime}
                isFavorite={isFavorite(anime.id)}
                onToggleFavorite={() => handleAddToFavorites(anime)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

