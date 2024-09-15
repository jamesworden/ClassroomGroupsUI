import {
  Classroom,
  ClassroomDetail,
  ColumnDetail,
  Configuration,
  ConfigurationDetail,
  FieldDetail,
  Group,
  GroupDetail,
  StudentDetail,
} from '../models';

export interface PatchConfigurationResponse {
  patchedConfigurationDetail: ConfigurationDetail;
}

export interface PatchClassroomResponse {
  patchedClassroomDetail: ClassroomDetail;
}

export interface CreateGroupResponse {
  createdGroupDetail: GroupDetail;
}

export interface DeleteGroupResponse {
  deletedGroup: Group;
}

export interface CreateStudentResponse {
  createdStudentDetail: StudentDetail;
}

export interface PatchGroupResponse {
  updatedGroupDetail: GroupDetail;
}

export interface GetClassroomDetailsResponse {
  classroomDetails: ClassroomDetail[];
}

export interface GetConfigurationDetailResponse {
  configurationDetail: ConfigurationDetail;
}

export interface GetConfigurationsResponse {
  configurations: Configuration[];
}

export interface CreatedConfigurationResponse {
  createdConfigurationDetail: ConfigurationDetail;
}

export interface DeletedClassroomResponse {
  deletedClassroom: Classroom;
}

export interface CreatedClassroomResponse {
  createdClassroomDetail: ClassroomDetail;
}

export interface DeletedConfigurationResponse {
  deletedConfiguration: Configuration;
}

export interface CreateColumnResponse {
  createdColumnDetail: ColumnDetail;
  createdFieldDetail: FieldDetail;
}

export interface UpsertStudentFieldResponse {
  upsertedValue: string;
}
