import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { ChartType } from 'chart.js';

import { ConfigurationDetail } from '@shared/classrooms';

@Component({
  selector: 'app-configuration-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonToggleModule, MatChipsModule],
  template: `
    <div class="px-4 pt-4 flex flex-col">
      <div class="flex justify-between items-center mb-2">
        <!-- Configuration title and description -->
        <div class="flex-shrink flex-grow overflow-hidden mr-4">
          <div class="flex flex-col justify-around">
            <div class="overflow-hidden">
              <h3
                class="text-2xl overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {{ configurationDetail().label }}
              </h3>
              <h4
                class="text-sm opacity-80 overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {{ configurationDetail().description }}
              </h4>
            </div>
          </div>
        </div>

        <!-- Chart Type Toggle -->
        <div class="flex gap-x-2 flex-shrink-0">
          <div class="flex flex-col justify-around">
            <mat-chip-listbox [multiple]="true" class="mr-3">
              <mat-chip-option
                class="border border-zinc-400 dark:border-zinc-600"
                [selected]="showUngroupedStudents()"
                (click)="toggleShowUngroupedStudents()"
              >
                Ungrouped students
              </mat-chip-option>
            </mat-chip-listbox>
          </div>

          <mat-button-toggle-group
            [value]="chartType"
            (change)="chartTypeChange.emit($event.value)"
            aria-label="Chart Type"
            class="border border-zinc-400 dark:border-zinc-600"
          >
            <mat-button-toggle value="bar">
              <mat-icon class="text-md">bar_chart</mat-icon>
              <span class="text-sm hidden sm:inline ml-1">Bar</span>
            </mat-button-toggle>
            <mat-button-toggle value="line">
              <mat-icon class="text-md">show_chart</mat-icon>
              <span class="text-sm hidden sm:inline ml-1">Line</span>
            </mat-button-toggle>
            <mat-button-toggle value="radar">
              <mat-icon class="text-md">radar</mat-icon>
              <span class="text-sm hidden sm:inline ml-1">Radar</span>
            </mat-button-toggle>
          </mat-button-toggle-group>
        </div>
      </div>
    </div>
  `,
})
export class ConfigurationHeaderComponent {
  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly chartType = input.required<ChartType>();
  readonly showUngroupedStudents = input.required<boolean>();

  readonly chartTypeChange = output<ChartType>();
  readonly showUngroupedStudentsChange = output<boolean>();

  toggleShowUngroupedStudents() {
    this.showUngroupedStudentsChange.emit(!this.showUngroupedStudents());
  }
}
