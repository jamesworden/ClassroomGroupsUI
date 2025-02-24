import { Component, input, signal } from '@angular/core';
import { Classroom, ConfigurationDetail } from '@shared/classrooms';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-configuration-preview',
  imports: [MatChipsModule],
  templateUrl: './configuration-preview.component.html',
  styleUrl: './configuration-preview.component.scss',
})
export class ConfigurationPreviewComponent {
  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly classroom = input.required<Classroom>();

  readonly showGroupNames = signal(true);

  options = [
    { label: 'Option 1', selected: false },
    { label: 'Option 2', selected: false },
    { label: 'Option 3', selected: false },
    { label: 'Option 4', selected: false },
  ];

  toggleShowGroupNames() {
    this.showGroupNames.set(!this.showGroupNames());
  }
}
