export interface Planet {
  id?: number;
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents: string[];
  films: string[];
  created: string;
  edited: string;
  url: string;
  imageUrl?: string | null;
  imageUrls?: string[];
}

export interface PlanetResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Planet[];
}
