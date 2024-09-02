import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AppService],
})
export class AppComponent {
  readonly #appService = inject(AppService);
}
