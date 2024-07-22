import { Component, input } from '@angular/core';
import { ClassroomGroup } from '../../models/classroom.models';

@Component({
  selector: 'app-group-panel',
  standalone: true,
  imports: [],
  templateUrl: './group-panel.component.html',
  styleUrl: './group-panel.component.scss',
})
export class GroupPanelComponent {
  group = input<ClassroomGroup>();
}
