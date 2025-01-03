import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from 'app/components/toolbar/toolbar.component';
import { Themes } from 'app/themes/theme.models';
import { ThemeService } from 'app/themes/theme.service';

@Component({
  selector: 'app-page-not-found-view',
  standalone: true,
  imports: [RouterModule, ToolbarComponent],
  templateUrl: './page-not-found-view.component.html',
  styleUrl: './page-not-found-view.component.scss',
})
export class PageNotFoundViewComponent {
  readonly #themeService = inject(ThemeService);

  readonly theme = this.#themeService.theme;
  readonly Themes = Themes;
}
