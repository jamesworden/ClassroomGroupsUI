import { ChartType } from 'chart.js';
import { StudentDetail, ColumnDetail } from '@shared/classrooms';
import { createBackgroundGradient } from './create-background-gradient';

export function getStudentDataset(
  students: StudentDetail[],
  numericColumns: ColumnDetail[],
  selectedColumn: string,
  chartType: ChartType,
  selectedColumnLabel: string
) {
  if (selectedColumn === 'average') {
    return getAverageDataset(students, numericColumns, chartType);
  } else {
    return getColumnDataset(
      students,
      selectedColumn,
      chartType,
      selectedColumnLabel
    );
  }
}

/**
 * Creates a dataset showing the average across all numeric columns
 */
function getAverageDataset(
  students: StudentDetail[],
  numericColumns: ColumnDetail[],
  chartType: ChartType
) {
  const data = students.map((student) => {
    const studentScores = numericColumns
      .map((col) => parseFloat(student.fieldIdsToValues[col.fieldId] || '0'))
      .filter((score) => !isNaN(score));

    return studentScores.length
      ? studentScores.reduce((sum, score) => sum + score, 0) /
          studentScores.length
      : 0;
  });

  return {
    data,
    label: 'Average Score',
    backgroundColor: createBackgroundGradient(chartType, false),
    borderColor: 'rgba(94, 129, 244, 1)',
    pointBackgroundColor: 'rgba(94, 129, 244, 1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(94, 129, 244, 1)',
    borderWidth: chartType === 'line' ? 3 : 0,
  };
}

/**
 * Creates a dataset showing values from a specific column
 */
function getColumnDataset(
  students: StudentDetail[],
  selectedColumn: string,
  chartType: ChartType,
  selectedColumnLabel: string
) {
  const data = students.map((student) => {
    const value = student.fieldIdsToValues[selectedColumn] || '0';
    return parseFloat(value) || 0;
  });

  return {
    data,
    label: selectedColumnLabel,
    backgroundColor: createBackgroundGradient(chartType, false),
    borderColor: 'rgba(66, 186, 255, 1)',
    pointBackgroundColor: 'rgba(66, 186, 255, 1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(66, 186, 255, 1)',
    borderWidth: chartType === 'line' ? 3 : 0,
  };
}
