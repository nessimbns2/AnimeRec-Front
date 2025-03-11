"use client"

import { Heart } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Anime } from "@/lib/types"

interface AnimeCardProps {
  anime: Anime
  isFavorite: boolean
  onToggleFavorite: () => void
}

export default function AnimeCard({ anime, isFavorite, onToggleFavorite }: AnimeCardProps) {
  return (
    <Card className="overflow-hidden bg-slate-800 border-slate-700 transition-all hover:shadow-lg hover:shadow-purple-900/20">
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <img
          src={anime.image || "/placeholder.svg"}
          alt={anime.name}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 rounded-full ${
            isFavorite ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-black/50 text-white hover:bg-black/70"
          }`}
          onClick={onToggleFavorite}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-white" : ""}`} />
        </Button>
      </div>
      <CardHeader className="p-4 pb-2">
        <h3 className="font-bold text-lg line-clamp-1 text-white">{anime.name}</h3>
        <div className="flex items-center text-sm text-slate-400">
          <span className="text-yellow-400 mr-1">★</span> {anime.rating} • {anime.year}
          {anime.type && (
            <span className="ml-2 px-1.5 py-0.5 bg-slate-700 rounded text-xs">{anime.type}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-1 mt-2">
          {anime.genres && anime.genres.map((genre) => (
            <Badge key={genre} variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600">
              {genre}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
