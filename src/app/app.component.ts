import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { getClassrooms } from './classrooms.actions';
import { Classroom } from './classroom.models';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ThemeService } from './themes/theme.service';
import { Themes } from './themes/theme.models';
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
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ThemeService],
})
export class AppComponent {
  readonly #store = inject(Store<{ classrooms: Classroom[] }>);
  readonly #themeService = inject(ThemeService);

  readonly classroomsSignal = toSignal(this.#store.select('classrooms'));
  readonly themeSignal = this.#themeService.themeSignal;

  readonly ResizableSide = ResizableSide;

  maxPanelWidth = Math.max(window.innerWidth / 2, 700);
  minPanelWidth = Math.max(window.innerWidth / 6, 175);
  panelWidth = DEFAULT_PANEL_WIDTH;

  maxConfigurationsPanelHeight = (window.innerHeight * 3) / 4;
  minConfigurationsPanelHeight = window.innerHeight / 4;
  configurationsPanelHeight = DEFAULT_CONFIGURATIONS_PANEL_HEIGHT;

  constructor() {
    this.#store.dispatch(getClassrooms());

    this.loadClassroomsAndConfigurationsPanelDimensions();
    this.loadConfigurationsPanelDimensions();

    effect(() => {
      for (const potentialTheme of Object.values(Themes)) {
        if (document.body.classList.contains(potentialTheme)) {
          document.body.classList.remove(potentialTheme);
        }
      }
      const actualTheme = this.themeSignal();
      document.body.classList.add(actualTheme);
    });
  }

  private loadClassroomsAndConfigurationsPanelDimensions() {
    const setting = localStorage.getItem('classrooms-and-configurations-panel');
    if (!setting) {
      return;
    }
    const panelDimensions = JSON.parse(setting) as PanelDimensions;
    this.panelWidth = panelDimensions.width ?? DEFAULT_PANEL_WIDTH;
  }

  private loadConfigurationsPanelDimensions() {
    const setting = localStorage.getItem('configurations-panel');
    if (!setting) {
      return;
    }
    const panelDimensions = JSON.parse(setting) as PanelDimensions;
    this.configurationsPanelHeight =
      panelDimensions.height ?? DEFAULT_CONFIGURATIONS_PANEL_HEIGHT;
  }

  setPanelWidth(panelWidth: number) {
    this.panelWidth = panelWidth;
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
}
