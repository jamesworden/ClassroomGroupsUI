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

const DEFAULT_PANEL_WIDTH = Math.max(window.innerWidth / 4, 350);

const DEFAULT_CONFIGURATIONS_PANEL_HEIGHT = window.innerHeight / 2;

interface PanelDimensions {
  width?: number;
  height?: number;
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
  classAndConfigPanelWidth = DEFAULT_PANEL_WIDTH;

  maxConfigurationsPanelHeight = (window.innerHeight * 3) / 4;
  minConfigurationsPanelHeight = window.innerHeight / 4;
  configurationsPanelHeight = DEFAULT_CONFIGURATIONS_PANEL_HEIGHT;

  updatedClassroomDescription = '';
  updatedClassroomLabel = '';

  readonly viewingClassroom = toSignal(
    this.#store.select(selectViewingClassroom)
  );

  constructor() {
    this.loadClassAndConfigPanelDimensions();
    this.loadConfigPanelDimensions();

    effect(
      () =>
        (this.updatedClassroomDescription =
          this.viewingClassroom()?.description ?? '')
    );
    effect(
      () => (this.updatedClassroomLabel = this.viewingClassroom()?.label ?? '')
    );
  }

  private loadClassAndConfigPanelDimensions() {
    const setting = localStorage.getItem('classrooms-and-configurations-panel');
    if (!setting) {
      return;
    }
    const panelDimensions = JSON.parse(setting) as PanelDimensions;
    this.classAndConfigPanelWidth =
      panelDimensions.width ?? DEFAULT_PANEL_WIDTH;
  }

  private loadConfigPanelDimensions() {
    const setting = localStorage.getItem('configurations-panel');
    if (!setting) {
      return;
    }
    const panelDimensions = JSON.parse(setting) as PanelDimensions;
    this.configurationsPanelHeight =
      panelDimensions.height ?? DEFAULT_CONFIGURATIONS_PANEL_HEIGHT;
  }

  setPanelWidth(panelWidth: number) {
    this.classAndConfigPanelWidth = panelWidth;
    const panelDimensions: PanelDimensions = {
      width: panelWidth,
    };
    localStorage.setItem(
      'classrooms-and-configurations-panel',
      JSON.stringify(panelDimensions)
    );
  }

  setConfigurationsPanelHeight(panelHeight: number) {
    this.configurationsPanelHeight = panelHeight;
    const panelDimensions: PanelDimensions = {
      height: panelHeight,
    };
    localStorage.setItem(
      'configurations-panel',
      JSON.stringify(panelDimensions)
    );
  }

  deleteViewedClassroom() {
    this.#store.dispatch(
      deleteClassroom({
        classroomId: this.viewingClassroomId(),
      })
    );
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
}
