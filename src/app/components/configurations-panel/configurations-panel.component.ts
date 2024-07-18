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
import { Store } from '@ngrx/store';
import { ClassroomsState } from '../../state/classrooms/classrooms.reducer';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  selectViewingClassroom,
  selectViewingClassroomId,
  selectViewingConfigurationId,
} from '../../state/classrooms/classrooms.selectors';
import { ClassroomConfiguration } from '../../models/classroom.models';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import {
  addConfiguration,
  viewConfiguration,
} from '../../state/classrooms/classrooms.actions';
import { mergeMap, tap } from 'rxjs';
import { MatInputModule } from '@angular/material/input';

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
  ],
  templateUrl: './configurations-panel.component.html',
  styleUrl: './configurations-panel.component.scss',
})
export class ConfigurationsPanelComponent {
  readonly ResizableSide = ResizableSide;

  readonly #store = inject(Store<{ state: ClassroomsState }>);
  readonly #matSnackBar = inject(MatSnackBar);

  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLElement>;

  readonly viewingConfigurationId = toSignal(
    this.#store.select(selectViewingConfigurationId),
    {
      initialValue: '',
    }
  );

  readonly viewingClassroom = toSignal(
    this.#store.select(selectViewingClassroom)
  );

  readonly searchQuery = signal('');

  readonly viewingClassroomId = toSignal(
    this.#store.select(selectViewingClassroomId),
    {
      initialValue: '',
    }
  );

  addConfigurationLabel = '';

  readonly filteredConfigurations: Signal<ClassroomConfiguration[]> = computed(
    () =>
      this.viewingClassroom()?.configurations.filter(({ label }) =>
        label.toLowerCase().includes(this.searchQuery())
      ) ?? []
  );

  selectConfiguration(configurationId: string) {
    this.#store.dispatch(viewConfiguration({ configurationId }));
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
    this.#store.dispatch(
      addConfiguration({
        configurationLabel: this.addConfigurationLabel,
        classroomId: this.viewingClassroomId(),
      })
    );
    this.addConfigurationLabel = '';
    this.#matSnackBar.open('Configuration created.', 'Hide', {
      duration: 3000,
    });
    // TODO: Turn into an ofActionSuccessful
    setTimeout(() => {
      this.scrollContainer.nativeElement.scrollTo({
        top: this.scrollContainer.nativeElement.scrollHeight,
        behavior: 'smooth',
      });
    });
  }
}
