import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Signal,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
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
import { Classroom } from './models/classroom.models';
import { ResizableService } from './directives/resizable.service';
import {
  selectClassrooms,
  selectViewingClassroom,
  selectViewingClassroomId,
} from './state/classrooms/classrooms.selectors';
import {
  deleteClassroom,
  updateClassroomDescription,
  updateClassroomLabel,
} from './state/classrooms/classrooms.actions';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  YesNoDialogComponent,
  YesNoDialogInputs,
} from './components/yes-no-dialog/yes-no-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  providers: [ThemeService, ResizableService],
})
export class AppComponent {
  readonly #store = inject(Store<{ classrooms: Classroom[] }>);
  readonly #themeService = inject(ThemeService);
  readonly #resizableService = inject(ResizableService);
  readonly #matDialog = inject(MatDialog);
  readonly #matSnackBar = inject(MatSnackBar);

  readonly classrooms = toSignal(this.#store.select(selectClassrooms), {
    initialValue: [],
  });

  readonly viewingClassroomId = toSignal(
    this.#store.select(selectViewingClassroomId),
    {
      initialValue: '',
    }
  );

  readonly theme = this.#themeService.theme;
  readonly isResizing = this.#resizableService.isResizing;

  readonly ResizableSide = ResizableSide;

  maxClassAndConfigPanelWidth = Math.max(window.innerWidth / 2, 700);
  minClassAndConfigPanelWidth = Math.max(window.innerWidth / 5, 350);

  maxConfigurationsPanelHeight = (window.innerHeight * 3) / 4;
  minConfigurationsPanelHeight = window.innerHeight / 4;

  classAndConfigPanelSettings: ClassAndConfigPanelSettings = {
    width: DEFAULT_PANEL_WIDTH,
    isOpen: true,
  };
  configPanelSettings: ConfigPanelSettings = {
    height: DEFAULT_CONFIGURATIONS_PANEL_HEIGHT,
  };
  updatedClassroomDescription = '';
  updatedClassroomLabel = '';

  readonly viewingClassroom = toSignal(
    this.#store.select(selectViewingClassroom)
  );

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
  }

  private showUnderConstructionToast() {
    this.#matSnackBar.open(
      'Your changes will not be saved! This site is under construction.',
      'Got it!'
    );
  }

  private loadClassAndConfigPanelSettings() {
    const setting = localStorage.getItem('classrooms-and-configurations-panel');
    if (!setting) {
      return;
    }
    const settings = JSON.parse(setting) as ClassAndConfigPanelSettings;
    this.classAndConfigPanelSettings.width =
      settings.width ?? DEFAULT_PANEL_WIDTH;
    this.classAndConfigPanelSettings.isOpen = settings.isOpen ?? true;
  }

  private loadConfigPanelSettings() {
    const setting = localStorage.getItem('configurations-panel');
    if (!setting) {
      return;
    }
    const settings = JSON.parse(setting) as ConfigPanelSettings;
    this.configPanelSettings.height =
      settings.height ?? DEFAULT_CONFIGURATIONS_PANEL_HEIGHT;
  }

  setPanelWidth(panelWidth: number) {
    this.classAndConfigPanelSettings.width = panelWidth;
    localStorage.setItem(
      'classrooms-and-configurations-panel',
      JSON.stringify(this.classAndConfigPanelSettings)
    );
  }

  setConfigurationsPanelHeight(panelHeight: number) {
    this.configPanelSettings.height = panelHeight;
    localStorage.setItem(
      'configurations-panel',
      JSON.stringify(this.configPanelSettings)
    );
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
      if (success) {
        this.#store.dispatch(
          deleteClassroom({
            classroomId: this.viewingClassroomId(),
          })
        );
      }
    });
  }

  updateClassroomDescription() {
    this.#store.dispatch(
      updateClassroomDescription({
        classroomId: this.viewingClassroomId(),
        description: this.updatedClassroomDescription,
      })
    );
  }

  updateClassroomLabel() {
    if (this.updatedClassroomLabel.trim().length === 0) {
      this.updatedClassroomLabel = this.viewingClassroom()?.label ?? '';
    } else {
      this.#store.dispatch(
        updateClassroomLabel({
          classroomId: this.viewingClassroomId(),
          label: this.updatedClassroomLabel,
        })
      );
    }
  }

  closeClassAndConfigPanel() {}
}
