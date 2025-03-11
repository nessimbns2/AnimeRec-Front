export interface Anime {
  id: number
  name: string  // Using name consistently instead of title
  image: string
  genres: string[]
  rating: string
  year: number
  type?: string // Optional type property (TV, Movie, OVA, etc.)
}

