import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from '@app/components';
import { Themes, ThemeService } from '@app/themes';

@Component({
  selector: 'app-page-not-found-view',
  imports: [RouterModule, ToolbarComponent],
  templateUrl: './page-not-found-view.component.html',
  styleUrl: './page-not-found-view.component.scss',
})
export class PageNotFoundViewComponent {
  readonly #themeService = inject(ThemeService);

  readonly theme = this.#themeService.theme;
  readonly Themes = Themes;
}
