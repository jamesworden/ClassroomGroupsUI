import { Component, computed, inject, input, output } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  calculateAverageScores,
  ClassroomDetail,
  ClassroomsService,
} from '@shared/classrooms';
import { ClassroomPageService } from '../classroom-page.service';
import { AccountsService } from '@shared/accounts';
import { Themes, ThemeService } from '@app/themes';
import { ConfigurationViewMode } from '@app/models';
import { ClassroomHeaderComponent } from './classroom-header/classroom-header.component';
import { ConfigurationViewComponent } from './configuration-view/configuration-view.component';
import { ConfigurationPreviewComponent } from './configuration-preview/configuration-preview.component';
import { NoSelectedConfigurationViewComponent } from './no-selected-configuration-view/no-selected-configuration-view.component';

@Component({
  selector: 'app-classroom-view',
  imports: [
    ClassroomHeaderComponent,
    ConfigurationPreviewComponent,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    ConfigurationViewComponent,
    NoSelectedConfigurationViewComponent,
  ],
  templateUrl: './classroom-view.component.html',
  styleUrl: './classroom-view.component.scss',
})
export class ClassroomViewComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #classroomViewService = inject(ClassroomPageService);
  readonly #accountsService = inject(AccountsService);
  readonly #themeService = inject(ThemeService);

  readonly classroomDetail = input.required<ClassroomDetail>();
  readonly sidenavOpen = input.required<boolean>();

  readonly sidenavToggled = output();

  readonly configurationId = this.#classroomViewService.configurationId;
  readonly configurationViewMode =
    this.#classroomViewService.configurationViewMode;
  readonly maxStudentsPerClassroom =
    this.#accountsService.select.maxStudentsPerClassroom;
  readonly theme = this.#themeService.theme;
  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly accountLoading = this.#accountsService.select.accountLoading;
  readonly account = this.#accountsService.select.account;

  readonly classroomId = computed(() => this.classroomDetail().id);
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
  readonly classroomLabel = computed(() => this.classroomDetail()?.label ?? '');
  readonly classroomDescription = computed(
    () => this.classroomDetail()?.description ?? ''
  );
  readonly defaultGroup = computed(() =>
    this.#classroomsService.select.defaultGroup(this.configurationId())()
  );
  readonly columnDetails = computed(() =>
    this.#classroomsService.select.columnDetails(
      this.defaultGroup()?.configurationId
    )
  );
  readonly configurationDetail = computed(() =>
    this.#classroomsService.select.configurationDetail(this.configurationId())()
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

  toggleSidenav() {
    this.sidenavToggled.emit();
  }
}
