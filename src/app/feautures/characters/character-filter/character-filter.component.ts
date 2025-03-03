import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-character-filter',
  standalone: true,
  imports: [],
  templateUrl: './character-filter.component.html',
  styleUrl: './character-filter.component.scss'
})
export class CharacterFilterComponent {
  @Input() selectedGender: string = 'all';
  @Output() genderChanged = new EventEmitter<string>();

  genderOptions = [
    { label: 'All', value: 'all' },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Unknown', value: 'n/a' }
  ];

  onGenderFilter(gender: string) {
    this.genderChanged.emit(gender);
  }
}
