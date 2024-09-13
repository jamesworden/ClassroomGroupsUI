import {
  Classroom,
  ClassroomDetail,
  Configuration,
  ConfigurationDetail,
} from '../models';

export interface PatchConfigurationResponse {
  patchedConfigurationDetail: ConfigurationDetail;
}

export interface PatchClassroomResponse {
  patchedClassroomDetail: ClassroomDetail;
}

export interface CreateGroupResponse {
  updatedConfigurationDetail: ConfigurationDetail;
}

export interface DeleteGroupResponse {
  updatedConfigurationDetail: ConfigurationDetail;
}

export interface CreateStudentResponse {
  updatedConfigurationDetail: ConfigurationDetail;
}

export interface PatchGroupResponse {
  updatedConfigurationDetail: ConfigurationDetail;
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
