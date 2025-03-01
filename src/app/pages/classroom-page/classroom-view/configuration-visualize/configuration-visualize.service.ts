import { computed, inject, Injectable, signal } from '@angular/core';
import { ChartData, ChartType } from 'chart.js';
import { ClassroomPageService } from '../../classroom-page.service';
import {
  calculateClassAverage,
  calculateClassFieldAverage,
  calculateClassGroupAverage,
  calculateClassGroupFieldAverage,
  ClassroomsService,
  FieldType,
  UNGROUPED_STUDENTS_DISPLAY_NAME,
} from '@shared/classrooms';
import { getStudentDataset } from './logic/get-student-dataset';
import { getGroupDataset } from './logic/get-group-dataset';
import { getChartOptions } from './logic/get-chart-options';

export enum ViewingBy {
  Students = 'Students',
  Groups = 'Groups',
}

@Injectable({
  providedIn: 'root',
})
export class ConfigurationVisualizeService {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #classroomPageService = inject(ClassroomPageService);

  readonly classroomId = this.#classroomPageService.classroomId;
  readonly configurationId = this.#classroomPageService.configurationId;
  readonly columnDetails = computed(() =>
    this.#classroomsService.select.columnDetails(this.configurationId())
  );
  readonly allGroupDetails = computed(() =>
    this.#classroomsService.select.groupDetails(this.configurationId())()
  );
  readonly listGroupDetails = computed(() =>
    this.#classroomsService.select.listGroupDetails(this.configurationId())()
  );
  readonly defaultGroup = computed(() =>
    this.#classroomsService.select.defaultGroup(this.configurationId())()
  );

  private readonly _viewingBy = signal<ViewingBy>(ViewingBy.Students);
  public viewingBy = this._viewingBy.asReadonly();

  private readonly _selectedColumn = signal<string | 'average'>('average');
  /**
   * Field id or `average` if the user wants to display average scores and no particular assignment.
   */
  readonly selectedColumn = this._selectedColumn.asReadonly();

  private readonly _chartType = signal<ChartType>('bar');
  readonly chartType = this._chartType.asReadonly();

  private readonly _showUngroupedStudents = signal(false);
  readonly showUngroupedStudents = this._showUngroupedStudents.asReadonly();

  readonly showingGroups = computed(() =>
    this.showUngroupedStudents()
      ? this.allGroupDetails()
      : this.listGroupDetails()
  );

  readonly showingStudentDetails = computed(() =>
    this.showingGroups().flatMap((group) => group.studentDetails)
  );

  readonly numericColumns = computed(() =>
    this.columnDetails().filter(({ type }) => FieldType.NUMBER === type)
  );

  readonly averageStudentScore = computed(() =>
    this.selectedColumn() === 'average'
      ? calculateClassAverage(
          this.showingStudentDetails(),
          this.columnDetails()
        )
      : calculateClassFieldAverage(
          this.showingStudentDetails(),
          this.selectedColumn()
        )
  );

  readonly averageGroupScore = computed(() =>
    this.selectedColumn() === 'average'
      ? calculateClassGroupAverage(this.showingGroups(), this.columnDetails())
      : calculateClassGroupFieldAverage(
          this.showingGroups(),
          this.selectedColumn()
        )
  );

  readonly averageScore = computed(() =>
    this.viewingBy() === ViewingBy.Groups
      ? this.averageGroupScore()
      : this.averageStudentScore()
  );

  readonly selectedColumnLabel = computed(() => {
    if (this.selectedColumn() === 'average') {
      return 'Average Score';
    } else {
      return (
        this.columnDetails().find(
          (col) => col.fieldId === this.selectedColumn()
        )?.label || ''
      );
    }
  });

  /**
   * Eventually, we'll need a way where the user can select which column
   * of the student is the one that ought to be displayed on the x axis.
   */
  readonly studentLabels = computed(() => {
    return this.showingStudentDetails().map((student) => {
      const firstStringColumn = this.columnDetails().find(
        ({ type }) => type === FieldType.TEXT
      );
      if (firstStringColumn) {
        return student.fieldIdsToValues[firstStringColumn.fieldId] || '';
      } else {
        return 'Student';
      }
    });
  });

  readonly groupLabels = computed(() =>
    this.showingGroups().map((group) =>
      group.id === this.defaultGroup()?.id
        ? UNGROUPED_STUDENTS_DISPLAY_NAME
        : group.label
    )
  );

  readonly studentDataset = computed(() => {
    return getStudentDataset(
      this.showingStudentDetails(),
      this.numericColumns(),
      this.selectedColumn(),
      this.chartType(),
      this.selectedColumnLabel()
    );
  });

  readonly groupDataset = computed(() =>
    getGroupDataset(
      this.showingGroups(),
      this.numericColumns(),
      this.selectedColumn(),
      this.chartType(),
      this.selectedColumnLabel()
    )
  );

  readonly chartData = computed((): ChartData => {
    if (this.viewingBy() === ViewingBy.Students) {
      return {
        labels: this.studentLabels(),
        datasets: [this.studentDataset()],
      };
    } else {
      return {
        labels: this.groupLabels(),
        datasets: [this.groupDataset()],
      };
    }
  });

  readonly chartOptions = computed(() => getChartOptions(this.viewingBy()));

  setViewingBy(viewingBy: ViewingBy) {
    this._viewingBy.set(viewingBy);
  }

  setShowUngroupedStudents(showUngroupedStudents: boolean) {
    this._showUngroupedStudents.set(showUngroupedStudents);
  }

  setChartType(chartType: ChartType) {
    this._chartType.set(chartType);
  }

  setSelectedColumn(selectedColumn: string) {
    this._selectedColumn.set(selectedColumn);
  }
}
