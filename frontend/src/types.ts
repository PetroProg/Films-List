export interface Film {
  id: number;
  title: string;
  year?: number | null;
  url: string;
  status: 'plan' | 'watched' | 'dropped';
  rating: number; // 0-5
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  total: number;
  plan: number;
  watched: number;
  dropped: number;
  avg_rating: number;
}

export interface FilmsResponse {
  films: Film[];
  stats: Stats;
}

export type FilterStatus = 'all' | 'plan' | 'watched' | 'dropped';

export type SortOption =
  | 'created_desc'
  | 'title_asc'
  | 'title_desc'
  | 'year_desc'
  | 'year_asc'
  | 'rating_desc'
  | 'rating_asc'
  | 'oldest';
