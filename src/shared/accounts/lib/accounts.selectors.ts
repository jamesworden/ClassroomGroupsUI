import { computed, Signal } from '@angular/core';
import { AccountsState } from './accounts.service';

export class AccountSelectors {
  constructor(private _state: Signal<AccountsState>) {}

  public readonly account = computed(() => this._state().account);

  public readonly isLoggedIn = computed(() => !!this._state().account);

  public readonly accountLoading = computed(() => this._state().accountLoading);

  public readonly maxStudentsPerClassroom = computed(
    () => this._state().account?.subscription?.maxStudentsPerClassroom ?? 0
  );

  public readonly maxFieldsPerClassroom = computed(
    () => this._state().account?.subscription?.maxFieldsPerClassroom ?? 0
  );

  public readonly maxConfigurationsPerClassroom = computed(
    () =>
      this._state().account?.subscription?.maxConfigurationsPerClassroom ?? 0
  );
}
