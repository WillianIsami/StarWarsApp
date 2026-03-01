import { Component, EventEmitter, Input, Output } from '@angular/core';

interface GenderOption {
  label: string;
  value: string;
  hint: string;
}

@Component({
  selector: 'app-character-filter',
  standalone: true,
  imports: [],
  templateUrl: './character-filter.component.html',
  styleUrl: './character-filter.component.scss',
})
export class CharacterFilterComponent {
  @Input() selectedGender = 'all';
  @Output() genderChanged = new EventEmitter<string>();

  readonly genderOptions: GenderOption[] = [
    { label: 'All', value: 'all', hint: 'Sem restricoes' },
    { label: 'Male', value: 'male', hint: 'Cadastros masculinos' },
    { label: 'Female', value: 'female', hint: 'Cadastros femininos' },
    { label: 'Unknown', value: 'n/a', hint: 'Sem dados confiaveis' }
  ];

  onGenderFilter(gender: string): void {
    this.genderChanged.emit(gender);
  }
}
