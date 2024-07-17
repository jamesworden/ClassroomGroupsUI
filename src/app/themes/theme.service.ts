import { Injectable, signal } from '@angular/core';
import { Themes } from './theme.models';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public readonly theme = signal<Themes>(Themes.LIGHT);

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.theme.set(savedTheme as Themes);
    }
  }

  toggleTheme() {
    this.theme.update((value) =>
      value === Themes.DARK ? Themes.LIGHT : Themes.DARK
    );
    localStorage.setItem('theme', this.theme());
  }
}
