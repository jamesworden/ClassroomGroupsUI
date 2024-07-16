import { Injectable, signal } from '@angular/core';
import { Themes } from './theme.models';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public readonly themeSignal = signal<Themes>(Themes.DARK);

  setTheme(theme: Themes) {
    this.themeSignal.set(theme);
  }

  toggleTheme() {
    this.themeSignal.update((value) =>
      value === Themes.DARK ? Themes.LIGHT : Themes.DARK
    );
  }
}
