import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';

interface NavRoute {
  path: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  menuOpen = false;

  readonly allRoutes: NavRoute[] = [
    {
      path: '/characters',
      label: 'Characters',
      description: 'Arquivo de agentes'
    },
    {
      path: '/films',
      label: 'Films',
      description: 'Plano de maratona'
    },
    {
      path: '/planets',
      label: 'Planets',
      description: 'Inteligencia planetaria'
    }
  ];

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.menuOpen = false;
      });
  }

  get activeRouteLabel(): string {
    const route = this.allRoutes.find((item) => this.router.url.startsWith(item.path));
    return route?.label ?? 'Characters';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
