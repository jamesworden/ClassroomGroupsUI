import { computed, inject, Injectable, signal } from '@angular/core';
import {
  Classroom,
  ClassroomDetails,
  Column,
  Configuration,
  Field,
  Group,
  Student,
  StudentField,
  StudentGroup,
} from './models';
import { Subject } from 'rxjs';
import {
  ClassroomViewModel,
  ColumnViewModel,
  ConfigurationViewModel,
  FieldViewModel,
  GroupViewModel,
  StudentFieldViewModel,
  StudentGroupViewModel,
} from './view-models';
import {
  getClassroomViewModel,
  getColumnViewModel,
  getConfigurationViewModel,
  getFieldViewModel,
  getGroupViewModels,
  getStudentFieldViewModel,
  getStudentGroupViewModel,
  getStudentViewModel,
} from './logic/get-view-models';
import { HttpClient } from '@angular/common/http';
import { CreateClassroomResponse, DeleteClassroomResponse } from './responses';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

interface ClassroomsState {
  classroomDetails: ClassroomDetails;
}

@Injectable({
  providedIn: 'root',
})
export class ClassroomsService {
  readonly #httpClient = inject(HttpClient);

  private readonly _state = signal<ClassroomsState>({
    classroomDetails: {
      classrooms: [],
      columns: [],
      configurations: [],
      fields: [],
      groups: [],
      studentFields: [],
      studentGroups: [],
      students: [],
    },
  });

  public readonly classrooms = computed(() =>
    this._state().classroomDetails.classrooms.map(getClassroomViewModel)
  );

  public readonly classroom = (classroomId?: string) =>
    computed(() => this.classrooms().find((c) => c.id === classroomId));

  public readonly configurations = computed(() =>
    this._state().classroomDetails.configurations.map(getConfigurationViewModel)
  );

  public readonly configuration = (configurationId?: string) =>
    computed(() => this.configurations().find((c) => c.id === configurationId));

  public readonly groups = (configurationId?: string) =>
    computed(() =>
      this._state()
        .classroomDetails.groups.filter(
          (g) => g.configurationId === configurationId
        )
        .map(getGroupViewModels)
        .sort((a, b) => a.ordinal - b.ordinal)
    );

  public readonly studentFields = computed(() =>
    this._state().classroomDetails.studentFields.map(getStudentFieldViewModel)
  );

  public readonly studentGroups = computed(() =>
    this._state().classroomDetails.studentGroups.map(getStudentGroupViewModel)
  );

  public readonly columns = (configurationId?: string) =>
    computed(() =>
      this._state()
        .classroomDetails.columns.map(getColumnViewModel)
        .filter((c) => c.configurationId === configurationId)
    );

  public readonly studentGroup = (
    studentId?: string,
    configurationId?: string
  ) =>
    computed(() =>
      this.studentGroups().find(
        (studentGroup) =>
          this.groups(configurationId)()
            .map((g) => g.id)
            .includes(studentGroup.groupId) &&
          studentId === studentGroup.studentId
      )
    );

  public readonly students = (classroomId?: string, configurationId?: string) =>
    computed(() =>
      this._state()
        .classroomDetails.students.filter((g) => g.classroomId === classroomId)
        .map((s) =>
          getStudentViewModel(
            s,
            this.studentFields(),
            this.columns(configurationId)(),
            this.studentGroup(s.id)()!
          )
        )
        .sort((a, b) => a.ordinal - b.ordinal)
    );

  public getClassroomsDetails() {
    return this.#httpClient
      .get<ClassroomDetails>('/api/v1/classrooms/classroom-details', {
        withCredentials: true,
      })
      .subscribe((classroomDetails) => {
        console.log('[Classroom Details]', classroomDetails);
        this._state.set({
          classroomDetails,
        });
      });
  }
}
