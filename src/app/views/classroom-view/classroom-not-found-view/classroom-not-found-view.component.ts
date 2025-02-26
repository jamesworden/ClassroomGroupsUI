import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-classroom-not-found-view',
  imports: [MatIconModule, RouterLink, MatButtonModule],
  templateUrl: './classroom-not-found-view.component.html',
  styleUrl: './classroom-not-found-view.component.scss',
})
export class ClassroomNotFoundViewComponent {}
