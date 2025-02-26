import {
  Component,
  computed,
  inject,
  input,
  output,
  Signal,
  signal,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
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
import { MatDialog } from '@angular/material/dialog';
import { CreateEditConfigurationDialogComponent } from '@app/components';
import {
  CreateEditColumnDialogInputs,
  CreateEditColumnDialogOutputs,
} from '../configuration-view/create-edit-column-dialog/create-edit-column-dialog.component';
import { ClassroomPageService } from '../classroom-view.service';

@Component({
  selector: 'app-configurations-panel',
  imports: [
    MatFormFieldModule,
    MatListModule,
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
  readonly #classroomsService = inject(ClassroomsService);
  readonly #accountsService = inject(AccountsService);
  readonly #matDialog = inject(MatDialog);
  readonly #classroomViewService = inject(ClassroomPageService);

  readonly classroomId = input.required<string>();

  readonly filteredConfigurations: Signal<Configuration[]> = computed(
    () =>
      this.configurations()?.filter(({ label }) =>
        label.toLowerCase().includes(this.searchQuery())
      ) ?? []
  );
  readonly configurations = computed(() =>
    this.#classroomsService.select.configurations(this.classroomId())()
  );

  readonly selectedConfigurationId = this.#classroomViewService.configurationId;
  readonly account = this.#accountsService.select.account;
  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly configurationsLoading =
    this.#classroomsService.select.configurationsLoading;

  readonly searchQuery = signal('');

  selectConfiguration(configurationId: string) {
    this.#classroomViewService.selectConfiguration(configurationId);
  }

  openCreateConfigurationModal() {
    const dialogRef = this.#matDialog.open(
      CreateEditConfigurationDialogComponent,
      {
        restoreFocus: false,
        data: <CreateEditColumnDialogInputs>{
          title: 'Create configuration',
        },
      }
    );
    dialogRef
      .afterClosed()
      .subscribe((outputs?: CreateEditColumnDialogOutputs) => {
        if (outputs) {
          this.#classroomsService.createConfiguration(
            this.classroomId(),
            outputs.label
          );
        }
      });
  }

  openDeleteConfigurationModal(configurationId: string) {
    const classroomId = this.classroomId();
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
