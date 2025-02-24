import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ColumnDetail } from '@shared/classrooms';

@Component({
  selector: 'app-average-scores-panel',
  imports: [CommonModule],
  templateUrl: './average-scores-panel.component.html',
  styleUrl: './average-scores-panel.component.scss',
})
export class AverageScoresPanelComponent {
  readonly averageScores = input.required<Record<string, number>>();
  readonly columnDetails = input.required<ColumnDetail[]>();
}
