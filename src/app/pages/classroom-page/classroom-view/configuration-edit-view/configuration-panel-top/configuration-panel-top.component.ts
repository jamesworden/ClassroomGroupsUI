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
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import {
  ClassroomsService,
  ColumnDetail,
  ConfigurationDetail,
  FieldType,
  GroupDetail,
  MAX_CLASSROOM_NAME_LENGTH,
  MAX_CONFIGURATION_NAME_LENGTH,
  StudentGroupingStrategy,
} from '@shared/classrooms';
import { AccountsService } from '@shared/accounts';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { ColumnListComponent } from '../../column-list/column-list.component';
import { ClassroomPageService } from 'app/pages/classroom-page/classroom-page.service';

@Component({
  selector: 'app-configuration-panel-top',
  imports: [
    MatSlideToggleModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatMenuModule,
    CommonModule,
    MatTooltipModule,
    MatCheckboxModule,
    ColumnListComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './configuration-panel-top.component.html',
  styleUrl: './configuration-panel-top.component.scss',
})
export class ConfigurationPanelTopComponent implements AfterViewInit {
  readonly #classroomPageService = inject(ClassroomPageService);
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
  readonly groupingControl = computed(
    () =>
      new FormControl(this.groupingValue(), [
        Validators.required,
        Validators.min(0),
        () => {
          const maxStudents = this.studentsInConfiguration().length;
          return this.groupingValue() > maxStudents
            ? { maxExceeded: true }
            : null;
        },
      ])
  );

  readonly StudentGroupingStrategy = StudentGroupingStrategy;
  readonly FieldType = FieldType;
  readonly MAX_CONFIGURATION_NAME_LENGTH = MAX_CONFIGURATION_NAME_LENGTH;
  readonly MAX_CLASSROOM_NAME_LENGTH = MAX_CLASSROOM_NAME_LENGTH;

  readonly groupingValue = signal(3);
  readonly groupingByDivision = signal(true);

  ngAfterViewInit() {
    const observer = new ResizeObserver(() => {
      if (this.toolbar) {
        this.toolbarHeight.set(this.toolbar.nativeElement.offsetHeight);
      }
    });
    observer.observe(this.toolbar.nativeElement);
  }

  toggleGroupingType() {
    this.groupingByDivision.set(!this.groupingByDivision());
  }

  updateDescription(event: Event) {
    const description = (event.target as HTMLInputElement).value;
    this.descriptionUpdated.emit(description);
  }

  updateLabel(event: Event) {
    const label = (event.target as HTMLInputElement).value;
    this.labelUpdated.emit(label);
  }

  openDeleteConfigurationDialog() {
    this.deletedConfiguration.emit(this.configurationId());
  }

  openCreateColumnDialog() {
    this.#classroomPageService.openCreateColumnDialog();
  }

  createGroup() {
    this.#classroomPageService.openCreateGroupDialog();
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
    const studentsPerGroup = this.groupingByDivision()
      ? undefined
      : this.groupingValue();
    const numberOfGroups = this.groupingByDivision()
      ? this.groupingValue()
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

  updateGroupingValue({ target }: Event) {
    const element = target as HTMLInputElement;
    const number = +element.value;
    this.groupingValue.set(number);
  }
}
