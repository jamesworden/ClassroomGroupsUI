import { Component, computed, inject, input, output } from '@angular/core';
import { ClassroomsService } from '@shared/classrooms';
import { StudentListComponent } from '../student-list/student-list.component';
import { calculateAverageScores } from 'shared/classrooms/lib/logic/calculate-average-scores';
import { CommonModule } from '@angular/common';
import { Cell } from 'app/models/cell';

@Component({
  selector: 'app-configuration-panel-bottom',
  standalone: true,
  imports: [StudentListComponent, CommonModule],
  templateUrl: './configuration-panel-bottom.component.html',
  styleUrl: './configuration-panel-bottom.component.scss',
})
export class ConfigurationPanelBottomComponent {
  readonly #classroomsService = inject(ClassroomsService);

  readonly classroomId = input<string>();
  readonly configurationId = input<string>();
  readonly selectedCell = input<Cell | undefined>();

  readonly defaultGroup = computed(() =>
    this.#classroomsService.select.defaultGroup(this.configurationId())()
  );
  readonly columnDetails = computed(() =>
    this.#classroomsService.select.columnDetails(
      this.defaultGroup()?.configurationId
    )
  );
  readonly averageScores = computed(() =>
    calculateAverageScores(
      this.defaultGroup()?.studentDetails ?? [],
      this.columnDetails()
    )
  );
  readonly anyAverageScore = computed(
    () => !!Object.entries(this.averageScores()).length
  );
}
