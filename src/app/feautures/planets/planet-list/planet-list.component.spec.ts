import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanetListComponent } from './planet-list.component';
import { of } from 'rxjs';
import { SwapiService } from '../../../core/services';

describe('PlanetListComponent', () => {
  let component: PlanetListComponent;
  let fixture: ComponentFixture<PlanetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanetListComponent],
      providers: [
        {
          provide: SwapiService,
          useValue: {
            getAllPlanets: () => of([])
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
