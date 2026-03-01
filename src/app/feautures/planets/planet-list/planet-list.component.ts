import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Planet } from '../../../core/models';
import { SwapiService } from '../../../core/services';

type PlanetSort = 'residents' | 'population' | 'name';

@Component({
  selector: 'app-planet-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './planet-list.component.html',
  styleUrls: ['./planet-list.component.scss'],
})
export class PlanetListComponent implements OnInit {
  allPlanets: Planet[] = [];
  planets: Planet[] = [];

  terrainOptions: string[] = ['all'];

  searchTerm = '';
  selectedTerrain = 'all';
  sortBy: PlanetSort = 'residents';

  loading = false;
  error = '';

  private readonly imageAttemptByResource = new Map<string, number>();

  constructor(private swapiService: SwapiService) { }

  get knownPopulation(): string {
    const population = this.allPlanets.reduce((total, planet) => {
      const planetPopulation = this.parsePopulation(planet.population);
      return planetPopulation > 0 ? total + planetPopulation : total;
    }, 0);

    return new Intl.NumberFormat('pt-BR').format(population);
  }

  get totalResidentsRegistered(): number {
    return this.allPlanets.reduce((total, planet) => total + planet.residents.length, 0);
  }

  get mostPopulatedPlanet(): string {
    if (this.allPlanets.length === 0) {
      return 'N/A';
    }

    const sortedByPopulation = [...this.allPlanets].sort((a, b) =>
      this.parsePopulation(b.population) - this.parsePopulation(a.population)
    );

    return sortedByPopulation[0].name;
  }

  ngOnInit(): void {
    this.loadPlanets();
  }

  onSearchTermChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onTerrainChange(terrain: string): void {
    this.selectedTerrain = terrain;
    this.applyFilters();
  }

  onSortChange(sortBy: PlanetSort): void {
    this.sortBy = sortBy;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTerrain = 'all';
    this.sortBy = 'residents';
    this.applyFilters();
  }

  hasPlanetImage(planet: Planet): boolean {
    return Boolean(this.getPlanetImage(planet));
  }

  getPlanetImage(planet: Planet): string | null {
    const imageUrls = this.getPlanetImageUrls(planet);
    const imageAttempt = this.imageAttemptByResource.get(planet.url) ?? 0;

    return imageUrls[imageAttempt] ?? null;
  }

  onPlanetImageError(planet: Planet): void {
    const imageUrls = this.getPlanetImageUrls(planet);
    const currentAttempt = this.imageAttemptByResource.get(planet.url) ?? 0;
    const nextAttempt = currentAttempt + 1;

    if (nextAttempt < imageUrls.length) {
      this.imageAttemptByResource.set(planet.url, nextAttempt);
      return;
    }

    this.imageAttemptByResource.set(planet.url, Number.MAX_SAFE_INTEGER);
  }

  climateTags(planet: Planet): string[] {
    return this.splitListValue(planet.climate);
  }

  terrainTags(planet: Planet): string[] {
    return this.splitListValue(planet.terrain);
  }

  trackByPlanet(_: number, planet: Planet): string {
    return planet.url;
  }

  private loadPlanets(): void {
    this.loading = true;
    this.error = '';

    this.swapiService.getAllPlanets().subscribe({
      next: (planets) => {
        this.allPlanets = planets;
        this.terrainOptions = ['all', ...this.buildTerrainOptions(planets)];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Falha ao carregar planetas da SWAPI.';
        this.loading = false;
      }
    });
  }

  private applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    let filteredPlanets = [...this.allPlanets];

    if (normalizedSearch) {
      filteredPlanets = filteredPlanets.filter((planet) =>
        planet.name.toLowerCase().includes(normalizedSearch)
      );
    }

    if (this.selectedTerrain !== 'all') {
      filteredPlanets = filteredPlanets.filter((planet) =>
        this.terrainTags(planet).includes(this.selectedTerrain)
      );
    }

    this.planets = this.sortPlanets(filteredPlanets);
  }

  private sortPlanets(planets: Planet[]): Planet[] {
    const sortedPlanets = [...planets];

    switch (this.sortBy) {
      case 'population':
        return sortedPlanets.sort((a, b) => this.parsePopulation(b.population) - this.parsePopulation(a.population));

      case 'name':
        return sortedPlanets.sort((a, b) => a.name.localeCompare(b.name));

      case 'residents':
      default:
        return sortedPlanets.sort((a, b) => b.residents.length - a.residents.length);
    }
  }

  private parsePopulation(rawPopulation: string): number {
    if (!rawPopulation || rawPopulation === 'unknown' || rawPopulation === 'n/a') {
      return -1;
    }

    const normalizedPopulation = Number(rawPopulation.replace(/,/g, ''));
    return Number.isFinite(normalizedPopulation) ? normalizedPopulation : -1;
  }

  private buildTerrainOptions(planets: Planet[]): string[] {
    return Array.from(
      new Set(
        planets
          .flatMap((planet) => this.splitListValue(planet.terrain))
          .filter((terrain) => terrain !== 'unknown')
      )
    ).sort((a, b) => a.localeCompare(b));
  }

  private splitListValue(rawValue: string): string[] {
    return rawValue
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0);
  }

  private getPlanetImageUrls(planet: Planet): string[] {
    if (planet.imageUrls && planet.imageUrls.length > 0) {
      return planet.imageUrls;
    }

    return planet.imageUrl ? [planet.imageUrl] : [];
  }
}
