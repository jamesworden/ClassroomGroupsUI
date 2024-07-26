import { computed, Injectable, signal } from '@angular/core';
import { Column, ColumnSort, Field } from './models/classroom.models';
import {
  DEFAULT_CLASSROOMS,
  DEFAULT_COLUMNS,
  DEFAULT_CONFIGURATIONS,
  DEFAULT_FIELDS,
  DEFAULT_GROUPS,
  DEFAULT_STUDENT_FIELDS,
  DEFAULT_STUDENT_GROUPS,
  DEFAULT_STUDENTS,
} from './data/default-data';
import { generateUniqueId } from './logic/generate-unique-id';
import {
  ClassroomViewModel,
  ColumnViewModel,
  ConfigurationViewModel,
  FieldViewModel,
  GroupViewModel,
  StudentFieldViewModel,
  StudentViewModel,
} from './models/classroom-view.models';
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
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClassroomsService {
  private readonly _classrooms = signal(DEFAULT_CLASSROOMS);
  private readonly _students = signal(DEFAULT_STUDENTS);
  private readonly _configurations = signal(DEFAULT_CONFIGURATIONS);
  private readonly _columns = signal(DEFAULT_COLUMNS);
  private readonly _fields = signal(DEFAULT_FIELDS);
  private readonly _studentFields = signal(DEFAULT_STUDENT_FIELDS);
  private readonly _groups = signal(DEFAULT_GROUPS);
  private readonly _viewingClassroomId = signal(DEFAULT_CLASSROOMS[0].id);
  private readonly _viewingConfigurationId = signal(
    DEFAULT_CONFIGURATIONS[0].id
  );
  private readonly _studentGroups = signal(DEFAULT_STUDENT_GROUPS);
  private readonly _addedClassroom$ = new Subject<void>();
  private readonly _addedConfiguration$ = new Subject<void>();

  public readonly addedClassroom$ = this._addedClassroom$.asObservable();

  public readonly addedConfiguration$ =
    this._addedConfiguration$.asObservable();

  public readonly viewingConfigurationId =
    this._viewingConfigurationId.asReadonly();

  public readonly viewingClassroomId = this._viewingClassroomId.asReadonly();

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
      ? this.configurationsById()[this.viewingConfigurationId()]
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
    return this._students()
      .map((student) => {
        const groupId = this.studentGroups().find(
          (studentGroup) =>
            studentGroup.configurationId === configurationId &&
            studentGroup.studentId === student.id
        )?.groupId;
        if (!groupId) {
          return undefined;
        }
        return getStudentViewModel(
          student,
          this.viewingStudentFieldsByStudentIds()[student.id] ?? [],
          this.viewingColumns(),
          groupId
        );
      })
      .filter((student) => !!student)
      .sort((a, b) => a.ordinal - b.ordinal);
  });

  public deleteClassroom(classroomId: string) {
    this._classrooms.set(
      this._classrooms().filter(({ id }) => classroomId !== id)
    );
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
    this._groups.set(
      this._groups().concat([
        {
          configurationId,
          id: generateUniqueId(),
          label: `Group ${this._groups().length + 1}`,
          ordinal: this._groups().length,
        },
      ])
    );
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
    this._fields.set(this._fields().concat([field]));

    this._columns.set(
      this._columns().concat(
        this._configurations().map((configuration) => {
          const column: Column = {
            configurationId: configuration.id,
            enabled: true,
            fieldId: field.id,
            id: generateUniqueId(),
            sort: ColumnSort.NONE,
            ordinal: this._fields().length - 1,
          };
          return column;
        })
      )
    );

    this._studentFields.set(
      this._studentFields().concat(
        this.viewingStudents().map((student) => ({
          fieldId: field.id,
          studentId: student.id,
          value: '',
        }))
      )
    );
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

  public updateStudents(classroomId: string, students: StudentViewModel[]) {
    this._students.set(
      this._students()
        .filter((student) => student.classroomId !== classroomId)
        .concat(students.map((student, i) => ({ ...student, ordinal: i })))
    );
  }

  public updateGroups(configurationId: string, groups: GroupViewModel[]) {
    this._groups.set(
      this._groups()
        .filter((group) => group.configurationId !== configurationId)
        .concat(groups.map((group, i) => ({ ...group, ordinal: i })))
    );
  }

  public addClassroom(label: string) {
    const classroomId = generateUniqueId();
    this._classrooms.set(
      this._classrooms().concat([
        {
          id: classroomId,
          label,
          description: '',
        },
      ])
    );
    const configurations = this._configurations();
    const configurationId = generateUniqueId();
    this._configurations.set(
      configurations.concat([
        {
          classroomId: classroomId,
          id: configurationId,
          label: `Configuration ${configurations.length}`,
        },
      ])
    );
    this._columns.set(
      this._columns().concat(
        this.viewingFieldIds().map((fieldId, i) => ({
          configurationId,
          enabled: true,
          fieldId,
          id: generateUniqueId(),
          sort: ColumnSort.NONE,
          ordinal: i,
        }))
      )
    );
    this._addedClassroom$.next();
  }

  public viewClassroom(classroomId: string) {
    this._viewingClassroomId.set(classroomId);
    this._viewingConfigurationId.set(
      this.configurations().find(
        (configuration) => configuration.classroomId === classroomId
      )?.id || ''
    );
  }

  public viewConfiguration(configurationId: string) {
    this._viewingConfigurationId.set(configurationId);
  }

  public addConfiguration(classroomId: string, label: string) {
    const configurationId = generateUniqueId();
    this._configurations.set(
      this._configurations().concat([
        {
          classroomId,
          label,
          id: configurationId,
          description: '',
        },
      ])
    );
    this._columns.set(
      this._columns().concat(
        this.viewingFieldIds().map((fieldId, i) => ({
          configurationId,
          enabled: true,
          fieldId,
          id: generateUniqueId(),
          sort: ColumnSort.NONE,
          ordinal: i,
        }))
      )
    );
    const groupId = generateUniqueId();
    this._groups.set(
      this._groups().concat([
        {
          configurationId,
          id: groupId,
          label: 'Group 1',
          ordinal: 0,
        },
      ])
    );
    this._studentGroups.set(
      this._studentGroups().concat(
        this._students()
          .filter((student) => student.classroomId === classroomId)
          .map((student, ordinal) => ({
            configurationId,
            groupId,
            id: generateUniqueId(),
            studentId: student.id,
            ordinal,
          }))
      )
    );
    this._addedConfiguration$.next();
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
}
