import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterDetailsComponent } from './character-details.component';
import { of } from 'rxjs';
import { SwapiService } from '../../../core/services';

describe('CharacterDetailsComponent', () => {
  let component: CharacterDetailsComponent;
  let fixture: ComponentFixture<CharacterDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterDetailsComponent],
      providers: [
        {
          provide: SwapiService,
          useValue: {
            getNamesFromUrls: () => of([]),
            getHomeworldName: () => of({ name: 'Unknown' })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
