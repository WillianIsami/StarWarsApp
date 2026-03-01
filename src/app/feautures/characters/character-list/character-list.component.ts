import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Character } from '../../../core/models';
import { SwapiService } from '../../../core/services';
import { CharacterDetailsComponent } from '../character-details/character-details.component';
import { CharacterFilterComponent } from '../character-filter/character-filter.component';

type CharacterSort = 'name' | 'birthYear' | 'height' | 'mass';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [FormsModule, CharacterDetailsComponent, CharacterFilterComponent],
  templateUrl: './character-list.component.html',
  styleUrl: './character-list.component.scss',
})
export class CharacterListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('observerTarget') observerTarget?: ElementRef<HTMLDivElement>;

  allCharacters: Character[] = [];
  filteredCharacters: Character[] = [];
  characters: Character[] = [];

  readonly batchSize = 12;
  currentBatch = 0;

  loading = false;
  error = '';

  selectedGender = 'all';
  selectedSort: CharacterSort = 'name';
  searchTerm = '';

  selectedCharacter: Character | null = null;

  private readonly imageAttemptByResource = new Map<string, number>();

  private observer: IntersectionObserver | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(private swapiService: SwapiService) { }

  get totalCharacters(): number {
    return this.allCharacters.length;
  }

  get visibleCharactersCount(): number {
    return this.characters.length;
  }

  get maleCount(): number {
    return this.allCharacters.filter((character) => character.gender.toLowerCase() === 'male').length;
  }

  get femaleCount(): number {
    return this.allCharacters.filter((character) => character.gender.toLowerCase() === 'female').length;
  }

  get unknownCount(): number {
    return this.allCharacters.filter((character) => character.gender.toLowerCase() === 'n/a').length;
  }

  ngOnInit(): void {
    this.loadCharacters();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setupIntersectionObserver();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.observer?.disconnect();
  }

  loadCharacters(): void {
    this.loading = true;
    this.error = '';

    this.swapiService
      .getAllCharacters()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (characters) => {
          this.allCharacters = characters;
          this.applyFilters();
          this.loading = false;
        },
        error: () => {
          this.error = 'Falha ao carregar personagens. Tente novamente em alguns instantes.';
          this.loading = false;
        }
      });
  }

  onGenderFilter(gender: string): void {
    this.selectedGender = gender;
    this.applyFilters();
  }

  onSearchTermChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  onSortChange(sort: CharacterSort): void {
    this.selectedSort = sort;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedGender = 'all';
    this.selectedSort = 'name';
    this.applyFilters();
  }

  loadNextPage(): void {
    if (this.loading) {
      return;
    }

    const startIndex = this.currentBatch * this.batchSize;
    const nextBatch = this.filteredCharacters.slice(startIndex, startIndex + this.batchSize);

    if (nextBatch.length === 0) {
      return;
    }

    this.characters = [...this.characters, ...nextBatch];
    this.currentBatch += 1;

    setTimeout(() => this.checkInitialLoad(), 120);
  }

  viewCharacterDetails(character: Character): void {
    this.selectedCharacter = character;
  }

  closeCharacterDetails(): void {
    this.selectedCharacter = null;
  }

  onImageError(character: Character): void {
    const urls = this.getCharacterImageUrls(character);
    const currentAttempt = this.imageAttemptByResource.get(character.url) ?? 0;
    const nextAttempt = currentAttempt + 1;

    if (nextAttempt < urls.length) {
      this.imageAttemptByResource.set(character.url, nextAttempt);
      return;
    }

    this.imageAttemptByResource.set(character.url, Number.MAX_SAFE_INTEGER);
  }

  hasCharacterImage(character: Character): boolean {
    return Boolean(this.getCharacterImage(character));
  }

  getCharacterImage(character: Character): string | null {
    const urls = this.getCharacterImageUrls(character);
    const imageAttempt = this.imageAttemptByResource.get(character.url) ?? 0;

    return urls[imageAttempt] ?? null;
  }

  trackByCharacter(_: number, character: Character): string {
    return character.url;
  }

  private applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    let filtered = [...this.allCharacters];

    if (this.selectedGender !== 'all') {
      filtered = filtered.filter((character) => character.gender.toLowerCase() === this.selectedGender);
    }

    if (normalizedSearch) {
      filtered = filtered.filter((character) => character.name.toLowerCase().includes(normalizedSearch));
    }

    this.filteredCharacters = this.sortCharacters(filtered);
    this.characters = this.filteredCharacters.slice(0, this.batchSize);
    this.currentBatch = this.characters.length > 0 ? 1 : 0;

    setTimeout(() => this.checkInitialLoad(), 120);
  }

  private sortCharacters(characters: Character[]): Character[] {
    const sorted = [...characters];

    switch (this.selectedSort) {
      case 'birthYear':
        return sorted.sort((a, b) => a.birth_year.localeCompare(b.birth_year));

      case 'height':
        return sorted.sort((a, b) => this.parseNumericValue(b.height) - this.parseNumericValue(a.height));

      case 'mass':
        return sorted.sort((a, b) => this.parseNumericValue(b.mass) - this.parseNumericValue(a.mass));

      case 'name':
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  private parseNumericValue(rawValue: string): number {
    const normalizedValue = Number(rawValue.replace(',', ''));
    return Number.isFinite(normalizedValue) ? normalizedValue : -1;
  }

  private getCharacterImageUrls(character: Character): string[] {
    if (character.imageUrls && character.imageUrls.length > 0) {
      return character.imageUrls;
    }

    return character.imageUrl ? [character.imageUrl] : [];
  }

  private setupIntersectionObserver(): void {
    if (!this.observerTarget || this.observer) {
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !this.loading) {
        this.loadNextPage();
      }
    }, {
      root: null,
      threshold: 0.1
    });

    this.observer.observe(this.observerTarget.nativeElement);
  }

  private checkInitialLoad(): void {
    requestAnimationFrame(() => {
      const contentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const hasMoreCharacters = this.characters.length < this.filteredCharacters.length;

      if (hasMoreCharacters && contentHeight <= viewportHeight + 100) {
        this.loadNextPage();
      }
    });
  }
}
