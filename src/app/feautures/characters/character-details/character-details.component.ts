import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import { catchError, finalize, forkJoin, of, Subscription } from 'rxjs';
import { Character } from '../../../core/models';
import { SwapiService } from '../../../core/services';

@Component({
  selector: 'app-character-details',
  standalone: true,
  templateUrl: './character-details.component.html',
  styleUrls: ['./character-details.component.scss'],
})
export class CharacterDetailsComponent implements OnChanges, OnDestroy {
  @Input() character: Character | null = null;
  @Output() close = new EventEmitter<void>();

  detailsLoading = false;
  loadError = '';

  homeworldName = 'Unknown';
  filmNames: string[] = [];
  speciesNames: string[] = [];
  vehicleNames: string[] = [];
  starshipNames: string[] = [];

  private detailsSubscription?: Subscription;

  constructor(private swapiService: SwapiService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['character']) {
      return;
    }

    this.resetViewState();

    if (this.character) {
      this.loadCharacterDetails(this.character);
    }
  }

  ngOnDestroy(): void {
    this.detailsSubscription?.unsubscribe();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.character) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  private loadCharacterDetails(character: Character): void {
    this.detailsSubscription?.unsubscribe();
    this.detailsLoading = true;

    this.detailsSubscription = forkJoin({
      filmNames: this.safeNamesRequest(character.films),
      speciesNames: this.safeNamesRequest(character.species),
      vehicleNames: this.safeNamesRequest(character.vehicles),
      starshipNames: this.safeNamesRequest(character.starships),
      homeworldName: this.swapiService.getHomeworldName(character.homeworld).pipe(
        catchError(() => of({ name: 'Unknown' }))
      )
    })
      .pipe(
        finalize(() => {
          this.detailsLoading = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.filmNames = result.filmNames;
          this.speciesNames = result.speciesNames;
          this.vehicleNames = result.vehicleNames;
          this.starshipNames = result.starshipNames;
          this.homeworldName = result.homeworldName.name;
        },
        error: () => {
          this.loadError = 'Nao foi possivel carregar os detalhes relacionados.';
        }
      });
  }

  private safeNamesRequest(urls: string[]): ReturnType<SwapiService['getNamesFromUrls']> {
    return this.swapiService.getNamesFromUrls(urls).pipe(catchError(() => of([])));
  }

  private resetViewState(): void {
    this.loadError = '';
    this.homeworldName = 'Unknown';
    this.filmNames = [];
    this.speciesNames = [];
    this.vehicleNames = [];
    this.starshipNames = [];
  }
}
