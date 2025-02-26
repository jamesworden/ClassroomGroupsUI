import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from './themes/theme.service';
import { ClassroomsService } from '@shared/classrooms';
import { AccountsService } from '@shared/accounts';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ThemeService, ClassroomsService, AccountsService],
})
export class AppComponent {
  readonly #accountsService = inject(AccountsService);
  readonly #classroomsService = inject(ClassroomsService);

  readonly isLoggedIn$ = toObservable(this.#accountsService.select.isLoggedIn);
  readonly accountLoading$ = toObservable(
    this.#accountsService.select.accountLoading
  );

  // While unused, this `_themeService` ensures our theme is always applied.
  constructor(_themeService: ThemeService) {
    combineLatest([this.isLoggedIn$, this.accountLoading$])
      .pipe(
        takeUntilDestroyed(),
        filter(([_, accountLoading]) => !accountLoading)
      )
      .subscribe(
        ([isLoggedIn]) =>
          isLoggedIn && this.#classroomsService.getClassroomDetails()
      );
  }
}
