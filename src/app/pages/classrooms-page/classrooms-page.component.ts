import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
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
import { ClassroomsPageService } from './classrooms-page.service';
import { ClassroomCardComponent } from './classroom-card/classroom-card.component';

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
    CommonModule,
    SubscriptionPlanCardComponent,
    ToggleThemeButtonComponent,
    AccountMenuButtonComponent,
    CodeLinksMenuButtonComponent,
    ClassroomCardComponent,
  ],
  templateUrl: './classrooms-page.component.html',
  styleUrl: './classrooms-page.component.scss',
  providers: [ClassroomsPageService],
})
export class ClassroomsPageComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #router = inject(Router);
  readonly #themeService = inject(ThemeService);
  readonly #accountService = inject(AccountsService);
  readonly #classroomsPageService = inject(ClassroomsPageService);

  readonly classroomDetails = this.#classroomsService.select.classroomDetails;
  readonly classroomsLoading = this.#classroomsService.select.classroomsLoading;
  readonly account = this.#accountService.select.account;
  readonly theme = this.#themeService.theme;
  readonly reachedClassroomLimit =
    this.#classroomsPageService.reachedClassroomLimit;

  readonly Themes = Themes;
  readonly subscriptionPlans = subscriptionPlans;
  readonly displayedColumns = ['label', 'description', 'actions'];
  readonly fullYear = new Date().getFullYear();

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

  openDeleteClassroomDialog(classroomDetail: ClassroomDetail) {
    this.#classroomsPageService.openDeleteClassroomDialog(classroomDetail);
  }
}
