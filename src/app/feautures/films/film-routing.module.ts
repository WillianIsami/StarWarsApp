import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FilmRecommendationsComponent } from './film-recommendations/film-recommendations.component';

const routes: Routes = [
  {
    path: "",
    component: FilmRecommendationsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilmRoutingModule { }
