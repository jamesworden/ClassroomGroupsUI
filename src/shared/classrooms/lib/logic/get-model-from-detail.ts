import { Configuration, ConfigurationDetail } from '../models';

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
