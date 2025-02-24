import { Component, computed, inject, signal } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsService } from '@shared/accounts';
import {
  calculateAverageScores,
  ClassroomsService,
  getConfigurationFromDetail,
} from '@shared/classrooms';
import { combineLatest } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConfigurationsPanelComponent } from './configurations-panel/configurations-panel.component';
import { YesNoDialogComponent, YesNoDialogInputs } from '@app/components';
import { Themes, ThemeService } from '@app/themes';
import { ConfigurationViewComponent } from './configuration-view/configuration-view.component';
import { ClassroomHeaderComponent } from './classroom-header/classroom-header.component';
import { ConfigurationViewMode } from '@app/models';
import { ConfigurationPreviewComponent } from './configuration-preview/configuration-preview.component';
import { CommonModule } from '@angular/common';

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
    ConfigurationPreviewComponent,
  ],
  templateUrl: './classroom-view.component.html',
  styleUrl: './classroom-view.component.scss',
})
export class ClassroomViewComponent {
  readonly #themeService = inject(ThemeService);
  readonly #matDialog = inject(MatDialog);
  readonly #classroomsService = inject(ClassroomsService);
  readonly #accountsService = inject(AccountsService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);

  readonly theme = this.#themeService.theme;
  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly accountLoading = this.#accountsService.select.accountLoading;
  readonly account = this.#accountsService.select.account;

  readonly Themes = Themes;

  readonly queryParams = toSignal(this.#activatedRoute.params, {
    initialValue: {
      classroomId: null,
      configurationId: null,
    },
  });
  readonly classroomId = computed(
    () => this.queryParams().classroomId as string
  );
  readonly configurationId = computed(
    () => this.queryParams().configurationId as string
  );
  readonly classroom = computed(() =>
    this.#classroomsService.select.classroomDetail(this.classroomId())()
  );
  readonly configurationDetail = computed(() =>
    this.#classroomsService.select.configurationDetail(this.configurationId())()
  );
  readonly configurationLoading = computed(() =>
    this.#classroomsService.select.configurationLoading(
      this.configurationId()
    )()
  );
  readonly selectedConfiguration = computed(() => {
    const detail = this.#classroomsService.select.configurationDetail(
      this.configurationId()
    )();
    return detail ? getConfigurationFromDetail(detail) : undefined;
  });
  readonly listGroupDetails = computed(() =>
    this.#classroomsService.select.listGroupDetails(this.configurationId())()
  );
  readonly configurationUpdating = computed(() =>
    this.#classroomsService.select.configurationUpdating(
      this.configurationId()
    )()
  );
  readonly classroomUpdating = computed(() =>
    this.#classroomsService.select.classroomUpdating(this.classroomId())()
  );
  readonly configurations = computed(() =>
    this.#classroomsService.select.configurations(this.classroomId())()
  );
  readonly configurationIds = computed(() =>
    this.#classroomsService.select.configurationIds(this.classroomId())()
  );
  readonly classroomLabel = computed(() => this.classroom()?.label ?? '');
  readonly classroomDescription = computed(
    () => this.classroom()?.description ?? ''
  );
  readonly defaultGroup = computed(() =>
    this.#classroomsService.select.defaultGroup(this.configurationId())()
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

  readonly classroomId$ = toObservable(this.classroomId);
  readonly configurationId$ = toObservable(this.configurationId);
  readonly configurations$ = toObservable(this.configurations);

  readonly maxStudentsPerClassroom =
    this.#accountsService.select.maxStudentsPerClassroom;

  readonly configurationViewMode = signal(ConfigurationViewMode.List);

  readonly ConfigurationViewMode = ConfigurationViewMode;

  constructor() {
    this.classroomId$.pipe(takeUntilDestroyed()).subscribe((classroomId) => {
      if (classroomId) {
        this.#classroomsService.getConfigurations(classroomId);
      } else {
        this.#router.navigate(['/classrooms']);
      }
    });
    this.configurations$
      .pipe(takeUntilDestroyed())
      .subscribe(([firstConfiguration]) => {
        const classroomId = this.classroomId();
        const configurationId = this.configurationId();
        if (classroomId && firstConfiguration && !configurationId) {
          this.#router.navigate([
            `/classrooms/${classroomId}/configurations/${firstConfiguration.id}`,
          ]);
        }
      });
    combineLatest([this.classroomId$, this.configurationId$])
      .pipe(takeUntilDestroyed())
      .subscribe(([classroomId, configurationId]) => {
        if (classroomId && configurationId) {
          this.#classroomsService.getConfigurationDetail(
            classroomId,
            configurationId
          );
        }
      });
  }

  openDeleteClassroomDialog() {
    const dialogRef = this.#matDialog.open(YesNoDialogComponent, {
      restoreFocus: false,
      data: <YesNoDialogInputs>{
        title: 'Delete classroom',
        subtitle: `Are you sure you want to delete classroom '${
          this.classroom()?.label
        }' and all of it's data?`,
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

  selectConfigurationId(configurationId: string) {
    this.#router.navigate([
      `/classrooms/${this.classroomId()}/configurations/${configurationId}`,
    ]);
  }

  selectFirstConfiguration() {
    const [firstConfigurationId] = this.configurationIds();
    if (firstConfigurationId) {
      this.selectConfigurationId(firstConfigurationId);
    }
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
        subtitle: `Are you sure you want to delete configuration '${
          configuration.label
        }' and all of it's data?`,
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

  setConfigurationViewMode(configurationViewMode: ConfigurationViewMode) {
    this.configurationViewMode.set(configurationViewMode);
  }

  goToClassrooms() {
    this.#router.navigate(['/classrooms']);
  }
}
