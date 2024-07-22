import { Component, input } from '@angular/core';
import { ClassroomGroup } from '../../models/classroom.models';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-group-panel',
  standalone: true,
  imports: [MatIconModule, MatCheckboxModule, MatButtonModule],
  templateUrl: './group-panel.component.html',
  styleUrl: './group-panel.component.scss',
})
export class GroupPanelComponent {
  group = input<ClassroomGroup>();

  addStudent() {}

  deleteGroup() {}
}
