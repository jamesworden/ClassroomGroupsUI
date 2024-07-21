import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ThemeService } from './themes/theme.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { ConfigurationsPanelComponent } from './components/configurations-panel/configurations-panel.component';
import { ClassroomsPanelComponent } from './components/classrooms-panel/classrooms-panel.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfigurationPanelComponent } from './components/configuration-panel/configuration-panel.component';
import {
  ResizableSide,
  ResizeableDirective,
} from './directives/resizeable.directive';
import { ResizableService } from './directives/resizable.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  YesNoDialogComponent,
  YesNoDialogInputs,
} from './components/yes-no-dialog/yes-no-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClassroomsService } from './classrooms.service';

enum StorageKeys {
  CLASS_AND_CONFIG_PANEL = 'classrooms-and-configurations-panel',
  CONFIG_PANEL = 'configurations-panel',
}

const DEFAULT_PANEL_WIDTH = Math.max(window.innerWidth / 4, 350);

const DEFAULT_CONFIGURATIONS_PANEL_HEIGHT = window.innerHeight / 2;

interface ClassAndConfigPanelSettings {
  width: number;
  isOpen: boolean;
}

interface ConfigPanelSettings {
  height: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatButtonModule,
    MatSidenavModule,
    SidebarComponent,
    MatIconModule,
    ConfigurationsPanelComponent,
    ClassroomsPanelComponent,
    MatMenuModule,
    MatTooltipModule,
    ConfigurationPanelComponent,
    ResizeableDirective,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ThemeService, ResizableService, ClassroomsService],
})
export class AppComponent {
  readonly #themeService = inject(ThemeService);
  readonly #resizableService = inject(ResizableService);
  readonly #matDialog = inject(MatDialog);
  readonly #matSnackBar = inject(MatSnackBar);
  readonly #classroomsService = inject(ClassroomsService);

  readonly classrooms = this.#classroomsService.classrooms;
  readonly viewingClassroomId = this.#classroomsService.viewingClassroomId;
  readonly viewingClassroom = this.#classroomsService.viewingClassroom;

  readonly theme = this.#themeService.theme;
  readonly isResizing = this.#resizableService.isResizing;

  readonly ResizableSide = ResizableSide;

  maxClassAndConfigPanelWidth = Math.max(window.innerWidth / 2, 700);
  minClassAndConfigPanelWidth = Math.max(window.innerWidth / 5, 350);

  maxConfigurationsPanelHeight = (window.innerHeight * 3) / 4;
  minConfigurationsPanelHeight = window.innerHeight / 4;

  readonly classAndConfigPanelSettings = signal<ClassAndConfigPanelSettings>({
    width: DEFAULT_PANEL_WIDTH,
    isOpen: true,
  });
  readonly configPanelSettings = signal<ConfigPanelSettings>({
    height: DEFAULT_CONFIGURATIONS_PANEL_HEIGHT,
  });
  updatedClassroomDescription = '';
  updatedClassroomLabel = '';

  constructor() {
    this.loadClassAndConfigPanelSettings();
    this.loadConfigPanelSettings();
    this.showUnderConstructionToast();

    effect(
      () =>
        (this.updatedClassroomDescription =
          this.viewingClassroom()?.description ?? '')
    );
    effect(
      () => (this.updatedClassroomLabel = this.viewingClassroom()?.label ?? '')
    );
    effect(() => {
      localStorage.setItem(
        StorageKeys.CLASS_AND_CONFIG_PANEL,
        JSON.stringify(this.classAndConfigPanelSettings())
      );
    });
    effect(() => {
      localStorage.setItem(
        StorageKeys.CONFIG_PANEL,
        JSON.stringify(this.configPanelSettings())
      );
    });
  }

  private showUnderConstructionToast() {
    this.#matSnackBar.open(
      'Your changes will not be saved! This site is under construction.',
      'Got it!'
    );
  }

  private loadClassAndConfigPanelSettings() {
    const setting = localStorage.getItem(StorageKeys.CLASS_AND_CONFIG_PANEL);
    if (setting) {
      const settings = JSON.parse(setting) as ClassAndConfigPanelSettings;
      this.classAndConfigPanelSettings.set({
        ...settings,
        width: settings.width ?? DEFAULT_PANEL_WIDTH,
      });
    }
  }

  private loadConfigPanelSettings() {
    const setting = localStorage.getItem(StorageKeys.CONFIG_PANEL);
    if (setting) {
      const settings = JSON.parse(setting) as ConfigPanelSettings;
      this.configPanelSettings.set({
        ...settings,
        height: settings.height ?? DEFAULT_CONFIGURATIONS_PANEL_HEIGHT,
      });
    }
  }

  setPanelWidth(panelWidth: number) {
    this.classAndConfigPanelSettings.set({
      ...this.classAndConfigPanelSettings(),
      width: panelWidth,
    });
  }

  setConfigPanelHeight(panelHeight: number) {
    this.configPanelSettings.set({
      ...this.configPanelSettings(),
      height: panelHeight,
    });
  }

  openDeleteClassroomDialog() {
    const dialogRef = this.#matDialog.open(YesNoDialogComponent, {
      restoreFocus: false,
      data: <YesNoDialogInputs>{
        title: 'Delete classroom',
        subtitle: `Are you sure you want to delete the classroom ${
          this.viewingClassroom()?.label
        } and all of it's data?`,
      },
    });
    dialogRef.afterClosed().subscribe((success) => {
      const classroomId = this.viewingClassroomId();
      if (success && classroomId) {
        this.#classroomsService.deleteClassroom(classroomId);
      }
    });
  }

  updateClassroomDescription() {
    const classroomId = this.viewingClassroomId();
    if (classroomId) {
      this.#classroomsService.updateClassroomDescription(
        classroomId,
        this.updatedClassroomDescription
      );
    }
  }

  updateClassroomLabel() {
    const classroomId = this.viewingClassroomId();
    if (this.updatedClassroomLabel.trim().length === 0) {
      this.updatedClassroomLabel = this.viewingClassroom()?.label ?? '';
    } else if (classroomId) {
      this.#classroomsService.updateClassroomLabel(
        classroomId,
        this.updatedClassroomLabel
      );
    }
  }

  toggleClassAndConfigPanel() {
    const existingSettings = this.classAndConfigPanelSettings();
    this.classAndConfigPanelSettings.set({
      ...existingSettings,
      isOpen: !existingSettings.isOpen,
    });
  }
}
