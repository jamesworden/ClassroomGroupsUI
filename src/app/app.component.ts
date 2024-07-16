import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { getClassrooms } from './classrooms.actions';
import { Classroom } from './classroom.models';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from './themes/theme.service';
import { Themes } from './themes/theme.models';
import { MatListModule } from '@angular/material/list';
import {
  MatSnackBar,
  MatSnackBarModule,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ThemeService],
})
export class AppComponent implements OnInit {
  readonly #store = inject(Store<{ classrooms: Classroom[] }>);
  readonly #themeService = inject(ThemeService);
  readonly #matSnackBar = inject(MatSnackBar);

  readonly classroomsSignal = toSignal(this.#store.select('classrooms'));
  readonly themeSignal = this.#themeService.themeSignal;

  readonly Themes = Themes;

  ngOnInit() {
    this.#store.dispatch(getClassrooms());
  }

  toggleTheme() {
    this.#themeService.toggleTheme();
  }

  openUnderConstructionToastMessage() {
    this.#matSnackBar.open('Under Construction!', 'Hide', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }
}
