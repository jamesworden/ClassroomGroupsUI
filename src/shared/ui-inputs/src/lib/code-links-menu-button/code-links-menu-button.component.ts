import { Component } from '@angular/core';
import { CodeLinksMenuComponent } from './code-links-menu/code-links-menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-code-links-menu-button',
  imports: [
    CodeLinksMenuComponent,
    MatMenuModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './code-links-menu-button.component.html',
  styleUrl: './code-links-menu-button.component.scss',
})
export class CodeLinksMenuButtonComponent {}
