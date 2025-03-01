import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigurationVisualizeService } from '../configuration-visualize.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatSelectionListChange } from '@angular/material/list';

@Component({
  selector: 'app-average-settings-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatListModule,
  ],
  template: `
    <div class="flex flex-col h-full w-full">
      <!-- Header - fixed height -->
      <div class="pb-4">
        <div class="flex items-center mb-4">
          <mat-icon class="mr-2 text-gray-600 dark:text-gray-300"
            >ssid_chart</mat-icon
          >
          <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200">
            Average Settings
          </h3>
        </div>

        <div class="text-sm text-gray-600 dark:text-gray-400">
          Select which assignments to include in the average calculation:
        </div>
      </div>

      <!-- Scrollable Content - this should expand -->
      <div
        class="overflow-y-auto flex-1 bg-zinc-200/80 dark:bg-zinc-900 rounded-lg"
      >
        @if (numericColumns().length > 0) {
          <mat-selection-list
            [multiple]="true"
            (selectionChange)="onSelectionChange($event)"
          >
            @for (column of numericColumns(); track column.id) {
              <mat-list-option
                [value]="column.id"
                [selected]="isColumnEnabled(column.id)"
                class="hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-colors"
              >
                {{ column.label }}
              </mat-list-option>
            }
          </mat-selection-list>
        } @else {
          <div
            class="text-sm text-gray-500 dark:text-gray-400 italic flex items-center p-4"
          >
            <mat-icon class="mr-2 text-gray-400">info</mat-icon>
            No numeric columns available
          </div>
        }
      </div>

      <!-- Footer - fixed height -->
      <div class="pt-4">
        <div class="flex flex-col gap-2">
          <button
            mat-flat-button
            color="primary"
            class="flex-1 !flex"
            (click)="selectAll(true)"
          >
            <span class="flex items-center justify-center">
              <mat-icon class="mr-1 text-sm mt-1">done_all</mat-icon>
              Select All
            </span>
          </button>
          <button
            mat-stroked-button
            class="flex-1 !flex"
            (click)="selectAll(false)"
          >
            <span class="flex items-center justify-center">
              <mat-icon class="mr-1 text-sm mt-1">close</mat-icon>
              Deselect All
            </span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
      }

      ::ng-deep .mat-selection-list {
        padding: 0;
      }

      ::ng-deep .mat-list-option {
        margin: 4px;
        border-radius: 4px;
      }
    `,
  ],
})
export class AverageSettingsControlsComponent {
  private readonly visualizeService = inject(ConfigurationVisualizeService);

  readonly numericColumns = this.visualizeService.numericColumns;
  readonly enabledColumns = this.visualizeService.enabledColumnsForAverage;

  isColumnEnabled(columnId: string): boolean {
    return this.enabledColumns().includes(columnId);
  }

  onSelectionChange(event: MatSelectionListChange): void {
    const selectedColumnIds = event.source.selectedOptions.selected.map(
      (option) => option.value as string
    );
    this.visualizeService.setEnabledColumnsForAverage(selectedColumnIds);
  }

  toggleColumn(columnId: string): void {
    const currentEnabled = [...this.enabledColumns()];

    if (this.isColumnEnabled(columnId)) {
      // Remove the column
      this.visualizeService.setEnabledColumnsForAverage(
        currentEnabled.filter((id) => id !== columnId)
      );
    } else {
      // Add the column
      this.visualizeService.setEnabledColumnsForAverage([
        ...currentEnabled,
        columnId,
      ]);
    }
  }

  selectAll(select: boolean): void {
    if (select) {
      // Select all columns
      this.visualizeService.setEnabledColumnsForAverage(
        this.numericColumns().map((col) => col.id)
      );
    } else {
      // Deselect all columns
      this.visualizeService.setEnabledColumnsForAverage([]);
    }
  }
}
