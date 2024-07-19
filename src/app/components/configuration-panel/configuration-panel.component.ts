import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Store } from '@ngrx/store';
import {
  selectViewingClassroomId,
  selectViewingConfiguration,
  selectViewingConfigurationId,
} from '../../state/classrooms/classrooms.selectors';
import {
  updateConfigurationDescription,
  updateConfigurationLabel,
} from '../../state/classrooms/classrooms.actions';

@Component({
  selector: 'app-configuration-panel',
  standalone: true,
  imports: [
    MatSlideToggleModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './configuration-panel.component.html',
  styleUrl: './configuration-panel.component.scss',
})
export class ConfigurationPanelComponent {
  readonly #store = inject(Store);

  readonly viewingConfiguration = toSignal(
    this.#store.select(selectViewingConfiguration)
  );

  readonly viewingClassroomId = toSignal(
    this.#store.select(selectViewingClassroomId),
    {
      initialValue: '',
    }
  );

  readonly viewingConfigurationId = toSignal(
    this.#store.select(selectViewingConfigurationId),
    {
      initialValue: '',
    }
  );

  averageScores = false;
  groupingByDivision = false;
  groupingValue = 0;
  updatedDescription = '';
  updatedLabel = '';

  constructor() {
    effect(
      () =>
        (this.updatedDescription =
          this.viewingConfiguration()?.description ?? '')
    );
    effect(
      () => (this.updatedLabel = this.viewingConfiguration()?.label ?? '')
    );
  }

  toggleGroupingType() {
    this.groupingByDivision = !this.groupingByDivision;
  }

  updateDescription() {
    this.#store.dispatch(
      updateConfigurationDescription({
        classroomId: this.viewingClassroomId(),
        description: this.updatedDescription,
        configurationId: this.viewingConfigurationId(),
      })
    );
  }

  updateLabel() {
    this.#store.dispatch(
      updateConfigurationLabel({
        classroomId: this.viewingClassroomId(),
        label: this.updatedLabel,
        configurationId: this.viewingConfigurationId(),
      })
    );
  }
}
