import { computed, Injectable, signal } from '@angular/core';
import {
  Column,
  ColumnSort,
  Field,
  StudentField,
} from './models/classroom.models';
import {
  DEFAULT_CLASSROOMS,
  DEFAULT_COLUMNS,
  DEFAULT_CONFIGURATIONS,
  DEFAULT_FIELDS,
  DEFAULT_GROUPS,
  DEFAULT_STUDENT_FIELDS,
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

  public readonly columns = computed(() =>
    this._columns().map((column) => getColumnViewModel(column))
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
    this._groups().map((group) => getGroupViewModels(group))
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

  public readonly viewingStudents = computed(() =>
    this._students().filter(({ groupId }) =>
      this.viewingGroupIds().includes(groupId)
    )
  );

  public readonly viewingStudentIds = computed(() =>
    this.viewingStudents().map(({ id }) => id)
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

  private readonly _viewingStudentFields = computed(() =>
    this.studentFields().filter(
      (studentField) =>
        this.viewingFieldIds().includes(studentField.fieldId) &&
        this.viewingStudentIds().includes(studentField.studentId)
    )
  );

  public readonly viewingStudentFieldsByStudentIds = computed(() =>
    this._viewingStudentFields().reduce((acc, viewingStudentField) => {
      if (!acc[viewingStudentField.studentId]) {
        acc[viewingStudentField.studentId] = [];
      }
      acc[viewingStudentField.studentId].push(viewingStudentField);
      return acc;
    }, {} as { [studentId: string]: StudentField[] })
  );

  public readonly classrooms = computed(() =>
    this._classrooms().map((classroom) => getClassroomViewModel(classroom))
  );

  public readonly students = computed(() =>
    this.viewingStudents().map((viewingStudent) =>
      getStudentViewModel(
        viewingStudent,
        this.viewingStudentFieldsByStudentIds()[viewingStudent.id] ?? [],
        this.viewingColumns()
      )
    )
  );

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
    const groups = this._groups();
    groups.push({
      configurationId,
      id: generateUniqueId(),
      label: `Group ${groups.length}`,
    });
    this._groups.set(groups);
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
        .concat(updates)
    );
  }

  public createField(classroomId: string, field: Field) {
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
          };
          return column;
        })
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

  public updateStudents(classroomId: string, updates: StudentViewModel[]) {
    this._students.set(
      this._students()
        .filter((student) => student.classroomId !== classroomId)
        .concat(updates)
    );
  }

  public updateGroups(configurationId: string, updates: GroupViewModel[]) {
    this._groups.set(
      this._groups()
        .filter((group) => group.configurationId !== configurationId)
        .concat(updates)
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
        this.viewingFieldIds().map((fieldId) => ({
          configurationId,
          enabled: true,
          fieldId,
          id: generateUniqueId(),
          sort: ColumnSort.NONE,
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
        this.viewingFieldIds().map((fieldId) => ({
          configurationId,
          enabled: true,
          fieldId,
          id: generateUniqueId(),
          sort: ColumnSort.NONE,
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
