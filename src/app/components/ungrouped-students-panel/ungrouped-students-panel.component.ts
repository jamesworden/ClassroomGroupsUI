import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ClassroomsService,
  StudentWithFields,
  UNGROUPED_STUDENTS_ID,
} from '@shared/classrooms';

@Component({
  selector: 'app-ungrouped-students-panel',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDropList, CommonModule, FormsModule],
  templateUrl: './ungrouped-students-panel.component.html',
  styleUrl: './ungrouped-students-panel.component.scss',
})
export class UngroupedStudentsPanelComponent {
  readonly #classroomsService = inject(ClassroomsService);

  @ViewChild('valueInput', { read: ElementRef })
  valueInput!: ElementRef<HTMLInputElement>;

  readonly classroomId = input<string | undefined>(undefined);
  readonly configurationId = input<string | undefined>(undefined);
  readonly students = input<StudentWithFields[]>([]);

  readonly groupIdsWithUngroupedId = computed(() =>
    this.#classroomsService.select.groupIdsWithUngroupedId(
      this.configurationId()
    )()
  );
  readonly columnDetails = computed(() =>
    this.#classroomsService.select.columnDetails(this.configurationId())
  );

  readonly UNGROUPED_STUDENTS_ID = UNGROUPED_STUDENTS_ID;

  editingFieldId?: string;
  editingStudentId?: string;
  editingField?: string;

  drop(event: CdkDragDrop<any, any, any>) {}

  saveEdits() {
    const classroomId = this.classroomId();
    console.log(
      classroomId,
      this.editingStudentId,
      this.editingFieldId,
      this.editingField
    );
    if (
      classroomId &&
      this.editingStudentId !== undefined &&
      this.editingFieldId !== undefined &&
      this.editingField !== undefined
    ) {
      this.#classroomsService.upsertStudentField(
        classroomId,
        this.editingStudentId,
        this.editingFieldId,
        this.editingField
      );
    }
    this.editingField = undefined;
    this.editingFieldId = undefined;
    this.editingStudentId = undefined;
  }

  startEditing(fieldId: string, value: string, studentId: string) {
    this.editingField = value;
    this.editingFieldId = fieldId;
    this.editingStudentId = studentId;
    setTimeout(() => this.valueInput.nativeElement.focus());
  }
}
