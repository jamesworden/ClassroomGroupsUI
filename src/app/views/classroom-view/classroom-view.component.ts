import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsService } from '@shared/accounts';
import {
  ClassroomsService,
  ColumnDetail,
  Group,
  GroupDetail,
  StudentDetail,
  StudentField,
} from '@shared/classrooms';
import { ConfigurationsPanelComponent } from 'app/components/configurations-panel/configurations-panel.component';
import { GroupPanelComponent } from 'app/components/group-panel/group-panel.component';
import {
  YesNoDialogComponent,
  YesNoDialogInputs,
} from 'app/components/yes-no-dialog/yes-no-dialog.component';
import { ThemeService } from 'app/themes/theme.service';
import { combineLatest, filter, take } from 'rxjs';
import { getConfigurationFromDetail } from 'shared/classrooms/lib/logic/get-model-from-detail';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject } from '@microsoft/signalr';
import { ConfigurationPanelBottomComponent } from 'app/components/configuration-panel-bottom/configuration-panel-bottom.component';
import { ConfigurationPanelTopComponent } from 'app/components/configuration-panel-top/configuration-panel-top.component';
import { MoveStudentDetail } from 'shared/classrooms/lib/models/move-student-detail';
import { calculateAverageScores } from 'shared/classrooms/lib/logic/calculate-average-scores';
import { Themes } from 'app/themes/theme.models';
import { AccountMenuComponent } from 'app/components/account-menu/account-menu.component';

@Component({
  selector: 'app-classroom-view',
  imports: [
    CommonModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    ConfigurationsPanelComponent,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    GroupPanelComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    ConfigurationPanelBottomComponent,
    ConfigurationPanelTopComponent,
    MatTooltipModule,
    AccountMenuComponent,
  ],
  templateUrl: './classroom-view.component.html',
  styleUrl: './classroom-view.component.scss',
})
export class ClassroomViewComponent {
  @ViewChild('spreadsheet')
  spreadsheet!: ElementRef<HTMLDivElement>;

  readonly #themeService = inject(ThemeService);
  readonly #matDialog = inject(MatDialog);
  readonly #matSnackBar = inject(MatSnackBar);
  readonly #classroomsService = inject(ClassroomsService);
  readonly #accountsService = inject(AccountsService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);

  readonly theme = this.#themeService.theme;
  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly accountLoading = this.#accountsService.select.accountLoading;

  readonly queryParams = toSignal(this.#activatedRoute.params, {
    initialValue: {
      id: null,
    },
  });
  readonly classroomId = computed(
    () => this.queryParams().id as string | undefined
  );
  readonly classroomId$ = toObservable(this.classroomId);
  readonly classroom = computed(() =>
    this.#classroomsService.select.classroomDetail(this.classroomId())()
  );
  readonly selectedConfigurationId = signal<string | undefined>(undefined);
  readonly selectedConfigurationId$ = toObservable(
    this.selectedConfigurationId
  );
  readonly configurationDetail = computed(() =>
    this.#classroomsService.select.configurationDetail(
      this.selectedConfigurationId()
    )()
  );
  readonly configurationLoading = computed(() =>
    this.#classroomsService.select.configurationLoading(
      this.selectedConfigurationId()
    )()
  );
  readonly selectedConfiguration = computed(() => {
    const detail = this.#classroomsService.select.configurationDetail(
      this.selectedConfigurationId()
    )();
    return detail ? getConfigurationFromDetail(detail) : undefined;
  });
  readonly listGroupDetails = computed(() =>
    this.#classroomsService.select.listGroupDetails(
      this.selectedConfigurationId()
    )()
  );
  readonly configurationUpdating = computed(() =>
    this.#classroomsService.select.configurationUpdating(
      this.selectedConfigurationId()
    )()
  );
  readonly classroomUpdating = computed(() =>
    this.#classroomsService.select.classroomUpdating(this.classroomId())()
  );
  readonly configurations = computed(() =>
    this.#classroomsService.select.configurations(this.classroomId())()
  );
  readonly configurations$ = toObservable(this.configurations);
  readonly configurationIds = computed(() =>
    this.#classroomsService.select.configurationIds(this.classroomId())()
  );
  readonly classroomLabel = computed(() => this.classroom()?.label ?? '');
  readonly classroomDescription = computed(
    () => this.classroom()?.description ?? ''
  );
  readonly defaultGroup = computed(() =>
    this.#classroomsService.select.defaultGroup(
      this.selectedConfigurationId()
    )()
  );
  readonly columnDetails = computed(() =>
    this.#classroomsService.select.columnDetails(
      this.defaultGroup()?.configurationId
    )
  );
  readonly allGroupDetails = computed(() => {
    const listGroupDetails = this.listGroupDetails();
    const defaultGroupDetail = this.defaultGroup();
    if (defaultGroupDetail) {
      return [defaultGroupDetail, ...listGroupDetails];
    } else {
      return listGroupDetails;
    }
  });
  readonly allStudentDetails = computed(() =>
    this.allGroupDetails().flatMap(({ studentDetails }) => studentDetails)
  );
  readonly averageScores = computed(() =>
    calculateAverageScores(this.allStudentDetails(), this.columnDetails())
  );
  readonly anyAverageScores = computed(
    () => Object.keys(this.averageScores()).length > 0
  );
  readonly account = this.#accountsService.select.account;
  readonly classroomViewInitialized$ = new Subject<void>();
  readonly Themes = Themes;
  readonly menuIsOpen = signal(false);

  editingDefaultGroup: GroupDetail | undefined = undefined;
  editingGroups: GroupDetail[] = [];
  editingColumnDetails: ColumnDetail[] = [];

  constructor() {
    effect(() => (this.editingGroups = this.listGroupDetails()));
    effect(() => (this.editingDefaultGroup = this.defaultGroup()));
    effect(() => (this.editingColumnDetails = this.columnDetails()));

    this.configurations$
      .pipe(
        takeUntilDestroyed(),
        filter((configurations) => configurations.length > 0),
        take(1)
      )
      .subscribe(([firstConfiguration]) =>
        this.selectedConfigurationId.set(firstConfiguration.id)
      );
    combineLatest([this.classroomId$, this.selectedConfigurationId$])
      .pipe(takeUntilDestroyed())
      .subscribe(([classroomId, configurationId]) => {
        if (classroomId && configurationId) {
          this.#classroomsService.getConfigurationDetail(
            classroomId,
            configurationId
          );
        }
      });
    this.classroomId$
      .pipe(takeUntilDestroyed())
      .subscribe(
        (classroomId) =>
          classroomId && this.#classroomsService.getConfigurations(classroomId)
      );
  }

  openDeleteClassroomDialog() {
    const dialogRef = this.#matDialog.open(YesNoDialogComponent, {
      restoreFocus: false,
      data: <YesNoDialogInputs>{
        title: 'Delete classroom',
        subtitle: `Are you sure you want to delete the classroom ${
          this.classroom()?.label
        } and all of it's data?`,
      },
    });
    dialogRef.afterClosed().subscribe((success) => {
      const classroomId = this.classroomId();
      if (success && classroomId) {
        this.#classroomsService.deleteClassroom(classroomId).subscribe(() => {
          this.#router.navigate(['/classrooms']);
        });
      }
    });
  }

  toggleTheme() {
    this.#themeService.toggleTheme();
  }

  updateClassroomDescription(event: Event) {
    const description = (event.target as HTMLInputElement)?.value;
    const classroom = this.classroom();
    if (classroom) {
      this.#classroomsService.patchClassroom(
        classroom.id,
        classroom.label,
        description
      );
    }
  }

  updateClassroomLabel(event: Event) {
    const label = (event.target as HTMLInputElement)?.value;
    const classroom = this.classroom();
    if (classroom) {
      this.#classroomsService.patchClassroom(
        classroom.id,
        label,
        classroom.description
      );
    }
  }

  createGroup() {
    const classroomId = this.classroomId();
    const configurationId = this.selectedConfigurationId();
    if (classroomId && configurationId) {
      this.#classroomsService.createGroup(classroomId, configurationId);
    }
  }

  deleteGroup(groupId: string) {
    const classroomId = this.classroomId();
    const configurationId = this.selectedConfigurationId();
    if (classroomId && configurationId) {
      this.#classroomsService.deleteGroup(
        classroomId,
        configurationId,
        groupId
      );
    }
  }

  dropGroup(event: CdkDragDrop<Group[]>) {
    const classroomId = this.classroomId();
    const configurationId = this.configurationDetail()?.id;
    if (!classroomId || !configurationId) {
      return;
    }
    moveItemInArray(
      this.editingGroups,
      event.previousIndex,
      event.currentIndex
    );
    const sortedGroupIds = this.editingGroups.map(({ id }) => id);
    this.#classroomsService.sortGroups(
      classroomId,
      configurationId,
      sortedGroupIds
    );
  }

  chooseFileToUpload() {
    this.#matSnackBar.open('Under construction!', 'Hide', {
      duration: 3000,
    });
  }

  selectConfigurationId(configurationId: string) {
    this.selectedConfigurationId.set(configurationId);
  }

  updateConfigurationLabel(label: string) {
    const configuration = this.selectedConfiguration();
    const classroom = this.classroom();
    if (classroom && configuration) {
      this.#classroomsService.patchConfiguration(
        classroom.id,
        configuration.id,
        label,
        configuration.description
      );
    }
  }

  updateConfigurationDescription(description: string) {
    const configuration = this.selectedConfiguration();
    const classroom = this.classroom();
    if (classroom && configuration) {
      this.#classroomsService.patchConfiguration(
        classroom.id,
        configuration.id,
        configuration.label,
        description
      );
    }
  }

  createStudent(groupId: string) {
    const classroomId = this.classroomId();
    const configurationId = this.selectedConfigurationId();
    if (classroomId && configurationId) {
      this.#classroomsService.createStudent(
        classroomId,
        configurationId,
        groupId
      );
    }
  }

  updateGroupLabel(group: GroupDetail, label: string) {
    const classroomId = this.classroomId();
    const configurationId = this.selectedConfigurationId();
    if (classroomId && configurationId) {
      this.#classroomsService.patchGroup(
        classroomId,
        configurationId,
        group.id,
        label
      );
    }
  }

  selectFirstConfiguration() {
    const [firstConfigurationId] = this.configurationIds();
    if (firstConfigurationId) {
      this.selectConfigurationId(firstConfigurationId);
    }
  }

  goToClassroomsView() {
    this.#router.navigate(['classrooms']);
  }

  updateStudentField(studentField: StudentField) {
    const classroomId = this.classroomId();
    if (!classroomId) {
      return;
    }
    this.#classroomsService.upsertStudentField(classroomId, studentField);
  }

  deleteStudent(studentDetail: StudentDetail) {
    const classroomId = this.classroomId();
    if (!classroomId) {
      return;
    }
    this.#classroomsService.deleteStudent(classroomId, studentDetail.id);
  }

  updateStudentPosition(position: MoveStudentDetail) {
    position.prevGroupId === position.currGroupId
      ? this.moveStudentInGroup(position)
      : this.moveStudentToGroup(position);
  }

  moveStudentInGroup(position: MoveStudentDetail) {
    const classroomId = this.classroomId();
    const configurationId = this.selectedConfigurationId();
    if (!classroomId || !configurationId) {
      return;
    }

    const allGroups = this.editingGroups.concat(this.defaultGroup() || []);

    for (const group of allGroups) {
      if (group.id === position.prevGroupId && group.studentDetails) {
        moveItemInArray(
          group.studentDetails,
          position.prevIndex,
          position.currIndex
        );
      }
    }

    this.#classroomsService.moveStudent(classroomId, configurationId, position);
  }

  moveStudentToGroup(position: MoveStudentDetail) {
    let fromGroup: GroupDetail | undefined;
    let toGroup: GroupDetail | undefined;

    const allGroups = this.editingGroups.concat(this.defaultGroup() || []);

    for (const group of allGroups) {
      if (group.id === position.prevGroupId) {
        fromGroup = group;
      }
      if (group.id === position.currGroupId) {
        toGroup = group;
      }
    }

    const fromStudentDetails = fromGroup?.studentDetails;
    const toStudentDetails = toGroup?.studentDetails;

    if (!fromStudentDetails || !toStudentDetails) {
      return;
    }

    transferArrayItem(
      fromStudentDetails,
      toStudentDetails,
      position.prevIndex,
      position.currIndex
    );

    const classroomId = this.classroomId();
    const configurationId = this.selectedConfigurationId();
    if (!classroomId || !configurationId) {
      return;
    }

    this.#classroomsService.moveStudent(classroomId, configurationId, position);
  }

  addGroup() {
    const classroomId = this.classroomId();
    const configurationId = this.selectedConfigurationId();
    if (classroomId && configurationId) {
      this.#classroomsService.createGroup(classroomId, configurationId);
    }
  }

  markMenuAsOpen() {
    this.menuIsOpen.set(true);
  }

  markMenuAsClosed() {
    this.menuIsOpen.set(false);
  }

  openDeleteConfigurationModal(configurationId: string) {
    const classroomId = this.classroomId();
    if (!classroomId) {
      return;
    }

    const configuration = this.#classroomsService.select.configuration(
      classroomId,
      configurationId
    )();
    if (!configuration) {
      return;
    }

    const dialogRef = this.#matDialog.open(YesNoDialogComponent, {
      restoreFocus: false,
      data: <YesNoDialogInputs>{
        title: 'Delete configuration',
        subtitle: `Are you sure you want to delete the configuration ${
          configuration.label
        } and all of it's data?`,
      },
    });

    dialogRef.afterClosed().subscribe((success) => {
      if (success && classroomId && configurationId) {
        this.#classroomsService
          .deleteConfiguration(classroomId, configurationId)
          .subscribe(() => this.selectFirstConfiguration());
      }
    });
  }
}
