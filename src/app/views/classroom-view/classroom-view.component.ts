import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
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
  calculateAverageScores,
  ClassroomsService,
  ColumnDetail,
  getConfigurationFromDetail,
  Group,
  GroupDetail,
  MoveStudentDetail,
  StudentField,
} from '@shared/classrooms';
import { combineLatest, filter, take } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject } from '@microsoft/signalr';
import { ConfigurationsPanelComponent } from './configurations-panel/configurations-panel.component';
import { YesNoDialogComponent, YesNoDialogInputs } from '@app/components';
import { Themes, ThemeService } from '@app/themes';
import { ConfigurationViewComponent } from './configuration-view/configuration-view.component';
import { ClassroomHeaderComponent } from './classroom-header/classroom-header.component';

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
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    ConfigurationViewComponent,
    ClassroomHeaderComponent,
  ],
  templateUrl: './classroom-view.component.html',
  styleUrl: './classroom-view.component.scss',
})
export class ClassroomViewComponent {
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
  readonly account = this.#accountsService.select.account;

  readonly collapsePanelDetails = signal(false);

  readonly Themes = Themes;

  readonly queryParams = toSignal(this.#activatedRoute.params, {
    initialValue: {
      id: null,
    },
  });
  readonly classroomId = computed(() => this.queryParams().id as string);
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
  readonly groupLimitReached = computed(
    () =>
      this.listGroupDetails().length >=
      (this.account()?.subscription?.maxStudentsPerClassroom ?? 0)
  );

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

  selectConfigurationId(configurationId: string) {
    this.selectedConfigurationId.set(configurationId);
  }

  selectFirstConfiguration() {
    const [firstConfigurationId] = this.configurationIds();
    if (firstConfigurationId) {
      this.selectConfigurationId(firstConfigurationId);
    }
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

  toggleCollapsedPanels() {
    this.collapsePanelDetails.set(!this.collapsePanelDetails());
  }
}
