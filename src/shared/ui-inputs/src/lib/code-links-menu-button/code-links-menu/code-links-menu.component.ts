import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-code-links-menu',
  imports: [MatMenuModule, MatIcon],
  templateUrl: './code-links-menu.component.html',
  styleUrl: './code-links-menu.component.scss',
})
export class CodeLinksMenuComponent {}
