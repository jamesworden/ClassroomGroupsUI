import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-button',
  imports: [MatIconModule, RouterModule, MatButtonModule, MatTooltipModule],
  templateUrl: './home-button.component.html',
  styleUrl: './home-button.component.css',
})
export class HomeButtonComponent {}
