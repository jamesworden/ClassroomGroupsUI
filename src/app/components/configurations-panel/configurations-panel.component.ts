import { Component } from '@angular/core';
import {
  ResizeableDirective,
  ResizableSide,
} from '../../directives/resizeable.directive';

@Component({
  selector: 'app-configurations-panel',
  standalone: true,
  imports: [ResizeableDirective],
  templateUrl: './configurations-panel.component.html',
  styleUrl: './configurations-panel.component.scss',
})
export class ConfigurationsPanelComponent {
  readonly ResizableSide = ResizableSide;
}
