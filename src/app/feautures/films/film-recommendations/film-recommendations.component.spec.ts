import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilmRecommendationsComponent } from './film-recommendations.component';
import { provideHttpClient, withFetch } from '@angular/common/http';

describe('FilmRecommendationsComponent', () => {
  let component: FilmRecommendationsComponent;
  let fixture: ComponentFixture<FilmRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilmRecommendationsComponent],
      providers: [
        provideHttpClient(withFetch()),
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
