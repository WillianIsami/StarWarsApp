export interface Character {
  id?: number;
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
  imageUrl?: string | null;
  imageUrls?: string[];
  homeworldName?: string;

  filmNames?: string[];
  speciesNames?: string[];
  vehicleNames?: string[];
  starshipNames?: string[];
}

export interface CharacterResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Character[];
}
