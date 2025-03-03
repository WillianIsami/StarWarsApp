export interface Film {
  title: string;
  episode_id: number;
  release_date: string;
  characters: string[];
}

export interface FilmResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Film[];
}
