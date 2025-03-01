import { Component, input, output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClassroomDetail } from '@shared/classrooms';

@Component({
  selector: 'app-classroom-card',
  templateUrl: './classroom-card.component.html',
  styleUrls: ['./classroom-card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
})
export class ClassroomCardComponent {
  classroom = input.required<ClassroomDetail>();

  viewed = output();
  deleted = output();

  viewClassroom() {
    this.viewed.emit();
  }

  deleteClassroom() {
    this.deleted.emit();
  }
}
