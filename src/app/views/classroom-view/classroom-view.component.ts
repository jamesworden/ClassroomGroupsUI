import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
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
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AccountsService } from '@shared/accounts';
import { ClassroomsService, Group } from '@shared/classrooms';
import { GoogleSignInButtonComponent } from '@ui-inputs';
import { ConfigurationPanelComponent } from 'app/components/configuration-panel/configuration-panel.component';
import { ConfigurationsPanelComponent } from 'app/components/configurations-panel/configurations-panel.component';
import { GroupPanelComponent } from 'app/components/group-panel/group-panel.component';
import { SidebarComponent } from 'app/components/sidebar/sidebar.component';
import {
  YesNoDialogComponent,
  YesNoDialogInputs,
} from 'app/components/yes-no-dialog/yes-no-dialog.component';
import { ResizableService } from 'app/directives/resizable.service';
import {
  ResizableSide,
  ResizeableDirective,
} from 'app/directives/resizeable.directive';
import { ThemeService } from 'app/themes/theme.service';
import { combineLatest } from 'rxjs';
import { getConfigurationFromDetail } from 'shared/classrooms/lib/logic/get-model-from-detail';

enum StorageKeys {
  CONFIG_PANEL = 'configurations-panel',
}

const DEFAULT_PANEL_WIDTH = Math.max(window.innerWidth / 4, 350);

interface ConfigPanelSettings {
  width: number;
  isOpen: boolean;
}

@Component({
  selector: 'app-classroom-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatButtonModule,
    MatSidenavModule,
    SidebarComponent,
    MatIconModule,
    ConfigurationsPanelComponent,
    MatMenuModule,
    MatTooltipModule,
    ConfigurationPanelComponent,
    ResizeableDirective,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    GroupPanelComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    GoogleSignInButtonComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './classroom-view.component.html',
  styleUrl: './classroom-view.component.scss',
})
export class ClassroomViewComponent {
  readonly #themeService = inject(ThemeService);
  readonly #resizableService = inject(ResizableService);
  readonly #matDialog = inject(MatDialog);
  readonly #matSnackBar = inject(MatSnackBar);
  readonly #classroomsService = inject(ClassroomsService);
  readonly #accountsService = inject(AccountsService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);

  readonly theme = this.#themeService.theme;
  readonly isResizing = this.#resizableService.isResizing;
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

  readonly ResizableSide = ResizableSide;
  readonly maxClassAndConfigPanelWidth = Math.max(window.innerWidth / 2, 700);
  readonly minClassAndConfigPanelWidth = Math.max(window.innerWidth / 5, 350);
  readonly configPanelSettings = signal<ConfigPanelSettings>({
    width: DEFAULT_PANEL_WIDTH,
    isOpen: true,
  });

  updatedClassroomDescription = '';
  updatedClassroomLabel = '';
  editingGroups: Group[] = [];

  constructor() {
    this.loadConfigPanelSettings();

    effect(
      () =>
        (this.updatedClassroomDescription = this.classroom()?.description ?? '')
    );
    effect(() => (this.updatedClassroomLabel = this.classroom()?.label ?? ''));
    effect(() => (this.editingGroups = []));
    effect(() => {
      localStorage.setItem(
        StorageKeys.CONFIG_PANEL,
        JSON.stringify(this.configPanelSettings())
      );
    });
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

  private loadConfigPanelSettings() {
    const setting = localStorage.getItem(StorageKeys.CONFIG_PANEL);
    if (setting) {
      const settings = JSON.parse(setting) as ConfigPanelSettings;
      this.configPanelSettings.set({
        ...settings,
        width: settings.width ?? DEFAULT_PANEL_WIDTH,
      });
    }
  }

  setPanelWidth(panelWidth: number) {
    this.configPanelSettings.set({
      ...this.configPanelSettings(),
      width: panelWidth,
    });
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
        this.#classroomsService.deleteClassroom(classroomId);
        this.#router.navigate(['classrooms']);
      }
    });
  }

  updateClassroomDescription() {
    // const classroomId = this.classroomId();
    // if (classroomId) {
    //   this.#classroomsService.updateClassroom(classroomId, {
    //     description: this.updatedClassroomDescription,
    //   });
    // }
  }

  updateClassroomLabel() {
    // const classroomId = this.classroomId();
    // if (this.updatedClassroomLabel.trim().length === 0) {
    //   this.updatedClassroomLabel = this.classroomId()?.label ?? '';
    // } else if (classroomId) {
    //   this.#classroomsService.updateClassroom(classroomId, {
    //     label: this.updatedClassroomLabel,
    //   });
    // }
  }

  toggleClassAndConfigPanel() {
    const existingSettings = this.configPanelSettings();
    this.configPanelSettings.set({
      ...existingSettings,
      isOpen: !existingSettings.isOpen,
    });
  }

  createGroup() {
    // const configurationId = this.configurationId();
    // if (configurationId) {
    //   this.#classroomsService.createGroup(configurationId);
    // }
  }

  drop(event: CdkDragDrop<Group[]>) {
    // moveItemInArray(
    //   this.editingGroups,
    //   event.previousIndex,
    //   event.currentIndex
    // );
    // this.#classroomsService.updateGroups(
    //   this.configurationId() ?? '',
    //   this.editingGroups
    // );
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
    if (configuration) {
      this.#classroomsService.patchConfiguration(configuration.id, {
        ...configuration,
        label,
      });
    }
  }

  updateConfigurationDescription(description: string) {
    const configuration = this.selectedConfiguration();
    if (configuration) {
      this.#classroomsService.patchConfiguration(configuration.id, {
        ...configuration,
        description,
      });
    }
  }
}
