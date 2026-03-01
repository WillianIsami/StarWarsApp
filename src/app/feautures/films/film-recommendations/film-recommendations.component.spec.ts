import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilmRecommendationsComponent } from './film-recommendations.component';
import { of } from 'rxjs';
import { RecommendationService, SwapiService } from '../../../core/services';

describe('FilmRecommendationsComponent', () => {
  let component: FilmRecommendationsComponent;
  let fixture: ComponentFixture<FilmRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilmRecommendationsComponent],
      providers: [
        {
          provide: RecommendationService,
          useValue: {
            getAllFilms: () => of([]),
            filterFilmsByTitle: (films: unknown[]) => films
          }
        },
        {
          provide: SwapiService,
          useValue: {
            getAllCharacters: () => of([])
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilmRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
