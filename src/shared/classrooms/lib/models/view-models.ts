import { ColumnDetail, ConfigurationDetail } from './api-models';

export interface ConfigurationViewModel extends ConfigurationDetail {
  columnDetails: ColumnViewModel[];
}

export interface ColumnViewModel extends ColumnDetail {
  isPrimary: boolean;
}
