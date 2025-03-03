import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { expand, filter, map, reduce, takeWhile, tap } from 'rxjs/operators';
import { Character, CharacterResponse, FilmResponse, Planet, PlanetResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SwapiService {
  private base_url = 'https://swapi.dev/api';

  // In-memory cache
  private cache: { [key: string]: any } = {};
  page = 1;

  constructor(private http: HttpClient) { }

  getAllCharacters(): Observable<Character[]> {
    const cacheKey = 'allCharacters';
    if (this.cache[cacheKey]) {
      return of(this.cache[cacheKey]);
    }
    return this.getCharactersPage(`${this.base_url}/people/?page=1`).pipe(
      expand(response => response.next ? this.getCharactersPage(response.next) : of(null)),
      takeWhile(response => response !== null),
      reduce((acc, response) => [...acc, ...response.results], [] as Character[]),
      tap(allCharacters => this.cache[cacheKey] = allCharacters)
    );
  }

  private getCharactersPage(url: string): Observable<CharacterResponse> {
    return this.http.get<CharacterResponse>(url);
  }

  getCharacter(id: string): Observable<Character> {
    const cacheKey = `character-${id}`;
    if (this.cache[cacheKey]) {
      return of(this.cache[cacheKey]);
    }

    return this.http.get<Character>(`${this.base_url}/people/${id}/`).pipe(
      tap(character => this.cache[cacheKey] = character)
    );
  }

  getFilms(): Observable<FilmResponse> {
    const cacheKey = 'films';
    if (this.cache[cacheKey]) {
      return of(this.cache[cacheKey]);
    }

    return this.http.get<FilmResponse>(`${this.base_url}/films/`).pipe(
      tap(films => this.cache[cacheKey] = films)
    );
  }

  getAllPlanets(): Observable<Planet[]> {
    const cacheKey = 'planets';
    if (this.cache[cacheKey]) {
      return of(this.cache[cacheKey]);
    }
    return this.getPlanetsPage(`${this.base_url}/planets/?page=1`).pipe(
      expand(response => response.next ? this.getPlanetsPage(response.next) : of(null)),
      takeWhile(response => response !== null),
      filter(response => response !== null),
      reduce((acc, response) => [...acc, ...response.results], [] as Planet[]),
      tap(allPlanets => this.cache[cacheKey] = allPlanets),
      tap(planets => planets.sort((a, b) => b.residents.length - a.residents.length))
    );
}

  private getPlanetsPage(url: string): Observable<PlanetResponse> {
    return this.http.get<PlanetResponse>(url);
  }

  getNamesFromUrls(urls: string[]): Observable<string[]> {
    if (!urls || urls.length === 0) {
      return new Observable((observer) => {
        observer.next([]);
        observer.complete();
      });
    }
    const requests = urls.map(url => this.http.get<{ name: string, title: string }>(url));
    return forkJoin(requests).pipe(
      map(responses => responses.map(response => response.name || response.title))
    );
  }

  getHomeworldName(url: string): Observable<any> {
    return this.http.get<any>(url);
  }
}
