import { ColumnDetail, ColumnViewModel, FieldType } from '../models';

export function getColumnViewModels(
  columnDetails: ColumnDetail[]
): ColumnViewModel[] {
  let hasSetPrimary = false;
  return columnDetails.map((columnDetail) => {
    let isPrimary = false;
    if (columnDetail.type === FieldType.TEXT && !hasSetPrimary) {
      hasSetPrimary = true;
      isPrimary = true;
    }
    return {
      ...columnDetail,
      isPrimary,
    };
  });
}
