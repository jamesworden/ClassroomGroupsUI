import { Component, effect, input, signal } from '@angular/core';
import {
  Classroom,
  ColumnDetail,
  ConfigurationDetail,
  GroupDetail,
} from '@shared/classrooms';
import { MatChipsModule } from '@angular/material/chips';
import { ColumnListComponent } from '../column-list/column-list.component';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-configuration-preview',
  imports: [MatChipsModule, ColumnListComponent, MatSlideToggleModule],
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

  visibleColumnIds = new Set<string>();

  constructor() {
    effect(() => {
      const columnIds = this.columnDetails().map(({ id }) => id);
      this.visibleColumnIds = new Set(columnIds);
    });
  }

  toggleShowGroupNames() {
    this.showGroupNames.set(!this.showGroupNames());
  }

  toggleShowUnassignedStudents() {
    this.showUnassignedStudents.set(!this.showUnassignedStudents());
  }

  toggleVisibleColumn(columnId: string, { checked }: MatSlideToggleChange) {
    checked
      ? this.visibleColumnIds.add(columnId)
      : this.visibleColumnIds.delete(columnId);
  }
}
