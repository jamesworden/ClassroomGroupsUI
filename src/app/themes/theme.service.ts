import { effect, Injectable, signal } from '@angular/core';
import { Themes } from './theme.models';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public readonly theme = signal<Themes>(Themes.LIGHT);

  constructor() {
    this.initializeTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (event) =>
      this.handleSystemThemeChange(event.matches)
    );

    effect(() => this.applyTheme());
  }

  private initializeTheme() {
    const savedTheme = localStorage.getItem('theme') as Themes | null;
    if (savedTheme) {
      this.theme.set(savedTheme);
    } else {
      this.setThemeFromSystem();
    }
  }

  private setThemeFromSystem() {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    this.theme.set(prefersDark ? Themes.DARK : Themes.LIGHT);
    localStorage.setItem('theme', this.theme());
  }

  private handleSystemThemeChange(prefersDark: boolean) {
    const currentTheme = this.theme();
    const systemTheme = prefersDark ? Themes.DARK : Themes.LIGHT;

    if (currentTheme !== systemTheme) {
      this.toggleTheme();
    }
  }

  private applyTheme() {
    document.body.classList.remove(Themes.DARK, Themes.LIGHT);
    document.body.classList.add(this.theme());
  }

  toggleTheme() {
    const newTheme = this.theme() === Themes.DARK ? Themes.LIGHT : Themes.DARK;
    this.theme.set(newTheme);
    localStorage.setItem('theme', newTheme);
  }
}
