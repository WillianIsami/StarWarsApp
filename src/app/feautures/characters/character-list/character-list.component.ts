import { AfterViewInit, Component, ElementRef, HostListener, NgZone, ViewChild } from '@angular/core';
import { SwapiService } from '../../../core/services';
import { Character } from '../../../core/models';
import { Subject, takeUntil } from 'rxjs';
import { CharacterDetailsComponent } from '../character-details/character-details.component';
import { CharacterFilterComponent } from '../character-filter/character-filter.component';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [
    CharacterDetailsComponent,
    CharacterFilterComponent,
  ],
  templateUrl: './character-list.component.html',
  styleUrl: './character-list.component.scss'
})
export class CharacterListComponent implements AfterViewInit {
  @ViewChild('observerTarget') observerTarget: ElementRef | undefined;

  constructor(
    private swapiService: SwapiService,
  ) {}

  allCharacters: Character[] = [];
  filteredCharacters: Character[] = [];
  characters: Character[] = [];
  batchSize = 10;
  currentBatch = 0;
  loading = false;
  error = '';
  selectedGender = 'all';
  selectedCharacter: any = null;
  private destroy$ = new Subject<void>();
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    this.loadCharacters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.observer) {
      this.observer.disconnect();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setupIntersectionObserver();
    }, 0);
  }

  checkInitialLoad(): void {
    requestAnimationFrame(() => {
      const contentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;

      if (contentHeight <= viewportHeight + 100 && this.characters.length < this.allCharacters.length) {
        this.loadNextPage();
      }
    });
  }

  setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !this.loading) {
        this.loadNextPage();
      }
    }, options);

    if (this.observerTarget) {
      this.observer.observe(this.observerTarget.nativeElement);
    }
  }

  loadCharacters(reset: boolean = true): void {
    this.loading = true;

    this.swapiService.getAllCharacters()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (characters: Character[]) => {
          this.allCharacters = characters;
          this.applyGenderFilter();
          this.loading = false;

          if (!this.observer && this.observerTarget) {
            this.setupIntersectionObserver();
          }

          // Check if we need to load more content after a short delay
          // This allows the DOM to update with the new content first
          setTimeout(() => {
            this.checkInitialLoad();
          }, 300);
        },
        error: (e) => {
          this.error = 'Failed to load characters. Please try again.';
          this.loading = false;
        },
      });
  }

  applyGenderFilter(): void {
    if (this.selectedGender === 'all') {
      this.filteredCharacters = [...this.allCharacters];
    } else {
      this.filteredCharacters = this.allCharacters.filter(c => c.gender.toLowerCase() === this.selectedGender);
    }

    this.characters = this.filteredCharacters.slice(0, this.batchSize);
    this.currentBatch = 1;

    setTimeout(() => {
      this.checkInitialLoad();
    }, 300);
  }

  loadNextPage(): void {
    if (this.loading) return;

    const startIndex = this.currentBatch * this.batchSize;
    const nextBatch = this.filteredCharacters.slice(startIndex, startIndex + this.batchSize);

    if (nextBatch.length > 0) {
      this.characters = [...this.characters, ...nextBatch];
      this.currentBatch++;

      setTimeout(() => {
        this.checkInitialLoad();
      }, 300);
    }
  }

  onGenderFilter(gender: string): void {
    this.selectedGender = gender;
    this.applyGenderFilter();
  }

  viewCharacterDetails(character: any) {
    this.selectedCharacter = character;
  }

  closeCharacterDetails() {
    this.selectedCharacter = null;
  }
}
