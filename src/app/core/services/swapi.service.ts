import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';
import { expand, finalize, map, reduce, shareReplay, tap } from 'rxjs/operators';
import {
  Character,
  CharacterResponse,
  Film,
  FilmResponse,
  Planet,
  PlanetResponse
} from '../models';

interface NamedResourceResponse {
  name?: string;
  title?: string;
}

type ImageResource = 'characters' | 'planets' | 'films';

@Injectable({
  providedIn: 'root'
})
export class SwapiService {
  private readonly baseUrl = 'https://swapi.dev/api';
  private readonly visualGuideBaseUrl = 'https://starwars-visualguide.com/assets/img';
  private readonly starWarsGuideCdnBaseUrl = 'https://cdn.jsdelivr.net/gh/tbone849/star-wars-guide@master/build/assets/img';
  private readonly starWarsGuideRawBaseUrl = 'https://raw.githubusercontent.com/tbone849/star-wars-guide/master/build/assets/img';

  // Finished payload cache and in-flight request cache.
  private readonly dataCache = new Map<string, unknown>();
  private readonly requestCache = new Map<string, Observable<unknown>>();

  private readonly resourceNameCache = new Map<string, string>();
  private readonly resourceNameRequestCache = new Map<string, Observable<string>>();

  constructor(private http: HttpClient) { }

  getAllCharacters(): Observable<Character[]> {
    return this.cachedRequest('allCharacters', () =>
      this.getCharactersPage(`${this.baseUrl}/people/?page=1`).pipe(
        expand((response) => response.next ? this.getCharactersPage(response.next) : EMPTY),
        reduce((allCharacters, response) => {
          const nextCharacters = response.results.map((character) => this.mapCharacterData(character));
          return [...allCharacters, ...nextCharacters];
        }, [] as Character[])
      )
    );
  }

  getCharacter(id: string): Observable<Character> {
    return this.cachedRequest(`character-${id}`, () =>
      this.http
        .get<Character>(`${this.baseUrl}/people/${id}/`)
        .pipe(map((character) => this.mapCharacterData(character)))
    );
  }

  getFilms(): Observable<FilmResponse> {
    return this.cachedRequest('films', () =>
      this.http.get<FilmResponse>(`${this.baseUrl}/films/`).pipe(
        map((response) => ({
          ...response,
          results: response.results.map((film) => this.mapFilmData(film))
        }))
      )
    );
  }

  getAllPlanets(): Observable<Planet[]> {
    return this.cachedRequest('allPlanets', () =>
      this.getPlanetsPage(`${this.baseUrl}/planets/?page=1`).pipe(
        expand((response) => response.next ? this.getPlanetsPage(response.next) : EMPTY),
        reduce((allPlanets, response) => {
          const nextPlanets = response.results.map((planet) => this.mapPlanetData(planet));
          return [...allPlanets, ...nextPlanets];
        }, [] as Planet[]),
        map((planets) => planets.sort((a, b) => b.residents.length - a.residents.length))
      )
    );
  }

  getNamesFromUrls(urls: string[]): Observable<string[]> {
    if (!urls || urls.length === 0) {
      return of([]);
    }

    return forkJoin(urls.map((url) => this.getNameFromUrl(url)));
  }

  getHomeworldName(url: string): Observable<{ name: string }> {
    if (!url) {
      return of({ name: 'Unknown' });
    }

    return this.http.get<{ name?: string }>(this.normalizeApiUrl(url)).pipe(
      map((response) => ({ name: response.name ?? 'Unknown' }))
    );
  }

  getResourceId(url: string): number | null {
    if (!url) {
      return null;
    }

    const match = url.match(/\/(\d+)\/?$/);
    if (!match) {
      return null;
    }

    return Number(match[1]);
  }

  getImageCandidates(resource: ImageResource, source: string | number): string[] {
    const id = typeof source === 'number' ? source : this.getResourceId(source);

    if (!id || Number.isNaN(id)) {
      return [];
    }

    const candidates = [
      `${this.starWarsGuideCdnBaseUrl}/${resource}/${id}.jpg`,
      `${this.starWarsGuideRawBaseUrl}/${resource}/${id}.jpg`,
      `${this.visualGuideBaseUrl}/${resource}/${id}.jpg`
    ];

    return Array.from(new Set(candidates));
  }

  private getCharactersPage(url: string): Observable<CharacterResponse> {
    return this.http.get<CharacterResponse>(this.normalizeApiUrl(url));
  }

  private getPlanetsPage(url: string): Observable<PlanetResponse> {
    return this.http.get<PlanetResponse>(this.normalizeApiUrl(url));
  }

  private getNameFromUrl(url: string): Observable<string> {
    const normalizedUrl = this.normalizeApiUrl(url);
    const cachedName = this.resourceNameCache.get(normalizedUrl);
    if (cachedName) {
      return of(cachedName);
    }

    const inFlightRequest = this.resourceNameRequestCache.get(normalizedUrl);
    if (inFlightRequest) {
      return inFlightRequest;
    }

    const request$ = this.http.get<NamedResourceResponse>(normalizedUrl).pipe(
      map((resource) => resource.name ?? resource.title ?? 'Unknown'),
      tap((resourceName) => this.resourceNameCache.set(normalizedUrl, resourceName)),
      finalize(() => this.resourceNameRequestCache.delete(normalizedUrl)),
      shareReplay(1)
    );

    this.resourceNameRequestCache.set(normalizedUrl, request$);
    return request$;
  }

  private mapCharacterData(character: Character): Character {
    const id = this.getResourceId(character.url) ?? undefined;
    const imageUrls = id ? this.getImageCandidates('characters', id) : [];

    return {
      ...character,
      id,
      imageUrls,
      imageUrl: imageUrls[0] ?? null
    };
  }

  private mapFilmData(film: Film): Film {
    const id = this.getResourceId(film.url) ?? undefined;
    const posterUrls = id ? this.getImageCandidates('films', id) : [];

    return {
      ...film,
      id,
      posterUrls,
      posterUrl: posterUrls[0] ?? null
    };
  }

  private mapPlanetData(planet: Planet): Planet {
    const id = this.getResourceId(planet.url) ?? undefined;
    const imageUrls = id ? this.getImageCandidates('planets', id) : [];

    return {
      ...planet,
      id,
      imageUrls,
      imageUrl: imageUrls[0] ?? null
    };
  }

  private cachedRequest<T>(key: string, fetchRequest: () => Observable<T>): Observable<T> {
    if (this.dataCache.has(key)) {
      return of(this.dataCache.get(key) as T);
    }

    const requestInFlight = this.requestCache.get(key) as Observable<T> | undefined;
    if (requestInFlight) {
      return requestInFlight;
    }

    const request$ = fetchRequest().pipe(
      tap((response) => this.dataCache.set(key, response)),
      finalize(() => this.requestCache.delete(key)),
      shareReplay(1)
    );

    this.requestCache.set(key, request$ as Observable<unknown>);
    return request$;
  }

  private normalizeApiUrl(url: string): string {
    return url.replace(/^http:\/\//i, 'https://');
  }
}
