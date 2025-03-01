import { ColumnDetail, FieldType, GroupDetail, StudentDetail } from '../models';

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

export function calculateClassAverage(
  studentDetails: StudentDetail[],
  columnDetails: ColumnDetail[]
): number {
  // Calculate average scores across all numeric fields
  const averageScores = calculateAverageScores(
    studentDetails,
    columnDetails,
    FieldType.NUMBER
  );

  // If there are no average scores, return 0
  if (Object.keys(averageScores).length === 0) {
    return 0;
  }

  // Calculate the overall average of all field averages
  let totalAverage = 0;
  let totalFields = 0;

  for (const fieldId in averageScores) {
    totalAverage += averageScores[fieldId];
    totalFields++;
  }

  return totalFields > 0 ? totalAverage / totalFields : 0;
}

export function calculateClassFieldAverage(
  studentDetails: StudentDetail[],
  fieldId: string
): number {
  let total = 0;
  let count = 0;

  // Iterate through each student
  for (const student of studentDetails) {
    const value = student.fieldIdsToValues[fieldId];
    const num = parseInt(value);

    // Only include valid numeric values
    if (!isNaN(num)) {
      total += num;
      count++;
    }
  }

  // Return the average, or 0 if there are no valid values
  return count > 0 ? total / count : 0;
}

export function calculateClassGroupAverage(
  groupDetails: GroupDetail[],
  columnDetails: ColumnDetail[]
): number {
  // If there are no groups, return 0
  if (groupDetails.length === 0) {
    return 0;
  }

  let totalGroupAverages = 0;
  let validGroupCount = 0;

  // Calculate the average for each group, then average those averages together
  for (const group of groupDetails) {
    // Skip groups with no students
    if (group.studentDetails.length === 0) {
      continue;
    }

    // Calculate this group's average across all numeric fields
    const groupAverage = calculateClassAverage(
      group.studentDetails,
      columnDetails
    );

    // Only include valid averages (non-zero indicates at least one valid value was found)
    if (groupAverage !== 0) {
      totalGroupAverages += groupAverage;
      validGroupCount++;
    }
  }

  // Return the average of group averages, or 0 if there were no valid groups
  return validGroupCount > 0 ? totalGroupAverages / validGroupCount : 0;
}

export function calculateClassGroupFieldAverage(
  groupDetails: GroupDetail[],
  fieldId: string
): number {
  // If there are no groups, return 0
  if (groupDetails.length === 0) {
    return 0;
  }

  let totalGroupFieldAverages = 0;
  let validGroupCount = 0;

  // Calculate the field average for each group, then average those averages together
  for (const group of groupDetails) {
    // Skip groups with no students
    if (group.studentDetails.length === 0) {
      continue;
    }

    // Calculate this group's average for the specific field
    const groupFieldAverage = calculateClassFieldAverage(
      group.studentDetails,
      fieldId
    );

    // Only include valid averages (non-zero indicates at least one valid value was found)
    if (groupFieldAverage !== 0) {
      totalGroupFieldAverages += groupFieldAverage;
      validGroupCount++;
    }
  }

  // Return the average of group field averages, or 0 if there were no valid groups
  return validGroupCount > 0 ? totalGroupFieldAverages / validGroupCount : 0;
}
