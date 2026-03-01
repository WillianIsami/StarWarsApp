import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Character, Film } from '../../../core/models';
import { RecommendationService, SwapiService } from '../../../core/services';

type FilmFilterMode = 'release' | 'chronological' | 'character';

@Component({
  selector: 'app-film-recommendations',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './film-recommendations.component.html',
  styleUrl: './film-recommendations.component.scss',
})
export class FilmRecommendationsComponent implements OnInit {
  allFilms: Film[] = [];
  films: Film[] = [];

  characters: Character[] = [];

  selectedFilter: FilmFilterMode = 'release';
  selectedCharacter = '';
  searchTerm = '';

  loading = false;
  error = '';

  expandedFilmUrl: string | null = null;

  private readonly posterAttemptByResource = new Map<string, number>();

  constructor(
    private recommendationService: RecommendationService,
    private swapiService: SwapiService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchTermChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedFilter = 'release';
    this.selectedCharacter = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  toggleOpeningCrawl(filmUrl: string): void {
    this.expandedFilmUrl = this.expandedFilmUrl === filmUrl ? null : filmUrl;
  }

  isOpeningCrawlExpanded(filmUrl: string): boolean {
    return this.expandedFilmUrl === filmUrl;
  }

  hasPoster(film: Film): boolean {
    return Boolean(this.getPoster(film));
  }

  getPoster(film: Film): string | null {
    const posterUrls = this.getPosterUrls(film);
    const posterAttempt = this.posterAttemptByResource.get(film.url) ?? 0;

    return posterUrls[posterAttempt] ?? null;
  }

  onPosterError(film: Film): void {
    const posterUrls = this.getPosterUrls(film);
    const currentAttempt = this.posterAttemptByResource.get(film.url) ?? 0;
    const nextAttempt = currentAttempt + 1;

    if (nextAttempt < posterUrls.length) {
      this.posterAttemptByResource.set(film.url, nextAttempt);
      return;
    }

    this.posterAttemptByResource.set(film.url, Number.MAX_SAFE_INTEGER);
  }

  getReleaseYear(film: Film): string {
    return new Date(film.release_date).getFullYear().toString();
  }

  trackByFilm(_: number, film: Film): string {
    return film.url;
  }

  private loadData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      films: this.recommendationService.getAllFilms(),
      characters: this.swapiService.getAllCharacters()
    }).subscribe({
      next: ({ films, characters }) => {
        this.allFilms = films;
        this.characters = characters.sort((a, b) => a.name.localeCompare(b.name));

        if (!this.selectedCharacter && this.characters.length > 0) {
          this.selectedCharacter = this.characters[0].url;
        }

        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Falha ao carregar os filmes e personagens da SWAPI.';
        this.loading = false;
      }
    });
  }

  private applyFilters(): void {
    let nextFilms = [...this.allFilms];

    if (this.selectedFilter === 'release') {
      nextFilms.sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());
    }

    if (this.selectedFilter === 'chronological') {
      nextFilms.sort((a, b) => a.episode_id - b.episode_id);
    }

    if (this.selectedFilter === 'character' && this.selectedCharacter) {
      nextFilms = nextFilms.filter((film) => film.characters.includes(this.selectedCharacter));
      nextFilms.sort((a, b) => a.episode_id - b.episode_id);
    }

    this.films = this.recommendationService.filterFilmsByTitle(nextFilms, this.searchTerm);
  }

  private getPosterUrls(film: Film): string[] {
    if (film.posterUrls && film.posterUrls.length > 0) {
      return film.posterUrls;
    }

    return film.posterUrl ? [film.posterUrl] : [];
  }
}
