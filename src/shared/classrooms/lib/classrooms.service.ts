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

@Injectable({
  providedIn: 'root',
})
export class ClassroomsService {
  readonly #httpClient = inject(HttpClient);
  readonly #route = inject(ActivatedRoute);

  readonly queryParams = toSignal(this.#route.params, {
    initialValue: {
      id: null,
    },
  });

  private readonly _classrooms = signal<Classroom[]>([]);
  private readonly _students = signal<Student[]>([]);
  private readonly _configurations = signal<Configuration[]>([]);
  private readonly _columns = signal<Column[]>([]);
  private readonly _fields = signal<Field[]>([]);
  private readonly _studentFields = signal<StudentField[]>([]);
  private readonly _groups = signal<Group[]>([]);
  private readonly _viewingConfigurationId = signal<string | undefined>(
    undefined
  );
  private readonly _studentGroups = signal<StudentGroup[]>([]);

  private readonly _addedClassroom$ = new Subject<void>();
  public readonly addedClassroom$ = this._addedClassroom$.asObservable();

  private readonly _addedConfiguration$ = new Subject<void>();
  public readonly addedConfiguration$ =
    this._addedConfiguration$.asObservable();

  public readonly viewingConfigurationId =
    this._viewingConfigurationId.asReadonly();

  public readonly viewingClassroomId = computed(() => this.queryParams().id);

  public readonly configurations = computed(() =>
    this._configurations().map((configuration) =>
      getConfigurationViewModel(configuration)
    )
  );

  public readonly configurationsById = computed(() =>
    this.configurations().reduce((acc, configuration) => {
      acc[configuration.id] = configuration;
      return acc;
    }, {} as { [configurationId: string]: ConfigurationViewModel })
  );

  public readonly studentFields = computed(() =>
    this._studentFields().map((studentField) =>
      getStudentFieldViewModel(studentField)
    )
  );

  public readonly studentGroups = computed(() =>
    this._studentGroups().map((studentGroup) =>
      getStudentGroupViewModel(studentGroup)
    )
  );

  public readonly columns = computed(() =>
    this._columns()
      .map((column) => getColumnViewModel(column))
      .sort((a, b) => a.ordinal - b.ordinal)
  );

  public readonly fields = computed(() =>
    this._fields().map((field) => getFieldViewModel(field))
  );

  public readonly viewingFieldsById = computed(() =>
    this.viewingFields().reduce((acc, field) => {
      acc[field.id] = field;
      return acc;
    }, {} as { [fieldId: string]: FieldViewModel })
  );

  public readonly studentFieldsById = computed(() =>
    this.studentFields().reduce((acc, studentField) => {
      if (!acc[studentField.studentId]) {
        acc[studentField.studentId] = {};
      }
      acc[studentField.studentId][studentField.fieldId] = studentField;
      return acc;
    }, {} as { [studentId: string]: { [fieldId: string]: StudentFieldViewModel } })
  );

  public readonly groups = computed(() =>
    this._groups()
      .map((group) => getGroupViewModels(group))
      .sort((a, b) => a.ordinal - b.ordinal)
  );

  public readonly groupsById = computed(() =>
    this.groups().reduce((acc, groups) => {
      acc[groups.id] = groups;
      return acc;
    }, {} as { [groupId: string]: GroupViewModel })
  );

  public readonly viewingClassroom = computed(() =>
    this.classrooms().find(({ id }) => id === this.viewingClassroomId())
  );

  public readonly viewingGroups = computed(() =>
    this.groups().filter(
      (group) => group.configurationId === this.viewingConfigurationId()
    )
  );

  public readonly viewingGroupIds = computed(() =>
    this.viewingGroups().map(({ id }) => id)
  );

  public readonly viewingConfiguration = computed(() =>
    this.viewingConfigurationId()
      ? this.configurationsById()[this.viewingConfigurationId() ?? '']
      : undefined
  );

  public readonly viewingConfigurations = computed(() =>
    this.configurations().filter(
      (configuration) => configuration.classroomId === this.viewingClassroomId()
    )
  );

  public readonly viewingColumns = computed(() =>
    this.columns().filter(
      (column) => column.configurationId === this.viewingConfigurationId()
    )
  );

  public readonly viewingFields = computed(() =>
    this._fields().filter(
      (field) => field.classroomId === this.viewingClassroomId()
    )
  );

  public readonly viewingFieldIds = computed(() =>
    this.viewingFields().map((viewingField) => viewingField.id)
  );

  public readonly viewingStudentFieldsByStudentIds = computed(() =>
    this.studentFields().reduce((acc, viewingStudentField) => {
      if (!acc[viewingStudentField.studentId]) {
        acc[viewingStudentField.studentId] = [];
      }
      acc[viewingStudentField.studentId].push(viewingStudentField);
      return acc;
    }, {} as { [studentId: string]: StudentFieldViewModel[] })
  );

  public readonly classrooms = computed(() =>
    this._classrooms().map((classroom) => getClassroomViewModel(classroom))
  );

  public readonly viewingStudents = computed(() => {
    const configurationId = this.viewingConfigurationId();
    const studentGroups = this.studentGroups();
    const groupsById = this.groupsById();

    return this._students()
      .map((student) => {
        const studentGroup = studentGroups.find(
          (studentGroup) =>
            groupsById[studentGroup.groupId].configurationId ===
              configurationId && studentGroup.studentId === student.id
        );
        if (!studentGroup) {
          return undefined;
        }
        return getStudentViewModel(
          student,
          this.viewingStudentFieldsByStudentIds()[student.id] ?? [],
          this.viewingColumns(),
          studentGroup
        );
      })
      .filter((student) => !!student)
      .sort((a, b) => a.ordinal - b.ordinal);
  });

  public deleteClassroom(classroomId: string) {
    return this.#httpClient
      .delete<DeleteClassroomResponse>('/api/v1/classrooms', {
        withCredentials: true,
        body: {
          classroomId,
        },
      })
      .subscribe(({ deletedClassroom }) => {
        console.log('[Deleted Classroom]', deletedClassroom);
        this._classrooms.set(
          this._classrooms().filter(({ id }) => deletedClassroom.id !== id)
        );
      });
  }

  public updateClassroom(
    classroomId: string,
    updates: Partial<ClassroomViewModel>
  ) {
    const classrooms = this._classrooms();
    for (let classroom of classrooms) {
      if (classroomId === classroom.id) {
        classroom = Object.assign(classroom, updates);
        break;
      }
    }
    this._classrooms.set(classrooms);
  }

  public createGroup(configurationId: string) {
    // this._groups.set(
    //     this._groups().concat([
    //         {
    //             configurationId,
    //             id: generateUniqueId(),
    //             label: `Group ${this._groups().length + 1}`,
    //             ordinal: this._groups().length,
    //         },
    //     ])
    // );
  }

  public updateConfiguration(
    configurationId: string,
    updates: Partial<ConfigurationViewModel>
  ) {
    const configurations = this._configurations();
    for (let configuration of configurations) {
      if (configurationId === configuration.id) {
        configuration = Object.assign(configuration, updates);
        break;
      }
    }
    this._configurations.set(configurations);
  }

  public deleteConfiguration(configurationId: string) {
    this._configurations.set(
      this._configurations().filter(({ id }) => configurationId !== id)
    );
  }

  public updateColumns(configurationId: string, updates: ColumnViewModel[]) {
    this._columns.set(
      this._columns()
        .filter((column) => column.configurationId !== configurationId)
        .concat(updates.map((column, i) => ({ ...column, ordinal: i })))
    );
  }

  public createField(field: Field) {
    // this._fields.set(this._fields().concat([field]));
    // this._columns.set(
    //     this._columns().concat(
    //         this._configurations().map((configuration) => {
    //             const column: Column = {
    //                 configurationId: configuration.id,
    //                 enabled: true,
    //                 fieldId: field.id,
    //                 id: generateUniqueId(),
    //                 sort: ColumnSort.NONE,
    //                 ordinal: this._fields().length - 1,
    //             };
    //             return column;
    //         })
    //     )
    // );
    // this._studentFields.set(
    //     this._studentFields().concat(
    //         this.viewingStudents().map((student) => ({
    //             fieldId: field.id,
    //             studentId: student.id,
    //             value: '',
    //         }))
    //     )
    // );
  }

  public toggleColumn(columnId: string) {
    this._columns.set(
      this._columns().map((column) => {
        if (column.id === columnId) {
          column.enabled = !column.enabled;
        }
        return column;
      })
    );
  }

  public updateStudentGroups(updatedStudentGroups: StudentGroupViewModel[]) {
    this._studentGroups.set(
      this._studentGroups().map(
        (studentGroup) =>
          updatedStudentGroups.find((s) => s.id === studentGroup.id) ||
          studentGroup
      )
    );
  }

  public updateGroups(configurationId: string, groups: GroupViewModel[]) {
    this._groups.set(
      this._groups()
        .filter((group) => group.configurationId !== configurationId)
        .concat(groups.map((group, i) => ({ ...group, ordinal: i })))
    );
  }

  public createClassroom(label: string) {
    return this.#httpClient
      .post<CreateClassroomResponse>(
        '/api/v1/classrooms',
        { label },
        {
          withCredentials: true,
        }
      )
      .subscribe(({ createdClassroom, createdConfiguration }) => {
        console.log('[Created Classroom]', createdClassroom);
        console.log('[Created Configuration]', createdConfiguration);
        this._classrooms.set(this.classrooms().concat(createdClassroom));
        this._configurations.set(
          this.configurations().concat(createdConfiguration)
        );
        this._viewingConfigurationId.set(createdConfiguration.id);
      });
  }

  public viewConfiguration(configurationId: string) {
    this._viewingConfigurationId.set(configurationId);
  }

  public createConfiguration(classroomId: string, label: string) {
    return this.#httpClient
      .post<CreateClassroomResponse>(
        `/api/v1/classrooms/${classroomId}/configurations`,
        { label },
        {
          withCredentials: true,
        }
      )
      .subscribe(({ createdConfiguration }) => {
        console.log('[Created Configuration]', createdConfiguration);
        this._configurations.set(
          this.configurations().concat(createdConfiguration)
        );
        this._viewingConfigurationId.set(createdConfiguration.id);
      });
  }

  public setStudentValue(
    studentId: string,
    fieldId: string,
    value: string | number
  ) {
    this._studentFields.set(
      this._studentFields().map((studentField) => {
        if (
          studentField.fieldId === fieldId &&
          studentField.studentId === studentId
        ) {
          studentField.value = value;
        }
        return studentField;
      })
    );
  }

  public getClassroomsDetails() {
    return this.#httpClient
      .get<ClassroomDetails>('/api/v1/classrooms/classroom-details', {
        withCredentials: true,
      })
      .subscribe((classroomDetails) => {
        console.log('[Classroom Details]', classroomDetails);
        this._classrooms.set(classroomDetails.classrooms);
        this._columns.set(classroomDetails.columns);
        this._configurations.set(classroomDetails.configurations);
        this._fields.set(classroomDetails.fields);
        this._groups.set(classroomDetails.groups);
        this._studentFields.set(classroomDetails.studentFields);
        this._studentGroups.set(classroomDetails.studentGroups);
        this._students.set(classroomDetails.students);
      });
  }

  public reset() {
    console.log('[Classrooms] Resetting state...');
    this._classrooms.set([]);
    this._columns.set([]);
    this._configurations.set([]);
    this._fields.set([]);
    this._groups.set([]);
    this._studentFields.set([]);
    this._studentGroups.set([]);
    this._students.set([]);
  }
}
