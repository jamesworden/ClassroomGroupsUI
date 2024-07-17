import { effect, Injectable, signal } from '@angular/core';
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

    effect(() => {
      for (const potentialTheme of Object.values(Themes)) {
        if (document.body.classList.contains(potentialTheme)) {
          document.body.classList.remove(potentialTheme);
        }
      }
      const actualTheme = this.theme();
      document.body.classList.add(actualTheme);
    });
  }

  toggleTheme() {
    this.theme.update((value) =>
      value === Themes.DARK ? Themes.LIGHT : Themes.DARK
    );
    localStorage.setItem('theme', this.theme());
  }
}
