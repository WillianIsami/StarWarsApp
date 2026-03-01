import { Injectable } from '@angular/core';
import { SwapiService } from './swapi.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Film } from '../models';

@Injectable({
  providedIn: 'root',
})
export class RecommendationService {
  constructor(private swapiService: SwapiService) {}

  getAllFilms(): Observable<Film[]> {
    return this.swapiService.getFilms().pipe(map((response) => response.results));
  }

  getFilmsByReleaseOrder(): Observable<Film[]> {
    return this.getAllFilms().pipe(
      map((films) => [...films].sort((a, b) =>
        new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
      ))
    );
  }

  getFilmsByChronologicalOrder(): Observable<Film[]> {
    return this.getAllFilms().pipe(
      map((films) => [...films].sort((a, b) => a.episode_id - b.episode_id))
    );
  }

  getFilmsByCharacter(characterUrl: string): Observable<Film[]> {
    return this.getAllFilms().pipe(
      map((films) => films.filter((film) => film.characters.includes(characterUrl)))
    );
  }

  filterFilmsByTitle(films: Film[], searchTerm: string): Film[] {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) {
      return films;
    }

    return films.filter((film) => film.title.toLowerCase().includes(normalizedTerm));
  }
}
