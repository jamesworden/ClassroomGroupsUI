import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { ColumnDetail } from '@shared/classrooms';
import { ViewingBy } from '../configuration-visualize.service';

@Component({
  selector: 'app-controls-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    FormsModule,
  ],
  styleUrl: './controls-panel.component.scss',
  template: `
    <div class="flex gap-3 flex-1 justify-end mt-1">
      <!-- View By Dropdown -->
      <div class="w-64">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>View By</mat-label>
          <mat-select
            [value]="viewingBy()"
            (selectionChange)="viewingByChange.emit($event.value)"
          >
            <!-- Custom display template for the selection value -->
            <mat-select-trigger>
              <div class="flex items-center">
                <mat-icon
                  *ngIf="viewingBy() === ViewingBy.Students"
                  class="mr-2 selected-option-icon"
                  >person</mat-icon
                >
                <mat-icon
                  *ngIf="viewingBy() === ViewingBy.Groups"
                  class="mr-2 selected-option-icon"
                  >groups</mat-icon
                >
                <span>{{
                  viewingBy() === ViewingBy.Students ? 'Students' : 'Groups'
                }}</span>
              </div>
            </mat-select-trigger>

            <!-- Options in the dropdown -->
            <mat-option [value]="ViewingBy.Students">
              <div class="flex items-center">
                <mat-icon class="mr-2 text-md">person</mat-icon>
                <span>Students</span>
              </div>
            </mat-option>
            <mat-option [value]="ViewingBy.Groups">
              <div class="flex items-center">
                <mat-icon class="mr-2 text-md">groups</mat-icon>
                <span>Groups</span>
              </div>
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Score Dropdown -->
      <div class="w-64">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Score</mat-label>
          <mat-select
            [value]="selectedColumn()"
            (selectionChange)="selectedColumnChange.emit($event.value)"
          >
            <!-- Custom display template for the selection value -->
            <mat-select-trigger>
              <div class="flex items-center">
                @if (selectedColumn() === 'average') {
                  <mat-icon class="mr-2 selected-option-icon"
                    >ssid_chart</mat-icon
                  >
                } @else {
                  <mat-icon class="mr-2 selected-option-icon"
                    >assignment</mat-icon
                  >
                }
                <span>{{ selectedColumnLabel() }}</span>
              </div>
            </mat-select-trigger>

            <!-- Options -->
            <mat-option value="average">
              <div class="flex items-center">
                <mat-icon class="mr-2 selected-option-icon"
                  >ssid_chart</mat-icon
                >
                <span>Average Score</span>
              </div>
            </mat-option>
            @for (column of numericColumns(); track column.id) {
              <mat-option [value]="column.fieldId">
                <div class="flex items-center">
                  <mat-icon class="mr-2 selected-option-icon"
                    >assignment</mat-icon
                  >
                  <span>{{ column.label }}</span>
                </div>
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    </div>
  `,
})
export class ControlsPanelComponent {
  readonly viewingBy = input.required<ViewingBy>();
  readonly selectedColumn = input.required<string | 'average'>();
  readonly selectedColumnLabel = input.required<string>();
  readonly numericColumns = input.required<ColumnDetail[]>();

  readonly viewingByChange = output<ViewingBy>();
  readonly selectedColumnChange = output<string | 'average'>();

  readonly ViewingBy = ViewingBy;
}
