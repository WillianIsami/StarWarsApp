import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "characters"
  },
  {
    path: "characters",
    loadChildren: () =>
      import('./feautures/characters/character-routing.module').then(m => m.CharacterRoutingModule)
  },
  {
    path: "films",
    loadChildren: () =>
      import('./feautures/films/film-routing.module').then(m => m.FilmRoutingModule)
  },
  {
    path: "planets",
    loadChildren: () =>
      import('./feautures/planets/planet-routing.module').then(m => m.PlanetRoutingModule)
  },
];
