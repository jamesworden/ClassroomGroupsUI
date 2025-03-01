import { Component, inject, input } from '@angular/core';
import {
  Classroom,
  ColumnDetail,
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
  readonly #configurationPreviewService = inject(ConfigurationTextViewService);

  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly classroom = input.required<Classroom>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly defaultGroup = input.required<GroupDetail>();

  readonly showUngroupedStudents =
    this.#configurationPreviewService.showUngroupedStudents;
  readonly showGroupNames = this.#configurationPreviewService.showGroupNames;
  readonly visibleFieldIds = this.#configurationPreviewService.visibleFieldIds;
  readonly isTextModified = this.#configurationPreviewService.isTextModified;
  readonly editableText = this.#configurationPreviewService.editableText;
  readonly showingCopiedTimeout =
    this.#configurationPreviewService.showingCopiedTimeout;
  readonly showingCopiedMessage =
    this.#configurationPreviewService.showingCopiedMessage;
  readonly characterCount = this.#configurationPreviewService.characterCount;
  readonly lineCount = this.#configurationPreviewService.lineCount;

  updateEditableText(event: Event) {
    this.#configurationPreviewService.updateEditableText(event);
  }

  regenerateText() {
    this.#configurationPreviewService.regenerateText();
  }

  toggleShowGroupNames() {
    this.showGroupNames.set(!this.showGroupNames());
  }

  toggleShowUngroupedStudents() {
    this.showUngroupedStudents.set(!this.showUngroupedStudents());
  }

  toggleVisibleField(fieldId: string, { checked }: MatSlideToggleChange) {
    const visibleFieldIds = new Set(this.visibleFieldIds());
    checked ? visibleFieldIds.add(fieldId) : visibleFieldIds.delete(fieldId);
    this.visibleFieldIds.set(Array.from(visibleFieldIds));
  }

  copyText() {
    this.#clipboard.copy(this.editableText());
    this.brieflyShowCopiedMessage();
  }

  brieflyShowCopiedMessage() {
    if (this.showingCopiedTimeout()) {
      window.clearTimeout(this.showingCopiedTimeout());
    }
    this.showingCopiedMessage.set(true);

    this.showingCopiedTimeout.set(
      window.setTimeout(() => {
        this.showingCopiedMessage.set(false);
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
