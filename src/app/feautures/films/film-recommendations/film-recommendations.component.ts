import { Component, OnInit } from '@angular/core';
import { Film } from '../../../core/models';
import { RecommendationService, SwapiService } from '../../../core/services';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-film-recommendations',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './film-recommendations.component.html',
  styleUrl: './film-recommendations.component.scss'
})
export class FilmRecommendationsComponent implements OnInit {
  films: Film[] = [];
  selectedFilter = 'release';
  characters: any[] = [];
  selectedCharacter: string = '';

  constructor(
    private recommendationService: RecommendationService,
    private swapiService: SwapiService
  ) {}

  ngOnInit(): void {
    this.loadFilms();
    this.loadCharacters();
  }

  loadFilms(): void {
    if (this.selectedFilter === 'release') {
      this.recommendationService.getFilmsByReleaseOrder().subscribe((films) => {
        this.films = films;
      });
    } else if (this.selectedFilter === 'chronological') {
      this.recommendationService.getFilmsByChronologicalOrder().subscribe((films) => {
        this.films = films;
      });
    } else if (this.selectedFilter === 'character' && this.selectedCharacter) {
      this.recommendationService.getFilmsByCharacter(this.selectedCharacter).subscribe((films) => {
        this.films = films;
      });
    }
  }

  loadCharacters(): void {
    this.swapiService.getAllCharacters().subscribe((response) => {
      this.characters = response;
    });
  }

  onFilterChange(): void {
    this.loadFilms();
  }
}
