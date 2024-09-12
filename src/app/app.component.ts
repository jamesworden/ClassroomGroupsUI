import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from './themes/theme.service';
import { ResizableService } from './directives/resizable.service';
import { ClassroomsService } from '@shared/classrooms';
import { AccountsService } from '@shared/accounts';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    ThemeService,
    ResizableService,
    ClassroomsService,
    AccountsService,
  ],
})
export class AppComponent {
  readonly #router = inject(Router);
  readonly #accountsService = inject(AccountsService);
  readonly #classroomsService = inject(ClassroomsService);

  readonly isLoggedIn$ = toObservable(this.#accountsService.select.isLoggedIn);
  readonly accountLoading$ = toObservable(
    this.#accountsService.select.accountLoading
  );

  constructor() {
    combineLatest([this.isLoggedIn$, this.accountLoading$])
      .pipe(takeUntilDestroyed())
      .subscribe(([isLoggedIn, accountLoading]) => {
        if (!isLoggedIn && !accountLoading) {
          this.#router.navigate(['/']);
        } else if (isLoggedIn) {
          this.#classroomsService.getClassroomDetails();
        }
      });
  }
}
