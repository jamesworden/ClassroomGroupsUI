import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  Signal,
  signal,
  ViewChild,
} from '@angular/core';
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
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';

@Component({
  selector: 'app-configurations-panel',
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
    CdkContextMenuTrigger,
    CdkMenu,
    CdkMenuItem,
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
  readonly classroomId = input.required<string>();

  readonly configurationIdSelected = output<string>();
  readonly deletedConfiguration = output<string>();

  readonly filteredConfigurations: Signal<Configuration[]> = computed(
    () =>
      this.configurations()?.filter(({ label }) =>
        label.toLowerCase().includes(this.searchQuery())
      ) ?? []
  );
  readonly configurations = computed(() =>
    this.#classroomsService.select.configurations(this.classroomId())()
  );

  readonly account = this.#accountsService.select.account;
  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly configurationsLoading =
    this.#classroomsService.select.configurationsLoading;

  readonly searchQuery = signal('');
  readonly addingConfiguration = signal(false);

  createConfigurationLabel = '';

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

  deleteConfiguration(configurationId: string) {
    this.deletedConfiguration.emit(configurationId);
  }
}
