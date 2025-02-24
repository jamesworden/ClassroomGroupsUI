import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import {
  Classroom,
  ColumnDetail,
  ConfigurationDetail,
  FieldType,
  GroupDetail,
} from '@shared/classrooms';
import { MatChipsModule } from '@angular/material/chips';
import { ColumnListComponent } from '../column-list/column-list.component';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-configuration-preview',
  imports: [
    MatChipsModule,
    ColumnListComponent,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    CommonModule,
    ClipboardModule,
  ],
  templateUrl: './configuration-preview.component.html',
  styleUrl: './configuration-preview.component.scss',
})
export class ConfigurationPreviewComponent {
  readonly #clipboard = inject(Clipboard);

  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly classroom = input.required<Classroom>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly defaultGroup = input.required<GroupDetail>();

  @ViewChild('textVisualization')
  textVisualization?: ElementRef<HTMLElement>;

  readonly showGroupNames = signal(true);
  readonly showUngroupedStudents = signal(true);
  readonly underlineGroupNames = signal(true);

  visibleColumnIds = new Set<string>();

  constructor() {
    effect(() => {
      this.visibleColumnIds.clear();
      const firstTextColumn = this.columnDetails().find(
        ({ type }) => type === FieldType.TEXT
      );
      if (firstTextColumn) {
        this.visibleColumnIds.add(firstTextColumn.id);
      }
    });
  }

  toggleShowGroupNames() {
    this.showGroupNames.set(!this.showGroupNames());
  }

  toggleShowUngroupedStudents() {
    this.showUngroupedStudents.set(!this.showUngroupedStudents());
  }

  toggleUnderlineGroupNames() {
    this.underlineGroupNames.set(!this.underlineGroupNames());
  }

  toggleVisibleColumn(columnId: string, { checked }: MatSlideToggleChange) {
    checked
      ? this.visibleColumnIds.add(columnId)
      : this.visibleColumnIds.delete(columnId);
  }

  copyText() {
    if (this.textVisualization) {
      // Get all text nodes while preserving structure
      const textElements =
        this.textVisualization.nativeElement.querySelectorAll('h6, li');
      let textParts: string[] = [];

      textElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        // Handle headers (group names)
        if (htmlElement.tagName.toLowerCase() === 'h6') {
          textParts.push(htmlElement.textContent?.trim() || '');
          textParts.push(''); // Add blank line after header
        }
        // Handle list items
        else if (htmlElement.tagName.toLowerCase() === 'li') {
          textParts.push(htmlElement.textContent?.trim() || '');
        }
      });

      // Join with Windows-style line endings for cross-platform compatibility
      const formattedText = textParts.join('\r\n');

      // Copy to clipboard
      this.#clipboard.copy(formattedText);
      console.log('Formatted text copied:', formattedText);
    }
  }
}
