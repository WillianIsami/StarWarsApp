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
    return this.swapiService.getFilms().pipe(
      map((response) =>
        response.results.map((film: any) => ({
          title: film.title,
          episode_id: film.episode_id,
          release_date: film.release_date,
          characters: film.characters,
        }))
      )
    );
  }

  getFilmsByReleaseOrder(): Observable<Film[]> {
    return this.getAllFilms().pipe(
      map((films) =>
        films.sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime())
      )
    );
  }

  getFilmsByChronologicalOrder(): Observable<Film[]> {
    return this.getAllFilms().pipe(
      map((films) => films.sort((a, b) => a.episode_id - b.episode_id))
    );
  }

  getFilmsByCharacter(characterUrl: string): Observable<Film[]> {
    return this.getAllFilms().pipe(
      map((films) =>
        films.filter((film) => film.characters.includes(characterUrl))
      )
    );
  }
}
