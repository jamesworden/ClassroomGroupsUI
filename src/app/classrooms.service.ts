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
  private readonly _columns = signal(DEFAULT_COLUMNS);
  private readonly _fields = signal(DEFAULT_FIELDS);
  private readonly _studentFields = signal(DEFAULT_STUDENT_FIELDS);
  private readonly _groups = signal(DEFAULT_GROUPS);
  private readonly _viewingClassroomId = signal(DEFAULT_CLASSROOMS[0].id);
  private readonly _viewingConfigurationId = signal(
    DEFAULT_CONFIGURATIONS[0].id
  );

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

  public readonly columns = computed(() =>
    this._columns().map((column) => getColumnViewModel(column))
  );

  public readonly fields = computed(() =>
    this._fields().map((field) => getFieldViewModel(field))
  );

  public readonly fieldsById = computed(() =>
    this.fields().reduce((acc, field) => {
      acc[field.id] = field;
      return acc;
    }, {} as { [fieldId: string]: Field })
  );

  public readonly studentFieldsById = computed(() =>
    this._studentFields().reduce((acc, studentField) => {
      if (!acc[studentField.studentId]) {
        acc[studentField.studentId] = {};
      }
      acc[studentField.studentId][studentField.fieldId] = studentField;
      return acc;
    }, {} as { [studentId: string]: { [fieldId: string]: StudentField } })
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

  public viewingFields = computed(() =>
    this._fields().filter(
      (field) => field.classroomId === this.viewingClassroomId()
    )
  );

  public viewingFieldIds = computed(() =>
    this.viewingFields().map((viewingField) => viewingField.id)
  );

  private readonly _viewingStudentFields = computed(() =>
    this._studentFields().filter(
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
