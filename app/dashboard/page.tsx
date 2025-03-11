"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Heart } from "lucide-react"
import AnimeCard from "@/components/anime-card"
import Navbar from "@/components/navbar"
import type { Anime } from "@/lib/types"
import API_BASE_URL from '@/lib/utils';

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [genres, setGenres] = useState<string[]>([])
  const [favorites, setFavorites] = useState<number[]>([])

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(currentUser))
    fetchFavorites()
    fetchAnimes()
    fetchGenres()
  }, [router])

  useEffect(() => {
    if (user) { // Only fetch if user is set
      fetchAnimes();
    }
  }, [currentPage, searchQuery, selectedGenre, user]);

  // Add a new useEffect to reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, selectedGenre]);

  const fetchGenres = async () => {
    try {
      setGenres([
        "Action",
        "Adventure",
        "Comedy",
        "Drama",
        "Fantasy",
        "Horror",
        "Mystery",
        "Romance",
        "Sci-Fi",
        "Slice of Life",
      ])
    } catch (error) {
      console.error("Error fetching genres:", error)
    }
  }

  const generatePlaceholderImage = (animeName: string) => {
    // Create a deterministic hash from the anime name so the same anime always gets the same color
    const hash = animeName.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    // Generate a color based on the hash
    const hue = hash % 360;
    const saturation = 70 + (hash % 30); // Between 70-100
    const lightness = 40 + (hash % 20);  // Between 40-60
    
    // Return a URL for a colored placeholder with the anime name
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

  const fetchAnimes = async () => {
    setLoading(true);
    
    // Build URL based on filters
    let url = `${API_BASE_URL}/animes/`;
    
    const params = new URLSearchParams();
    
    // Only add search parameter if there's a query
    if (searchQuery) {
      params.append('name', searchQuery);
    }
    
    // Only add genre parameter if a specific genre (not "all") is selected
    if (selectedGenre && selectedGenre !== "all") {
      params.append('genre', selectedGenre);
    }
    
    params.append('order_by_rating', 'True');
    params.append('page', currentPage.toString());
    params.append('limit', '8');
    
    // Append the params to the URL
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    console.log('Fetching animes from URL:', url);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched animes raw data:', data);
      
      // Handle the returned data with proper image fetching
      const allAnimesPromises = data.results.map(async (anime: any) => {
        const imageUrl = await fetchAnimeImage(anime.name);
        return {
          id: anime.anime_id,
          name: anime.name,
          image: imageUrl,
          genres: anime.genre.split(", "),
          rating: anime.rating,
          year: new Date().getFullYear(), // Assuming year is not provided in the response
          type: anime.type
        };
      });
      
      const allAnimes = await Promise.all(allAnimesPromises);
      
      setTotalPages(data.totalPages);
      // Check if there are animes and if we're on the last page
      const hasNextPage = data.currentPage < data.totalPages;
      const hasPrevPage = data.currentPage > 1;
      
      setAnimes(allAnimes);
    } catch (error) {
      console.error('Error fetching animes:', error);
      setAnimes([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const currentUser = localStorage.getItem("currentUser")
      if (!currentUser) return
      
      const user = JSON.parse(currentUser)
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/favorite_animes/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched favorites:', data)
        
        // Extract just the IDs from favorite animes
        const favoriteIds = data.map((anime: any) => anime.anime_id)
        setFavorites(favoriteIds)
      } else {
        console.error('Error response from favorites API:', await response.text())
      }
    } catch (error) {
      console.error("Error fetching favorites:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  const handleAddToFavorites = async (anime: Anime) => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) return
    const user = JSON.parse(currentUser)
    
    try {
      // If already a favorite, remove it, otherwise add it
      const isFav = favorites.includes(anime.id)
      const method = isFav ? "DELETE" : "POST"
      
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/favorite/${anime.id}`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update favorites")
      }

      // Update local favorites state
      if (isFav) {
        setFavorites(favorites.filter(id => id !== anime.id))
      } else {
        setFavorites([...favorites, anime.id])
      }
      
      console.log(`${isFav ? 'Removed from' : 'Added to'} favorites: ${anime.name}`)
    } catch (error) {
      console.error("Error updating favorites:", error)
    }
  }

  const isFavorite = (animeId: number) => {
    return favorites.includes(animeId)
  }

  const handlePageChange = (pageNumber: number) => {
    console.log(`Changing page to ${pageNumber}`);
    if (pageNumber === currentPage) return;
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-slate-300">Discover and track your favorite anime series</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4 flex-wrap">
            <Input
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:w-1/2 bg-slate-800 border-slate-700 text-white"
            />
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="md:w-1/4 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select genre" />  
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Search
            </Button>
          </form>
        </div>

        {/* Anime Grid */}
        <div className="min-h-[400px]">
          {loading ? (
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
          ) : animes && animes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {animes.map((anime, index) => (
                <AnimeCard
                  key={anime.id ? `anime-${anime.id}` : `anime-index-${index}`}
                  anime={anime}
                  isFavorite={isFavorite(anime.id)}
                  onToggleFavorite={() => handleAddToFavorites(anime)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium">No anime found</h3>
              <p className="text-slate-400 mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination - Simplified to only use Next/Previous */}
        {animes.length > 0 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) handlePageChange(currentPage - 1)
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {/* Display current page info */}
              <PaginationItem>
                <div className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </div>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) handlePageChange(currentPage + 1)
                  }}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Recommendations Button */}
        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => router.push("/recommendations")}
          >
            Generate Recommendations
          </Button>
        </div>
      </main>
    </div>
  )
}

