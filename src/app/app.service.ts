import { effect, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AccountsService } from '@shared/accounts';
import { ClassroomsService } from '@shared/classrooms';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  readonly #router = inject(Router);
  readonly #accountsService = inject(AccountsService);
  readonly #classroomsService = inject(ClassroomsService);

  readonly isLoggedIn = this.#accountsService.isLoggedIn;
  readonly accountLoading = this.#accountsService.accountLoading;

  constructor() {
    this.#classroomsService.getClassroomDetails();

    effect(() => {
      if (!this.isLoggedIn() && !this.accountLoading()) {
        this.#router.navigate(['/']);
      }
    });
  }
}
