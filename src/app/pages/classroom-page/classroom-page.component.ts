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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConfigurationsPanelComponent } from './configurations-panel/configurations-panel.component';
import { CommonModule } from '@angular/common';
import { ClassroomPageService } from './classroom-page.service';
import { MobileWarningViewComponent } from './mobile-warning-view/mobile-warning-view.component';
import { ClassroomNotFoundViewComponent } from './classroom-not-found-view/classroom-not-found-view.component';
import { ClassroomViewComponent } from './classroom-view/classroom-view.component';
import { ClassroomsService } from '@shared/classrooms';
import { ConfigurationTextViewService } from './classroom-view/configuration-text-view/configuration-text-view.service';
import { ConfigurationVisualizeService } from './classroom-view/configuration-visualize/configuration-visualize.service';

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
  providers: [
    ClassroomPageService,
    ConfigurationTextViewService,
    ConfigurationVisualizeService,
  ],
  templateUrl: './classroom-page.component.html',
  styleUrl: './classroom-page.component.scss',
})
export class ClassroomPageComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #classroomPageService = inject(ClassroomPageService);

  readonly classroomId = this.#classroomPageService.classroomId;
  readonly configurationId = this.#classroomPageService.configurationId;
  readonly sidenavOpen = this.#classroomPageService.sidenavOpen;

  readonly classroomDetail = computed(() =>
    this.#classroomsService.select.classroomDetail(this.classroomId())()
  );
  readonly configurationDetail = computed(() =>
    this.#classroomsService.select.configurationDetail(this.configurationId())()
  );

  toggleSidenavOpen() {
    this.#classroomPageService.setSidenavOpen(!this.sidenavOpen());
  }
}
