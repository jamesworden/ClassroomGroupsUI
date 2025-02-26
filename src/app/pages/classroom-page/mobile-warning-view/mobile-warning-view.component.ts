import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mobile-warning-view',
  imports: [MatIconModule, RouterLink, MatButtonModule],
  templateUrl: './mobile-warning-view.component.html',
  styleUrl: './mobile-warning-view.component.scss',
})
export class MobileWarningViewComponent {}
