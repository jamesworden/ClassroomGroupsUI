import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StudentDetail } from '@shared/classrooms';
import { ViewingBy } from '../configuration-visualize.service';

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex gap-3 mt-1 flex-1">
      <!-- Students Stat Card -->
      <div
        class="bg-zinc-50/80 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-600 rounded-lg h-14 px-3 py-2 flex items-center flex-1"
      >
        <div
          class="mr-2 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full flex flex-col justify-around"
        >
          <mat-icon class="text-blue-700 dark:text-blue-500 text-md"
            >person</mat-icon
          >
        </div>
        <div class="truncate">
          <div class="text-xs font-medium opacity-80">Students</div>
          <div class="text-base font-semibold">
            {{ showingStudentDetails().length }}
          </div>
        </div>
      </div>

      <!-- Groups Stat Card -->
      <div
        class="bg-zinc-50/80 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-600 rounded-lg h-14 px-3 py-2 flex items-center flex-1"
      >
        <div
          class="mr-2 bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-full flex flex-col justify-around"
        >
          <mat-icon class="text-purple-700 dark:text-purple-500 text-md"
            >groups</mat-icon
          >
        </div>
        <div class="truncate">
          <div class="text-xs font-medium opacity-80">Groups</div>
          <div class="text-base font-semibold">
            {{ allGroupDetails().length }}
          </div>
        </div>
      </div>

      <!-- Average Stat Card -->
      <div
        class="bg-zinc-50/80 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-600 rounded-lg h-14 px-3 py-2 flex items-center flex-1"
      >
        <div
          class="mr-2 bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full flex flex-col justify-around"
        >
          <mat-icon class="text-green-700 dark:text-green-500 text-md"
            >trending_up</mat-icon
          >
        </div>
        <div class="truncate">
          <div class="text-xs font-medium opacity-80">
            {{ viewingBy() === ViewingBy.Groups ? 'Group Avg' : 'Student Avg' }}
          </div>
          <div class="text-base font-semibold">
            {{ averageScore() | number: '1.1-1' }}%
          </div>
        </div>
      </div>
    </div>
  `,
})
export class StatsPanelComponent {
  readonly viewingBy = input.required<ViewingBy>();
  readonly showingStudentDetails = input.required<StudentDetail[]>();
  readonly allGroupDetails = input.required<any[]>();
  readonly averageScore = input.required<number>();

  readonly ViewingBy = ViewingBy;
}
