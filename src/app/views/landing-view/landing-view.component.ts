import { Component } from '@angular/core';
import { GoogleSignInButtonComponent } from '@ui-inputs';

@Component({
  selector: 'app-landing-view',
  standalone: true,
  imports: [GoogleSignInButtonComponent],
  templateUrl: './landing-view.component.html',
  styleUrl: './landing-view.component.scss',
})
export class LandingViewComponent {}
