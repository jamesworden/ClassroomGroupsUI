import {
  Classroom,
  Column,
  Configuration,
  Field,
  Group,
  Student,
  StudentField,
} from './classroom.models';

export interface StudentViewModel extends Student {
  fields: StudentField[];
}

export interface ClassroomViewModel extends Classroom {}

export interface ConfigurationViewModel extends Configuration {}

export interface ColumnViewModel extends Column {}

export interface FieldViewModel extends Field {}

export interface GroupViewModel extends Group {}

export interface StudentFieldViewModel extends StudentField {}
