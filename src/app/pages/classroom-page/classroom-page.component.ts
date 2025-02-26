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
import { ClassroomViewComponent } from './classroom-view/classroom-view.component';

@Component({
  selector: 'app-classroom-page',
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
    MobileWarningViewComponent,
    ClassroomNotFoundViewComponent,
    ClassroomViewComponent,
  ],
  providers: [ClassroomViewService],
  templateUrl: './classroom-page.component.html',
  styleUrl: './classroom-page.component.scss',
})
export class ClassroomPageComponent {
  readonly #themeService = inject(ThemeService);
  readonly #classroomsService = inject(ClassroomsService);
  readonly #accountsService = inject(AccountsService);
  readonly #classroomViewService = inject(ClassroomViewService);

  readonly classroomId = this.#classroomViewService.classroomId;
  readonly configurationId = this.#classroomViewService.configurationId;

  readonly classroomDetail = computed(() =>
    this.#classroomsService.select.classroomDetail(this.classroomId())()
  );
  readonly configurationDetail = computed(() =>
    this.#classroomsService.select.configurationDetail(this.configurationId())()
  );
}
