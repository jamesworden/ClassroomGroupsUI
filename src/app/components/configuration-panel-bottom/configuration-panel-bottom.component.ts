import { Component, computed, inject, input } from '@angular/core';
import { ClassroomsService } from '@shared/classrooms';
import { StudentListComponent } from '../student-list/student-list.component';

@Component({
  selector: 'app-configuration-panel-bottom',
  standalone: true,
  imports: [StudentListComponent],
  templateUrl: './configuration-panel-bottom.component.html',
  styleUrl: './configuration-panel-bottom.component.scss',
})
export class ConfigurationPanelBottomComponent {
  readonly #classroomsService = inject(ClassroomsService);

  readonly classroomId = input<string>();
  readonly configurationId = input<string>();

  readonly defaultGroup = computed(() =>
    this.#classroomsService.select.defaultGroup(this.configurationId())()
  );
}
