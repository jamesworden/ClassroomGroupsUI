import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  CreateEditColumnDialogComponent,
  CreateEditColumnDialogInputs,
  CreateEditColumnDialogOutputs,
} from '../create-edit-column-dialog/create-edit-column-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import {
  ClassroomsService,
  ColumnDetail,
  ConfigurationDetail,
  FieldType,
  GroupDetail,
  StudentGroupingStrategy,
} from '@shared/classrooms';
import { AccountsService } from '@shared/accounts';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { ColumnListComponent } from '../../column-list/column-list.component';

@Component({
  selector: 'app-configuration-panel-top',
  imports: [
    MatSlideToggleModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatMenuModule,
    CommonModule,
    MatTooltipModule,
    MatCheckboxModule,
    ColumnListComponent,
  ],
  templateUrl: './configuration-panel-top.component.html',
  styleUrl: './configuration-panel-top.component.scss',
})
export class ConfigurationPanelTopComponent implements AfterViewInit {
  readonly #matDialog = inject(MatDialog);
  readonly #classroomsService = inject(ClassroomsService);
  readonly #accountsService = inject(AccountsService);

  @ViewChild('toolbar')
  toolbar!: ElementRef<HTMLDivElement>;

  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly defaultGroup = input.required<GroupDetail>();
  readonly collapsed = input(false);

  readonly labelUpdated = output<string>();
  readonly descriptionUpdated = output<string>();
  readonly deletedConfiguration = output<string>();
  readonly collapsePanelsToggled = output();

  readonly account = this.#accountsService.select.account;

  readonly toolbarHeight = signal<number>(0);

  readonly classroomId = computed(
    () => this.configurationDetail()?.classroomId
  );
  readonly configurationId = computed(() => this.configurationDetail()?.id);
  readonly configurations = computed(() =>
    this.#classroomsService.select.configurations(this.classroomId())()
  );
  readonly configurationLabel = computed(
    () => this.configurationDetail()?.label ?? ''
  );
  readonly configurationDescription = computed(
    () => this.configurationDetail()?.description ?? ''
  );
  readonly listGroupDetails = computed(() =>
    this.#classroomsService.select.listGroupDetails(this.configurationId())()
  );
  readonly studentsInConfiguration = computed(() =>
    this.#classroomsService.select.studentsInConfiguration(
      this.configurationId()
    )()
  );
  readonly classroomUpdating = computed(() =>
    this.#classroomsService.select.classroomUpdating(this.classroomId())()
  );

  readonly StudentGroupingStrategy = StudentGroupingStrategy;
  readonly FieldType = FieldType;

  groupingByDivision = false;
  groupingValue = 0;

  ngAfterViewInit() {
    const observer = new ResizeObserver(() => {
      if (this.toolbar) {
        this.toolbarHeight.set(this.toolbar.nativeElement.offsetHeight);
      }
    });
    observer.observe(this.toolbar.nativeElement);
  }

  toggleGroupingType() {
    this.groupingByDivision = !this.groupingByDivision;
  }

  updateDescription(event: Event) {
    const description = (event.target as HTMLInputElement).value;
    this.descriptionUpdated.emit(description);
  }

  updateLabel(event: Event) {
    const label = (event.target as HTMLInputElement).value;
    this.labelUpdated.emit(label);
  }

  openDeleteConfigurationModal() {
    this.deletedConfiguration.emit(this.configurationId());
  }

  openCreateColumnDialog() {
    const dialogRef = this.#matDialog.open(CreateEditColumnDialogComponent, {
      restoreFocus: false,
      data: <CreateEditColumnDialogInputs>{
        title: 'Create column',
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((outputs?: CreateEditColumnDialogOutputs) => {
        const classroomId = this.classroomId();
        const configurationId = this.configurationId();
        if (outputs && classroomId && configurationId) {
          this.#classroomsService.createColumn(
            classroomId,
            configurationId,
            outputs.label,
            outputs.type
          );
        }
      });
  }

  createGroup() {
    this.#classroomsService.createGroup(
      this.classroomId(),
      this.configurationId()
    );
  }

  createStudent() {
    this.#classroomsService.createStudent(
      this.classroomId(),
      this.configurationId()
    );
  }

  groupStudents(studentGroupingStrategy: StudentGroupingStrategy) {
    const classroomId = this.classroomId();
    const configurationId = this.configurationId();
    const studentsPerGroup = this.groupingByDivision
      ? undefined
      : this.groupingValue;
    const numberOfGroups = this.groupingByDivision
      ? this.groupingValue
      : undefined;
    this.#classroomsService.groupStudents(
      classroomId,
      configurationId,
      studentGroupingStrategy,
      numberOfGroups,
      studentsPerGroup
    );
  }

  toggleCollapsedPanels() {
    this.collapsePanelsToggled.emit();
  }

  toggleColumnEnabled(columnId: string, { checked }: MatCheckboxChange) {
    checked
      ? this.#classroomsService.enableColumn(
          this.classroomId(),
          this.configurationId(),
          columnId
        )
      : this.#classroomsService.disableColumn(
          this.classroomId(),
          this.configurationId(),
          columnId
        );
  }
}
