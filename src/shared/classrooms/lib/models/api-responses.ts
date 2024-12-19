import {
  Classroom,
  ClassroomDetail,
  Column,
  ColumnDetail,
  Configuration,
  ConfigurationDetail,
  Field,
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
  updatedDefaultGroup: GroupDetail;
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

export interface PatchFieldResponse {
  updatedFieldDetail: FieldDetail;
}

export interface DeleteStudentResponse {
  deletedStudent: StudentDetail;
  updatedGroupDetails: GroupDetail[];
}

export interface SortGroupsResponse {
  sortedGroupDetails: GroupDetail[];
}

export interface MoveStudentResponse {
  updatedGroupDetails: GroupDetail[];
}

export interface MoveColumnResponse {
  updatedColumnDetails: ColumnDetail[];
}

export interface DeleteColumnResponse {
  deletedColumn: Column;
  deletedField: Field;
  configurationIdsColumnDetails: {
    [configurationId: string]: ColumnDetail[];
  };
}

export interface LockGroupResponse {
  updatedGroup: Group;
}

export interface UnlockGroupResponse {
  updatedGroup: Group;
}

export interface GroupStudentsResponse {
  updatedGroupDetails: GroupDetail[];
}
