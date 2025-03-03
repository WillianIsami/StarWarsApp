import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SwapiService } from '../../../core/services';

@Component({
  selector: 'app-character-details',
  standalone: true,
  templateUrl: './character-details.component.html',
  styleUrls: ['./character-details.component.scss']
})
export class CharacterDetailsComponent {
  @Input() character: any | null = null;
  @Output() close = new EventEmitter<void>();

  constructor(private swapiService: SwapiService) {}

  closeModal() {
    this.close.emit();
  }

  ngOnInit() {
    if (this.character) {
      this.swapiService.getNamesFromUrls(this.character.films)
        .subscribe(names => this.character.filmNames = names);

      this.swapiService.getNamesFromUrls(this.character.species)
        .subscribe(names => this.character.speciesNames = names);

      this.swapiService.getNamesFromUrls(this.character.vehicles)
        .subscribe(names => this.character.vehicleNames = names);

      this.swapiService.getNamesFromUrls(this.character.starships)
        .subscribe(names => this.character.starshipNames = names);

      this.swapiService.getHomeworldName(this.character.homeworld)
        .subscribe(response => this.character.homeworldName = response.name);
    }
  }
}
