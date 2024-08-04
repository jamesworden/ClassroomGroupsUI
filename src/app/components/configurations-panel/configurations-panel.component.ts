import {
  Component,
  computed,
  ElementRef,
  inject,
  Signal,
  signal,
  ViewChild,
} from '@angular/core';
import {
  ResizeableDirective,
  ResizableSide,
} from '../../directives/resizeable.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Configuration } from '../../models/classroom.models';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ClassroomsService } from '../../classrooms.service';

@Component({
  selector: 'app-configurations-panel',
  standalone: true,
  imports: [
    ResizeableDirective,
    MatFormFieldModule,
    MatListModule,
    MatSnackBarModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './configurations-panel.component.html',
  styleUrl: './configurations-panel.component.scss',
})
export class ConfigurationsPanelComponent {
  readonly #matSnackBar = inject(MatSnackBar);
  readonly #classroomsService = inject(ClassroomsService);

  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLElement>;

  readonly classrooms = this.#classroomsService.classrooms;
  readonly viewingClassroomId = this.#classroomsService.viewingClassroomId;
  readonly viewingClassroom = this.#classroomsService.viewingClassroom;
  readonly viewingConfiguration = this.#classroomsService.viewingConfiguration;
  readonly viewingConfigurationId =
    this.#classroomsService.viewingConfigurationId;
  readonly viewingConfigurations =
    this.#classroomsService.viewingConfigurations;
  readonly ResizableSide = ResizableSide;
  readonly searchQuery = signal('');

  addConfigurationLabel = '';

  readonly filteredConfigurations: Signal<Configuration[]> = computed(
    () =>
      this.viewingConfigurations().filter(({ label }) =>
        label.toLowerCase().includes(this.searchQuery())
      ) ?? []
  );

  constructor() {
    this.#classroomsService.addedConfiguration$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        setTimeout(() => {
          this.scrollContainer.nativeElement.scrollTo({
            top: this.scrollContainer.nativeElement.scrollHeight,
            behavior: 'smooth',
          });
          this.#matSnackBar.open('Configuration created', 'Hide', {
            duration: 3000,
          });
        });
      });
  }

  selectConfiguration(configurationId: string) {
    this.#classroomsService.viewConfiguration(configurationId);
  }

  addConfiguration() {
    if (this.addConfigurationLabel.trim().length <= 0) {
      this.#matSnackBar.open(
        'Please enter the name of the configuration.',
        'Hide',
        {
          duration: 3000,
        }
      );
      return;
    }
    this.#classroomsService.addConfiguration(
      this.viewingClassroomId() ?? '',
      this.addConfigurationLabel
    );
    this.addConfigurationLabel = '';
  }
}
