import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AccountMenuComponent } from './account-menu/account-menu.component';

@Component({
  selector: 'app-account-menu-button',
  imports: [
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
    AccountMenuComponent,
    MatIconModule,
  ],
  templateUrl: './account-menu-button.component.html',
  styleUrl: './account-menu-button.component.css',
})
export class AccountMenuButtonComponent {}
