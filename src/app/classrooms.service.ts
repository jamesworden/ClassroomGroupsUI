import { computed, Injectable, signal } from '@angular/core';
import {
  Classroom,
  Column,
  ColumnSort,
  Configuration,
  Field,
  Group,
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
  GroupViewModel,
  StudentViewModel,
} from './models/classroom-view.models';
import {
  getClassroomViewModel,
  getColumnViewModel,
  getConfigurationViewModel,
  getFieldViewModel,
  getGroupViewModels,
  getStudentViewModel,
} from './logic/get-view-models';

@Injectable({
  providedIn: 'root',
})
export class ClassroomsService {
  private readonly _classrooms = signal(DEFAULT_CLASSROOMS);

  private readonly _students = signal(DEFAULT_STUDENTS);

  private readonly _configurations = signal(DEFAULT_CONFIGURATIONS);

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

  private readonly _columns = signal(DEFAULT_COLUMNS);

  public readonly columns = computed(() =>
    this._columns().map((column) => getColumnViewModel(column))
  );

  private readonly _fields = signal(DEFAULT_FIELDS);

  public readonly fields = computed(() =>
    this._fields().map((field) => getFieldViewModel(field))
  );

  public readonly fieldsById = computed(() =>
    this.fields().reduce((acc, field) => {
      acc[field.id] = field;
      return acc;
    }, {} as { [fieldId: string]: Field })
  );

  private readonly _studentFields = signal(DEFAULT_STUDENT_FIELDS);

  private readonly _studentFieldsById = computed(() =>
    this._studentFields().reduce((acc, studentField) => {
      if (!acc[studentField.studentId]) {
        acc[studentField.studentId] = {};
      }
      acc[studentField.studentId][studentField.fieldId] = studentField;
      return acc;
    }, {} as { [studentId: string]: { [fieldId: string]: StudentField } })
  );

  private readonly _groups = signal(DEFAULT_GROUPS);

  public readonly groups = computed(() =>
    this._groups().map((group) => getGroupViewModels(group))
  );

  public readonly groupsById = computed(() =>
    this.groups().reduce((acc, groups) => {
      acc[groups.id] = groups;
      return acc;
    }, {} as { [groupId: string]: GroupViewModel })
  );

  public readonly viewingClassroomId = signal(DEFAULT_CLASSROOMS[0].id);

  public readonly viewingClassroom = computed(() =>
    this.classrooms().find(({ id }) => id === this.viewingClassroomId())
  );

  public readonly viewingConfigurationId = signal(DEFAULT_CONFIGURATIONS[0].id);

  public readonly viewingGroups = computed(() =>
    this.groups().filter(
      (group) => group.configurationId === this.viewingConfigurationId()
    )
  );

  private readonly _viewingGroupIds = computed(() =>
    this.viewingGroups().map(({ id }) => id)
  );

  private readonly _viewingStudents = computed(() =>
    this._students().filter(({ groupId }) =>
      this._viewingGroupIds().includes(groupId)
    )
  );

  private readonly _viewingStudentIds = computed(() =>
    this._viewingStudents().map(({ id }) => id)
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

  private _viewingFields = computed(() =>
    this._fields().filter(
      (field) => field.classroomId === this.viewingClassroomId()
    )
  );

  private _viewingFieldIds = computed(() =>
    this._viewingFields().map((viewingField) => viewingField.id)
  );

  private readonly _viewingStudentFields = computed(() =>
    this._studentFields().filter(
      (studentField) =>
        this._viewingFieldIds().includes(studentField.fieldId) &&
        this._viewingStudentIds().includes(studentField.studentId)
    )
  );

  private readonly _viewingStudentFieldsByStudentIds = computed(() =>
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
    this._viewingStudents().map((viewingStudent) =>
      getStudentViewModel(
        viewingStudent,
        this._viewingStudentFieldsByStudentIds()[viewingStudent.id] ?? [],
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
        .filter((column) => column.configurationId === configurationId)
        .concat(updates)
    );
  }

  public createField(classroomId: string, field: Field) {
    const fields = this._fields();
    const columns = this._columns();

    fields.push(field);
    this._fields.set(fields);

    const newColumns = this._configurations()
      .filter((configuration) => configuration.id === classroomId)
      .map(({ id }) => {
        const column: Column = {
          configurationId: id,
          enabled: true,
          fieldId: field.id,
          id: generateUniqueId(),
          sort: ColumnSort.NONE,
        };
        return column;
      });
    columns.push(...newColumns);
    this._columns.set(newColumns);
  }

  public toggleColumn(columnId: string) {
    const columns = this._columns();
    for (const column of columns) {
      if (column.id === columnId) {
        column.enabled = !column.enabled;
      }
    }
    this._columns.set(columns);
  }

  public updateStudents(classroomId: string, updates: StudentViewModel[]) {
    this._students.set(
      this._students()
        .filter((student) => student.classroomId === classroomId)
        .concat(updates)
    );
  }

  public updateGroups(configurationId: string, updates: GroupViewModel[]) {
    this._groups.set(
      this._groups()
        .filter((group) => group.configurationId === configurationId)
        .concat(updates)
    );
  }

  public addClassroom(label: string) {
    this._classrooms.set(
      this._classrooms().concat([
        {
          id: generateUniqueId(),
          label,
          description: '',
        },
      ])
    );
  }

  public viewClassroom(classroomId: string) {
    this.viewingClassroomId.set(classroomId);
  }

  public viewConfiguration(configurationId: string) {
    this.viewingConfigurationId.set(configurationId);
  }

  public addConfiguration(classroomId: string, label: string) {
    this._configurations.set(
      this._configurations().concat([
        {
          classroomId,
          label,
          id: generateUniqueId(),
          description: '',
        },
      ])
    );
  }
}
