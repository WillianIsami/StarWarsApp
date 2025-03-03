import { Component, OnInit } from '@angular/core';
import { SwapiService } from '../../../core/services';

@Component({
  selector: 'app-planet-list',
  templateUrl: './planet-list.component.html',
  styleUrls: ['./planet-list.component.scss']
})
export class PlanetListComponent implements OnInit {
  planets: any[] = [];

  constructor(private swapiService: SwapiService) {}

  ngOnInit(): void {
    this.swapiService.getAllPlanets()
      .subscribe(data => this.planets = data);
  }
}
