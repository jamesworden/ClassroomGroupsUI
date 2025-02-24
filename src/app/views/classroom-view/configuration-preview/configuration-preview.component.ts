import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import {
  Classroom,
  ColumnDetail,
  ConfigurationDetail,
  FieldType,
  GroupDetail,
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
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { MatMenuModule } from '@angular/material/menu';

interface TextGroup {
  name?: string;
  students: string[];
}

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
    ClipboardModule,
    MatMenuModule,
  ],
  templateUrl: './configuration-preview.component.html',
  styleUrl: './configuration-preview.component.scss',
})
export class ConfigurationPreviewComponent {
  readonly #clipboard = inject(Clipboard);

  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly classroom = input.required<Classroom>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly defaultGroup = input.required<GroupDetail>();

  @ViewChild('textVisualization')
  textVisualization?: ElementRef<HTMLElement>;

  readonly showGroupNames = signal(true);
  readonly showUngroupedStudents = signal(true);
  readonly showingCopiedMessage = signal(false);
  readonly showingCopiedTimeout = signal<number | undefined>(undefined);
  readonly visibleFieldIds = signal<string[]>([]);

  readonly textGroups = computed(() => {
    const textGroups: TextGroup[] = [];
    for (const groupDetail of this.configurationDetail().groupDetails) {
      const textGroup: TextGroup = {
        students: [],
      };
      if (
        (this.showUngroupedStudents() && groupDetail.studentDetails.length) ||
        groupDetail.id !== this.defaultGroup().id
      ) {
        if (this.showGroupNames()) {
          const groupName =
            groupDetail.id === this.defaultGroup().id
              ? 'Ungrouped Students'
              : groupDetail.label.trim();
          textGroup.name = groupName;
        }
        for (const studentDetail of groupDetail.studentDetails) {
          let student = '';
          for (const fieldId of this.visibleFieldIds()) {
            const value = studentDetail.fieldIdsToValues[fieldId]?.trim() || '';
            student += value ? `${value} ` : '';
          }
          student && textGroup.students.push(student);
        }
      }
      textGroups.push(textGroup);
    }
    return textGroups;
  });

  readonly plainText = computed(() => {
    let plainText = '';
    const textGroups = this.textGroups();
    for (let i = 0; i < textGroups.length; i++) {
      const textGroup = textGroups[i];
      if (textGroup.name) {
        plainText += `${textGroup.name}\n`;
      }
      for (let j = 0; j < textGroup.students.length; j++) {
        const student = textGroup.students[j];
        if (student && j < textGroup.students.length) {
          plainText += `${student}\n`;
        }
      }
      if (
        (textGroup.name || textGroup.students.length) &&
        i + 1 < textGroups.length
      ) {
        plainText += '\n';
      }
    }
    return plainText;
  });

  constructor() {
    effect(() => {
      const visibleFieldIds: string[] = [];
      const firstTextColumn = this.columnDetails().find(
        ({ type }) => type === FieldType.TEXT
      );
      if (firstTextColumn) {
        visibleFieldIds.push(firstTextColumn.fieldId);
      }
      this.visibleFieldIds.set(visibleFieldIds);
    });
  }

  toggleShowGroupNames() {
    this.showGroupNames.set(!this.showGroupNames());
  }

  toggleShowUngroupedStudents() {
    this.showUngroupedStudents.set(!this.showUngroupedStudents());
  }

  toggleVisibleField(fieldId: string, { checked }: MatSlideToggleChange) {
    const visibleFieldIds = new Set(this.visibleFieldIds());
    checked ? visibleFieldIds.add(fieldId) : visibleFieldIds.delete(fieldId);
    this.visibleFieldIds.set(Array.from(visibleFieldIds));
  }

  copyText() {
    this.#clipboard.copy(this.plainText());
    this.brieflyShowCopiedMessage();
  }

  brieflyShowCopiedMessage() {
    if (this.showingCopiedTimeout()) {
      window.clearTimeout(this.showingCopiedTimeout());
    }
    this.showingCopiedMessage.set(true);

    this.showingCopiedTimeout.set(
      window.setTimeout(() => {
        this.showingCopiedMessage.set(false);
      }, 3000)
    );
  }

  exportToTextFile() {
    const blob = new Blob([this.plainText()], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = this.configurationDetail().label || 'Groups';
    a.download = `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
