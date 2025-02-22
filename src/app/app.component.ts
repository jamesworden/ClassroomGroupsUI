import { Component, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from './themes/theme.service';
import { ClassroomsService } from '@shared/classrooms';
import { AccountsService } from '@shared/accounts';

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

  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly accountLoading = this.#accountsService.select.accountLoading;

  constructor() {
    effect(() => {
      if (!this.accountLoading() && this.isLoggedIn()) {
        this.#classroomsService.getClassroomDetails();
      }
    });
  }
}
