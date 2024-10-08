import { ColumnDetail, FieldType, StudentDetail } from '../models';

export function calculateAverageScores(
  studentsInGroup: StudentDetail[],
  columnDetails: ColumnDetail[],
  forFieldType = FieldType.NUMBER
) {
  const scores: {
    [fieldId: string]: { total: number; count: number };
  } = {};

  for (const column of columnDetails) {
    for (const student of studentsInGroup) {
      const value = student.fieldIdsToValues[column.fieldId];
      const num = parseInt(value);
      if (column.type === forFieldType && !isNaN(num)) {
        if (scores[column.fieldId]) {
          scores[column.fieldId].total += num;
          scores[column.fieldId].count++;
        } else {
          scores[column.fieldId] = { total: num, count: 1 };
        }
      }
    }
  }

  const averageScores: { [fieldId: string]: number } = {};

  for (const fieldId in scores) {
    const { total, count } = scores[fieldId];
    averageScores[fieldId] = total / count;
  }

  return averageScores;
}
