import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppService } from './app.service';
import { ThemeService } from './themes/theme.service';
import { ResizableService } from './directives/resizable.service';
import { ClassroomsService } from '@shared/classrooms';
import { AccountsService } from '@shared/accounts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    ThemeService,
    ResizableService,
    ClassroomsService,
    AccountsService,
    AppService,
  ],
})
export class AppComponent {
  readonly #appService = inject(AppService);
}
