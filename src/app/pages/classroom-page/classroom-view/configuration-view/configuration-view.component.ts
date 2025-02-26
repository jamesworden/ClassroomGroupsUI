import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { GroupPanelComponent } from './group-panel/group-panel.component';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ConfigurationPanelBottomComponent } from './configuration-panel-bottom/configuration-panel-bottom.component';
import { ConfigurationPanelTopComponent } from './configuration-panel-top/configuration-panel-top.component';
import {
  ClassroomsService,
  ColumnDetail,
  ConfigurationDetail,
  Group,
  GroupDetail,
  MoveStudentDetail,
  StudentDetail,
  StudentField,
} from '@shared/classrooms';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AddGroupPanelComponent } from './add-group-panel/add-group-panel.component';
import { AverageScoresPanelComponent } from './average-scores-panel/average-scores-panel.component';
import { ClassroomPageService } from '../../classroom-page.service';

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
  readonly #classroomViewService = inject(ClassroomPageService);

  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly defaultGroup = input.required<GroupDetail>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly classroomId = input.required<string>();
  readonly groupDetails = input.required<GroupDetail[]>();
  readonly groupLimitReached = input.required<boolean>();
  readonly anyAverageScores = input.required<boolean>();
  readonly averageScores = input.required<Record<string, number>>();

  readonly collapsePanelDetails = signal(false);

  editingGroups: GroupDetail[] = [];

  constructor() {
    effect(() => (this.editingGroups = this.groupDetails()));
  }

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

  openDeleteConfigurationDialog(configurationId: string) {
    const classroomId = this.classroomId();
    const configuration = this.#classroomsService.select.configuration(
      classroomId,
      configurationId
    )();
    if (!configuration) {
      return;
    }
    this.#classroomViewService.openDeleteConfigurationDialog(configuration);
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

  toggleCollapsedPanels() {
    this.collapsePanelDetails.set(!this.collapsePanelDetails());
  }

  updateStudentPosition(position: MoveStudentDetail) {
    position.prevGroupId === position.currGroupId
      ? this.moveStudentInGroup(position)
      : this.moveStudentToGroup(position);
  }

  dropGroup(event: CdkDragDrop<Group[]>) {
    const classroomId = this.classroomId();
    const configurationId = this.configurationDetail()?.id;
    if (!classroomId || !configurationId) {
      return;
    }
    moveItemInArray(
      this.editingGroups,
      event.previousIndex,
      event.currentIndex
    );
    const sortedGroupIds = this.editingGroups.map(({ id }) => id);
    this.#classroomsService.sortGroups(
      classroomId,
      configurationId,
      sortedGroupIds
    );
  }

  moveStudentInGroup(position: MoveStudentDetail) {
    const allGroups = this.editingGroups.concat(this.defaultGroup() || []);

    for (const group of allGroups) {
      if (group.id === position.prevGroupId && group.studentDetails) {
        moveItemInArray(
          group.studentDetails,
          position.prevIndex,
          position.currIndex
        );
      }
    }

    this.#classroomsService.moveStudent(
      this.classroomId(),
      this.configurationDetail().id,
      position
    );
  }

  moveStudentToGroup(position: MoveStudentDetail) {
    let fromGroup: GroupDetail | undefined;
    let toGroup: GroupDetail | undefined;

    const allGroups = this.editingGroups.concat(this.defaultGroup() || []);

    for (const group of allGroups) {
      if (group.id === position.prevGroupId) {
        fromGroup = group;
      }
      if (group.id === position.currGroupId) {
        toGroup = group;
      }
    }

    const fromStudentDetails = fromGroup?.studentDetails;
    const toStudentDetails = toGroup?.studentDetails;

    if (!fromStudentDetails || !toStudentDetails) {
      return;
    }

    transferArrayItem(
      fromStudentDetails,
      toStudentDetails,
      position.prevIndex,
      position.currIndex
    );

    this.#classroomsService.moveStudent(
      this.classroomId(),
      this.configurationDetail().id,
      position
    );
  }
}
