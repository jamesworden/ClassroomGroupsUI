import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  Signal,
  signal,
  ViewChild,
} from '@angular/core';
import { ResizableSide } from '../../directives/resizeable.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ClassroomsService, Configuration } from '@shared/classrooms';
import { AccountsService } from '@shared/accounts';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configurations-panel',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatListModule,
    MatSnackBarModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    CommonModule,
  ],
  templateUrl: './configurations-panel.component.html',
  styleUrl: './configurations-panel.component.scss',
})
export class ConfigurationsPanelComponent {
  readonly #matSnackBar = inject(MatSnackBar);
  readonly #classroomsService = inject(ClassroomsService);
  readonly #accountsService = inject(AccountsService);

  @ViewChild('scrollContainer')
  scrollContainer: ElementRef<HTMLElement> | undefined;

  @ViewChild('addConfigurationInput')
  addConfigurationInput: ElementRef<HTMLInputElement> | undefined;

  readonly selectedConfigurationId = input<string>();
  readonly classroomId = input<string>();

  readonly configurationIdSelected = output<string>();

  readonly configurations = computed(() =>
    this.#classroomsService.select.configurations(this.classroomId())()
  );

  readonly ResizableSide = ResizableSide;
  readonly searchQuery = signal('');
  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly configurationsLoading =
    this.#classroomsService.select.configurationsLoading;
  readonly addingConfiguration = signal<boolean>(false);
  readonly account = this.#accountsService.select.account;

  createConfigurationLabel = '';

  readonly filteredConfigurations: Signal<Configuration[]> = computed(
    () =>
      this.configurations()?.filter(({ label }) =>
        label.toLowerCase().includes(this.searchQuery())
      ) ?? []
  );

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    const clickedInput =
      this.addConfigurationInput?.nativeElement.contains(clickedElement);
    if (clickedInput) {
      return;
    }

    this.stopAddingConfiguration();
  }

  selectConfiguration(configurationId: string) {
    this.configurationIdSelected.emit(configurationId);
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
    this.stopAddingConfiguration();
  }

  startAddingConfiguration() {
    setTimeout(() => {
      this.addConfigurationInput?.nativeElement.focus();
    });
    this.addingConfiguration.set(true);
  }

  stopAddingConfiguration() {
    this.addingConfiguration.set(false);
  }
}
