import { ChartType } from 'chart.js';
import { createBackgroundGradient } from './create-background-gradient';
import { ColumnDetail, FieldType, GroupDetail } from '@shared/classrooms';

/**
 * Creates a dataset configuration for group data visualization
 */
export function getGroupDataset(
  groups: GroupDetail[],
  numericColumns: ColumnDetail[],
  selectedColumn: string | 'average',
  chartType: ChartType,
  selectedColumnLabel: string
) {
  if (selectedColumn === 'average') {
    // Average scores across all columns for each group
    const data = groups.map((group) =>
      calculateGroupAverageAcrossColumns(group, numericColumns)
    );

    return {
      data,
      label: 'Average Score',
      backgroundColor: createBackgroundGradient(chartType, true),
      borderColor: 'rgba(137, 111, 255, 1)',
      pointBackgroundColor: 'rgba(137, 111, 255, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(137, 111, 255, 1)',
      borderWidth: chartType === 'line' ? 3 : 0,
    };
  } else {
    // Specific column averages for each group
    const data = groups.map((group) =>
      calculateGroupColumnAverage(group, selectedColumn)
    );

    return {
      data,
      label: selectedColumnLabel,
      backgroundColor: createBackgroundGradient(chartType, true),
      borderColor: 'rgba(255, 126, 146, 1)',
      pointBackgroundColor: 'rgba(255, 126, 146, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(255, 126, 146, 1)',
      borderWidth: chartType === 'line' ? 3 : 0,
    };
  }
}

/**
 * Calculate the average score across all numeric columns for a group
 */
function calculateGroupAverageAcrossColumns(
  group: {
    studentDetails: Array<{
      fieldIdsToValues: Record<string, string>;
    }>;
  },
  numericColumns: Array<{ fieldId: string; type: FieldType }>
): number {
  const groupStudents = group.studentDetails;

  const allScores = groupStudents.flatMap((student) =>
    numericColumns
      .filter(({ type }) => type === FieldType.NUMBER)
      .map((col) => parseFloat(student.fieldIdsToValues[col.fieldId] || '0'))
      .filter((score) => !isNaN(score))
  );

  return allScores.length
    ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
    : 0;
}

/**
 * Calculate the average score for a specific column in a group
 */
function calculateGroupColumnAverage(
  group: {
    studentDetails: Array<{
      fieldIdsToValues: Record<string, string>;
    }>;
  },
  columnId: string
): number {
  const groupStudents = group.studentDetails;

  const columnScores = groupStudents
    .map((student) => parseFloat(student.fieldIdsToValues[columnId] || '0'))
    .filter((score) => !isNaN(score));

  return columnScores.length
    ? columnScores.reduce((sum, score) => sum + score, 0) / columnScores.length
    : 0;
}
