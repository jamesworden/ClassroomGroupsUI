import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ClassroomDetail, ClassroomsService } from '@shared/classrooms';
import { Router, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AccountsService } from '@shared/accounts';
import { CommonModule } from '@angular/common';
import { SubscriptionPlanCardComponent } from './subscription-plan-card/subscription-plan-card.component';
import { subscriptionPlans } from '@app/metadata';
import { Themes, ThemeService } from '@app/themes';
import {
  AccountMenuButtonComponent,
  CodeLinksMenuButtonComponent,
  ToggleThemeButtonComponent,
} from '@ui-inputs';
import { ClassroomPageService } from '../classroom-page/classroom-page.service';

@Component({
  selector: 'app-classrooms-view',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatToolbarModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    RouterModule,
    SubscriptionPlanCardComponent,
    CommonModule,
    ToggleThemeButtonComponent,
    AccountMenuButtonComponent,
    CodeLinksMenuButtonComponent,
  ],
  templateUrl: './classrooms-view.component.html',
  styleUrl: './classrooms-view.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ClassroomsPageComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #router = inject(Router);
  readonly #themeService = inject(ThemeService);
  readonly #classroomPageService = inject(ClassroomPageService);
  readonly #accountService = inject(AccountsService);

  readonly classroomDetails = this.#classroomsService.select.classroomDetails;
  readonly classroomsLoading = this.#classroomsService.select.classroomsLoading;
  readonly account = this.#accountService.select.account;
  readonly theme = this.#themeService.theme;

  readonly Themes = Themes;
  readonly subscriptionPlans = subscriptionPlans;
  readonly displayedColumns = ['label', 'description', 'actions'];

  viewClassroom(id: string) {
    this.#router.navigate(['/classrooms', id]);
  }

  createClassroom() {
    this.#classroomsService.createClassroom().subscribe((classroomDetail) => {
      if (classroomDetail) {
        this.viewClassroom(classroomDetail.id);
      }
    });
  }

  openDeleteClassroomModal(classroomDetail: ClassroomDetail) {
    this.#classroomPageService.openDeleteClassroomDialog(classroomDetail);
  }
}
