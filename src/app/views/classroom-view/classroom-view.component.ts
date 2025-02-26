import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AccountsService } from '@shared/accounts';
import { calculateAverageScores, ClassroomsService } from '@shared/classrooms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConfigurationsPanelComponent } from './configurations-panel/configurations-panel.component';
import { Themes, ThemeService } from '@app/themes';
import { ConfigurationViewComponent } from './configuration-view/configuration-view.component';
import { ClassroomHeaderComponent } from './classroom-header/classroom-header.component';
import { ConfigurationViewMode } from '@app/models';
import { ConfigurationPreviewComponent } from './configuration-preview/configuration-preview.component';
import { CommonModule } from '@angular/common';
import { ClassroomViewService } from './classroom-view.service';
import { MobileWarningViewComponent } from './mobile-warning-view/mobile-warning-view.component';
import { NoSelectedConfigurationViewComponent } from './no-selected-configuration-view/no-selected-configuration-view.component';
import { ClassroomNotFoundViewComponent } from './classroom-not-found-view/classroom-not-found-view.component';

@Component({
  selector: 'app-classroom-view',
  imports: [
    CommonModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    ConfigurationsPanelComponent,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    ConfigurationViewComponent,
    ClassroomHeaderComponent,
    ConfigurationPreviewComponent,
    MobileWarningViewComponent,
    NoSelectedConfigurationViewComponent,
    ClassroomNotFoundViewComponent,
  ],
  providers: [ClassroomViewService],
  templateUrl: './classroom-view.component.html',
  styleUrl: './classroom-view.component.scss',
})
export class ClassroomViewComponent {
  readonly #themeService = inject(ThemeService);
  readonly #classroomsService = inject(ClassroomsService);
  readonly #accountsService = inject(AccountsService);
  readonly #classroomViewService = inject(ClassroomViewService);

  readonly theme = this.#themeService.theme;
  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly accountLoading = this.#accountsService.select.accountLoading;
  readonly account = this.#accountsService.select.account;
  readonly classroomId = this.#classroomViewService.classroomId;
  readonly configurationId = this.#classroomViewService.configurationId;
  readonly configurationViewMode =
    this.#classroomViewService.configurationViewMode;
  readonly maxStudentsPerClassroom =
    this.#accountsService.select.maxStudentsPerClassroom;

  readonly classroom = computed(() =>
    this.#classroomsService.select.classroomDetail(this.classroomId())()
  );
  readonly configurationDetail = computed(() =>
    this.#classroomsService.select.configurationDetail(this.configurationId())()
  );
  readonly configurationLoading = computed(() =>
    this.#classroomsService.select.configurationLoading(
      this.configurationId()
    )()
  );
  readonly listGroupDetails = computed(() =>
    this.#classroomsService.select.listGroupDetails(this.configurationId())()
  );
  readonly configurationUpdating = computed(() =>
    this.#classroomsService.select.configurationUpdating(
      this.configurationId()
    )()
  );
  readonly classroomUpdating = computed(() =>
    this.#classroomsService.select.classroomUpdating(this.classroomId())()
  );
  readonly classroomLabel = computed(() => this.classroom()?.label ?? '');
  readonly classroomDescription = computed(
    () => this.classroom()?.description ?? ''
  );
  readonly defaultGroup = computed(() =>
    this.#classroomsService.select.defaultGroup(this.configurationId())()
  );
  readonly columnDetails = computed(() =>
    this.#classroomsService.select.columnDetails(
      this.defaultGroup()?.configurationId
    )
  );
  readonly allGroupDetails = computed(() => {
    const listGroupDetails = this.listGroupDetails();
    const defaultGroupDetail = this.defaultGroup();
    if (defaultGroupDetail) {
      return [defaultGroupDetail, ...listGroupDetails];
    } else {
      return listGroupDetails;
    }
  });
  readonly allStudentDetails = computed(() =>
    this.allGroupDetails().flatMap(({ studentDetails }) => studentDetails)
  );
  readonly averageScores = computed(() =>
    calculateAverageScores(this.allStudentDetails(), this.columnDetails())
  );
  readonly anyAverageScores = computed(
    () => Object.keys(this.averageScores()).length > 0
  );

  readonly ConfigurationViewMode = ConfigurationViewMode;
  readonly Themes = Themes;

  openDeleteConfigurationModal(configurationId: string) {
    const classroomId = this.classroomId();
    if (!classroomId) {
      return;
    }
    const configuration = this.#classroomsService.select.configuration(
      classroomId,
      configurationId
    )();
    if (!configuration) {
      return;
    }
    this.#classroomViewService.openDeleteConfigurationModal(configuration);
  }
}
