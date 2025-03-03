import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterFilterComponent } from './character-filter.component';
import { provideHttpClient, withFetch } from '@angular/common/http';

describe('CharacterFilterComponent', () => {
  let component: CharacterFilterComponent;
  let fixture: ComponentFixture<CharacterFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterFilterComponent],
      providers: [
        provideHttpClient(withFetch()),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
