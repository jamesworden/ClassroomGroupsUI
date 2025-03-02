import { Component, inject, input } from '@angular/core';
import {
  Classroom,
  ColumnDetail,
  ColumnViewModel,
  ConfigurationDetail,
  GroupDetail,
} from '@shared/classrooms';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { MatMenuModule } from '@angular/material/menu';
import { ColumnListComponent } from '../column-list/column-list.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfigurationTextViewService } from './configuration-text-view.service';

@Component({
  selector: 'app-configuration-text-view',
  imports: [
    MatChipsModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    CommonModule,
    ClipboardModule,
    MatMenuModule,
    ColumnListComponent,
    MatTooltipModule,
  ],
  templateUrl: './configuration-text-view.component.html',
  styleUrl: './configuration-text-view.component.scss',
})
export class ConfigurationTextViewComponent {
  readonly #clipboard = inject(Clipboard);
  readonly #configurationTextViewService = inject(ConfigurationTextViewService);

  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly classroom = input.required<Classroom>();
  readonly columnDetails = input.required<ColumnViewModel[]>();
  readonly defaultGroup = input.required<GroupDetail>();

  readonly showUngroupedStudents =
    this.#configurationTextViewService.showUngroupedStudents;
  readonly showGroupNames = this.#configurationTextViewService.showGroupNames;
  readonly visibleFieldIds = this.#configurationTextViewService.visibleFieldIds;
  readonly isTextModified = this.#configurationTextViewService.isTextModified;
  readonly editableText = this.#configurationTextViewService.editableText;
  readonly showingCopiedTimeout =
    this.#configurationTextViewService.showingCopiedTimeout;
  readonly showingCopiedMessage =
    this.#configurationTextViewService.showingCopiedMessage;
  readonly characterCount = this.#configurationTextViewService.characterCount;
  readonly lineCount = this.#configurationTextViewService.lineCount;

  updateEditableText(event: Event) {
    this.#configurationTextViewService.updateEditableText(event);
  }

  regenerateText() {
    this.#configurationTextViewService.regenerateText();
  }

  toggleShowGroupNames() {
    this.#configurationTextViewService.setShowGroupNames(
      !this.showGroupNames()
    );
  }

  toggleShowUngroupedStudents() {
    this.#configurationTextViewService.setShowUngroupedStudents(
      !this.showUngroupedStudents()
    );
  }

  toggleVisibleField(fieldId: string, { checked }: MatSlideToggleChange) {
    const visibleFieldIds = new Set(this.visibleFieldIds());
    checked ? visibleFieldIds.add(fieldId) : visibleFieldIds.delete(fieldId);
    this.#configurationTextViewService.setVisibleFieldIds(
      Array.from(visibleFieldIds)
    );
  }

  copyText() {
    this.#clipboard.copy(this.editableText());
    this.brieflyShowCopiedMessage();
  }

  brieflyShowCopiedMessage() {
    if (this.showingCopiedTimeout()) {
      window.clearTimeout(this.showingCopiedTimeout());
    }
    this.#configurationTextViewService.setShowingCopiedMessage(true);

    this.#configurationTextViewService.setShowingCopiedTimeout(
      window.setTimeout(() => {
        this.#configurationTextViewService.setShowingCopiedMessage(false);
      }, 3000)
    );
  }

  exportToTextFile() {
    const blob = new Blob([this.editableText()], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = this.configurationDetail().label || 'Groups';
    a.download = `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
