import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ClassroomPageService } from '../../classroom-page.service';
import { ClassroomsService, FieldType } from '@shared/classrooms';

interface TextGroup {
  name?: string;
  students: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ConfigurationPreviewService {
  readonly #classroomPageService = inject(ClassroomPageService);
  readonly #classroomsService = inject(ClassroomsService);

  readonly classroomId = this.#classroomPageService.classroomId;
  readonly configurationId = this.#classroomPageService.configurationId;
  readonly configurationDetail = computed(() =>
    this.#classroomsService.select.configurationDetail(this.configurationId())()
  );
  readonly defaultGroup = computed(() =>
    this.#classroomsService.select.defaultGroup(this.configurationId())()
  );
  readonly columnDetails = computed(() =>
    this.#classroomsService.select.columnDetails(this.configurationId())
  );
  readonly classroomDetail = computed(() =>
    this.#classroomsService.select.classroomDetail(this.classroomId())()
  );

  readonly showGroupNames = signal(true);
  readonly showUngroupedStudents = signal(true);
  readonly showingCopiedMessage = signal(false);
  readonly showingCopiedTimeout = signal<number | undefined>(undefined);
  readonly visibleFieldIds = signal<string[]>([]);

  readonly editableText = signal('');
  readonly isTextModified = signal(false);
  readonly characterCount = computed(() => this.editableText().length);
  readonly lineCount = computed(() => {
    const text = this.editableText();
    return text ? text.split('\n').length : 0;
  });

  readonly textGroups = computed(() => {
    const textGroups: TextGroup[] = [];
    for (const groupDetail of this.configurationDetail()?.groupDetails || []) {
      const textGroup: TextGroup = {
        students: [],
      };
      if (
        (this.showUngroupedStudents() && groupDetail.studentDetails.length) ||
        groupDetail.id !== this.defaultGroup()?.id
      ) {
        if (this.showGroupNames()) {
          const groupName =
            groupDetail.id === this.defaultGroup()?.id
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
      const firstFieldDetail = this.classroomDetail()?.fieldDetails.find(
        ({ type }) => type === FieldType.TEXT
      );
      if (firstFieldDetail) {
        visibleFieldIds.push(firstFieldDetail.id);
      }
      this.visibleFieldIds.set(visibleFieldIds);
    });

    effect(() => {
      const text = this.plainText();
      if (!this.isTextModified() || !this.editableText()) {
        this.editableText.set(text);
      }
    });
  }

  public updateEditableText(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    const newText = textarea.value;
    this.editableText.set(newText);

    this.isTextModified.set(newText !== this.plainText());

    if (this.showingCopiedMessage()) {
      this.showingCopiedMessage.set(false);
      if (this.showingCopiedTimeout()) {
        window.clearTimeout(this.showingCopiedTimeout());
        this.showingCopiedTimeout.set(undefined);
      }
    }
  }

  public regenerateText() {
    this.editableText.set(this.plainText());
    this.isTextModified.set(false);
  }
}
