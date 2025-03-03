import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ClassroomPageService } from '../../classroom-page.service';
import {
  ClassroomsService,
  FieldType,
  UNGROUPED_STUDENTS_DISPLAY_NAME,
} from '@shared/classrooms';

interface TextGroup {
  name?: string;
  students: string[];
}

const STORAGE_KEY_SHOW_GROUP_NAMES = 'config-text-view-show-group-names';
const STORAGE_KEY_SHOW_UNGROUPED_STUDENTS =
  'config-text-view-show-ungrouped-students';

@Injectable()
export class ConfigurationTextViewService {
  readonly #classroomPageService = inject(ClassroomPageService);
  readonly #classroomsService = inject(ClassroomsService);

  private readonly _showGroupNames = signal<boolean>(
    JSON.parse(localStorage.getItem(STORAGE_KEY_SHOW_GROUP_NAMES) || 'true')
  );
  private readonly _showUngroupedStudents = signal<boolean>(
    JSON.parse(
      localStorage.getItem(STORAGE_KEY_SHOW_UNGROUPED_STUDENTS) || 'true'
    )
  );
  private readonly _showingCopiedMessage = signal(false);
  private readonly _showingCopiedTimeout = signal<number | undefined>(
    undefined
  );
  private readonly _visibleFieldIds = signal<string[]>([]);
  private readonly _editableText = signal<string>('');
  private readonly _isTextModified = signal(false);

  public readonly showGroupNames = this._showGroupNames.asReadonly();
  public readonly showUngroupedStudents =
    this._showUngroupedStudents.asReadonly();
  public readonly showingCopiedMessage =
    this._showingCopiedMessage.asReadonly();
  public readonly showingCopiedTimeout =
    this._showingCopiedTimeout.asReadonly();
  public readonly visibleFieldIds = this._visibleFieldIds.asReadonly();
  public readonly editableText = this._editableText.asReadonly();
  public readonly isTextModified = this._isTextModified.asReadonly();

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
              ? UNGROUPED_STUDENTS_DISPLAY_NAME
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
      const primaryColumnDetil = this.columnDetails().find(
        ({ isPrimary }) => isPrimary
      );
      if (primaryColumnDetil) {
        visibleFieldIds.push(primaryColumnDetil.fieldId);
      }
      this._visibleFieldIds.set(visibleFieldIds);
    });

    effect(() => {
      const text = this.plainText();
      if (!this.isTextModified() || !this.editableText()) {
        this._editableText.set(text);
      }
    });

    effect(() => {
      localStorage.setItem(
        STORAGE_KEY_SHOW_GROUP_NAMES,
        JSON.stringify(this.showGroupNames())
      );
    });

    effect(() => {
      localStorage.setItem(
        STORAGE_KEY_SHOW_UNGROUPED_STUDENTS,
        JSON.stringify(this.showUngroupedStudents())
      );
    });
  }

  public setShowGroupNames(show: boolean) {
    this._showGroupNames.set(show);
  }

  public setShowUngroupedStudents(show: boolean) {
    this._showUngroupedStudents.set(show);
  }

  public setVisibleFieldIds(fieldIds: string[]) {
    this._visibleFieldIds.set(fieldIds);
  }

  public updateEditableText(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    const newText = textarea.value;
    this._editableText.set(newText);

    this._isTextModified.set(newText !== this.plainText());

    if (this.showingCopiedMessage()) {
      this._showingCopiedMessage.set(false);
      if (this.showingCopiedTimeout()) {
        window.clearTimeout(this.showingCopiedTimeout());
        this._showingCopiedTimeout.set(undefined);
      }
    }
  }

  public regenerateText() {
    this._editableText.set(this.plainText());
    this._isTextModified.set(false);
  }

  public setShowingCopiedMessage(showing: boolean) {
    this._showingCopiedMessage.set(showing);
  }

  public setShowingCopiedTimeout(timeout: number | undefined) {
    this._showingCopiedTimeout.set(timeout);
  }
}
