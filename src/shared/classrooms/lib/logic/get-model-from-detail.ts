import {
  Configuration,
  ConfigurationDetail,
  Group,
  GroupDetail,
} from '../models';

export function getConfigurationFromDetail(
  detail: ConfigurationDetail
): Configuration {
  return {
    classroomId: detail.classroomId,
    id: detail.id,
    label: detail.label,
    description: detail.description,
  };
}

export function getGroupFromDetail(detail: GroupDetail): Group {
  return {
    configurationId: detail.configurationId,
    id: detail.id,
    label: detail.label,
    ordinal: detail.ordinal,
  };
}
