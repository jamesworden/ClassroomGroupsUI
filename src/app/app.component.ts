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

  constructor() {
    this.#store.dispatch(getClassrooms());

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
}
