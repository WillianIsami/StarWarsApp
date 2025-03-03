import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface NavRoute {
  path: string;
  label: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
  constructor(private router: Router) {}

  menuOpen = false;

  allRoutes: NavRoute[] = [
    { path: '/characters', label: 'Characters' },
    { path: '/films', label: 'Films' },
    { path: '/planets', label: 'Planets' },
  ]

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
