import { Component, effect, input, signal } from '@angular/core';
import {
  Classroom,
  ColumnDetail,
  ConfigurationDetail,
  FieldType,
  GroupDetail,
  StudentDetail,
} from '@shared/classrooms';
import { MatChipsModule } from '@angular/material/chips';
import { ColumnListComponent } from '../column-list/column-list.component';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuration-preview',
  imports: [
    MatChipsModule,
    ColumnListComponent,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    CommonModule,
  ],
  templateUrl: './configuration-preview.component.html',
  styleUrl: './configuration-preview.component.scss',
})
export class ConfigurationPreviewComponent {
  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly classroom = input.required<Classroom>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly defaultGroup = input.required<GroupDetail>();

  readonly showGroupNames = signal(true);
  readonly showUnassignedStudents = signal(true);
  readonly underlineGroupNames = signal(true);

  visibleColumnIds = new Set<string>();

  constructor() {
    effect(() => {
      this.visibleColumnIds.clear();
      const firstTextColumn = this.columnDetails().find(
        ({ type }) => type === FieldType.TEXT
      );
      if (firstTextColumn) {
        this.visibleColumnIds.add(firstTextColumn.id);
      }
    });
  }

  toggleShowGroupNames() {
    this.showGroupNames.set(!this.showGroupNames());
  }

  toggleShowUnassignedStudents() {
    this.showUnassignedStudents.set(!this.showUnassignedStudents());
  }

  toggleUnderlineGroupNames() {
    this.underlineGroupNames.set(!this.underlineGroupNames());
  }

  toggleVisibleColumn(columnId: string, { checked }: MatSlideToggleChange) {
    checked
      ? this.visibleColumnIds.add(columnId)
      : this.visibleColumnIds.delete(columnId);
  }
}
