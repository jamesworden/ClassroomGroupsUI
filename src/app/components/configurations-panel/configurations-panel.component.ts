import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
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
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  ClassroomsService,
  Configuration,
  ConfigurationViewModel,
} from '@shared/classrooms';
import { AccountsService } from '@shared/accounts';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatTooltipModule,
  ],
  templateUrl: './configurations-panel.component.html',
  styleUrl: './configurations-panel.component.scss',
})
export class ConfigurationsPanelComponent {
  readonly #matSnackBar = inject(MatSnackBar);
  readonly #classroomsService = inject(ClassroomsService);
  readonly #accountsService = inject(AccountsService);

  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLElement>;

  readonly configurationId = input<string>();
  readonly classroomId = input<string>();

  readonly configurationDetail = computed(() =>
    this.#classroomsService.configurationDetail()
  );

  readonly ResizableSide = ResizableSide;
  readonly searchQuery = signal('');
  readonly isLoggedIn = this.#accountsService.isLoggedIn;

  createConfigurationLabel = '';

  readonly filteredConfigurations: Signal<Configuration[]> = computed(() =>
    // this.viewingConfigurations().filter(({ label }) =>
    //   label.toLowerCase().includes(this.searchQuery())
    // ) ??
    []
  );

  constructor() {
    // this.#classroomsService.addedConfiguration$
    //   .pipe(takeUntilDestroyed())
    //   .subscribe(() => {
    //     setTimeout(() => {
    //       this.scrollContainer.nativeElement.scrollTo({
    //         top: this.scrollContainer.nativeElement.scrollHeight,
    //         behavior: 'smooth',
    //       });
    //       this.#matSnackBar.open('Configuration created', 'Hide', {
    //         duration: 3000,
    //       });
    //     });
    //   });
  }

  selectConfiguration(configurationId: string) {
    // this.#classroomsService.viewConfiguration(configurationId);
  }

  createConfiguration() {
    if (this.createConfigurationLabel.trim().length <= 0) {
      this.#matSnackBar.open(
        'Please enter the name of the configuration.',
        'Hide',
        {
          duration: 3000,
        }
      );
      return;
    }
    this.#classroomsService.createConfiguration(
      this.classroomId()!,
      this.createConfigurationLabel
    );
    this.createConfigurationLabel = '';
  }
}
