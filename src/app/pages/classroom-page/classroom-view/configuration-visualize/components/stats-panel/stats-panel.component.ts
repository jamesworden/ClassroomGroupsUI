import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentDetail } from '@shared/classrooms';
import { StatsCardComponent } from './stats-card.component';
import { ViewingBy } from '../../configuration-visualize.service';

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  imports: [CommonModule, StatsCardComponent],
  template: `
    <div class="flex gap-3 mt-1 flex-1">
      <!-- Students Stat Card -->
      <app-stats-card
        [label]="'Students'"
        [value]="showingStudentDetails().length"
        [icon]="'person'"
        [backgroundColor]="'bg-blue-100 dark:bg-blue-900/30'"
        [iconColor]="'text-blue-700 dark:text-blue-500'"
      ></app-stats-card>

      <!-- Groups Stat Card -->
      <app-stats-card
        [label]="'Groups'"
        [value]="allGroupDetails().length"
        [icon]="'groups'"
        [backgroundColor]="'bg-purple-100 dark:bg-purple-900/30'"
        [iconColor]="'text-purple-700 dark:text-purple-500'"
      ></app-stats-card>

      <!-- Average Stat Card -->
      <app-stats-card
        [label]="averageLabel()"
        [value]="formattedAverageScore()"
        [icon]="'trending_up'"
        [backgroundColor]="'bg-green-100 dark:bg-green-900/30'"
        [iconColor]="'text-green-700 dark:text-green-500'"
      ></app-stats-card>
    </div>
  `,
})
export class StatsPanelComponent {
  readonly viewingBy = input.required<ViewingBy>();
  readonly showingStudentDetails = input.required<StudentDetail[]>();
  readonly allGroupDetails = input.required<any[]>();
  readonly averageScore = input.required<number>();

  readonly ViewingBy = ViewingBy;

  readonly averageLabel = computed(() =>
    this.viewingBy() === ViewingBy.Groups ? 'Group Avg' : 'Student Avg'
  );

  readonly formattedAverageScore = computed(
    () => `${this.averageScore().toFixed(1)}%`
  );
}
