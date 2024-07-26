import {
  ClassroomViewModel,
  ColumnViewModel,
  ConfigurationViewModel,
  FieldViewModel,
  GroupViewModel,
  StudentFieldViewModel,
  StudentGroupViewModel,
  StudentViewModel,
} from '../models/classroom-view.models';
import {
  Classroom,
  Column,
  Configuration,
  Field,
  Group,
  Student,
  StudentField,
  StudentGroup,
} from '../models/classroom.models';

export function getClassroomViewModel(
  classroom: Classroom
): ClassroomViewModel {
  return {
    ...classroom,
  };
}

export function getStudentViewModel(
  student: Student,
  studentFields: StudentField[],
  columns: Column[],
  groupId: string
): StudentViewModel {
  return <StudentViewModel>{
    ...student,
    fields: sortFieldsByColumns(studentFields, columns),
    groupId,
  };
}

export function getConfigurationViewModel(
  configuration: Configuration
): ConfigurationViewModel {
  return configuration;
}

export function getColumnViewModel(column: Column): ColumnViewModel {
  return column;
}

export function getFieldViewModel(field: Field): FieldViewModel {
  return field;
}

export function getGroupViewModels(group: Group): GroupViewModel {
  return group;
}

export function getStudentFieldViewModel(
  studentField: StudentField
): StudentFieldViewModel {
  return studentField;
}

export function getStudentGroupViewModel(
  studentGroup: StudentGroup
): StudentGroupViewModel {
  return studentGroup;
}

function sortFieldsByColumns(
  studentFields: StudentField[],
  columns: Column[]
): StudentField[] {
  const fieldIdsToIndexes = new Map<string, number>();
  columns.forEach(({ fieldId }, index) =>
    fieldIdsToIndexes.set(fieldId, index)
  );
  return studentFields.sort(
    (a, b) =>
      (fieldIdsToIndexes.get(a.fieldId) ?? studentFields.length) -
      (fieldIdsToIndexes.get(b.fieldId) ?? studentFields.length)
  );
}
