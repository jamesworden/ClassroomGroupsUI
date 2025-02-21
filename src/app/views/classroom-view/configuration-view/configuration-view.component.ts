import { Component, inject, input, output } from '@angular/core';
import { GroupPanelComponent } from './group-panel/group-panel.component';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { ConfigurationPanelBottomComponent } from './configuration-panel-bottom/configuration-panel-bottom.component';
import { ConfigurationPanelTopComponent } from './configuration-panel-top/configuration-panel-top.component';
import {
  ClassroomsService,
  ColumnDetail,
  ConfigurationDetail,
  Group,
  GroupDetail,
  StudentDetail,
  StudentField,
} from '@shared/classrooms';
import { MoveStudentDetail } from 'shared/classrooms/lib/models/move-student-detail';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AddGroupPanelComponent } from './add-group-panel/add-group-panel.component';
import { AverageScoresPanelComponent } from './average-scores-panel/average-scores-panel.component';

@Component({
  selector: 'app-configuration-view',
  imports: [
    GroupPanelComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    ConfigurationPanelBottomComponent,
    ConfigurationPanelTopComponent,
    CommonModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    AddGroupPanelComponent,
    AverageScoresPanelComponent,
  ],
  templateUrl: './configuration-view.component.html',
  styleUrl: './configuration-view.component.scss',
})
export class ConfigurationViewComponent {
  readonly #classroomsService = inject(ClassroomsService);

  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly defaultGroup = input.required<GroupDetail>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly collapsePanelDetails = input.required<boolean>();
  readonly classroomId = input.required<string>();
  readonly groupDetails = input.required<GroupDetail[]>();
  readonly groupLimitReached = input.required<boolean>();
  readonly anyAverageScores = input.required<boolean>();
  readonly averageScores = input.required<Record<string, number>>();

  readonly deleteConfigurationModalOpened = output<string>();
  readonly studentPositionUpdated = output<MoveStudentDetail>();
  readonly groupDropped = output<CdkDragDrop<Group[]>>();

  updateConfigurationLabel(label: string) {
    this.#classroomsService.patchConfiguration(
      this.classroomId(),
      this.configurationDetail().id,
      label,
      this.configurationDetail().description
    );
  }

  updateConfigurationDescription(description: string) {
    this.#classroomsService.patchConfiguration(
      this.classroomId(),
      this.configurationDetail().id,
      this.configurationDetail().label,
      description
    );
  }

  openDeleteConfigurationModal(configurationId: string) {
    this.deleteConfigurationModalOpened.emit(configurationId);
  }

  updateStudentField(studentField: StudentField) {
    this.#classroomsService.upsertStudentField(
      this.classroomId(),
      studentField
    );
  }

  deleteStudent(studentDetail: StudentDetail) {
    this.#classroomsService.deleteStudent(this.classroomId(), studentDetail.id);
  }

  updateStudentPosition(position: MoveStudentDetail) {
    this.studentPositionUpdated.emit(position);
  }

  dropGroup(event: CdkDragDrop<Group[]>) {
    this.groupDropped.emit(event);
  }

  deleteGroup(groupId: string) {
    this.#classroomsService.deleteGroup(
      this.classroomId(),
      this.configurationDetail().id,
      groupId
    );
  }

  createStudent(groupId: string) {
    this.#classroomsService.createStudent(
      this.classroomId(),
      this.configurationDetail().id,
      groupId
    );
  }

  updateGroupLabel(group: GroupDetail, label: string) {
    this.#classroomsService.patchGroup(
      this.classroomId(),
      this.configurationDetail().id,
      group.id,
      label
    );
  }
}
