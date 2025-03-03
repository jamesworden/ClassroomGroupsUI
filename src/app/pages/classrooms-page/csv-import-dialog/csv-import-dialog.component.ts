import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ViewChild,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ClassroomsService,
  MAX_CLASSROOM_NAME_LENGTH,
} from '@shared/classrooms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { areAnyStringsEqual } from '@shared/util';

enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  EMAIL = 'email',
  DATE = 'date',
}

// Define CSV parsing errors enum
export enum CsvParsingError {
  EMPTY_FILE = 'CSV file is empty',
  DUPLICATE_HEADERS = 'File contains duplicate header names',
  INVALID_FORMAT = 'Invalid CSV format',
  MISSING_REQUIRED_HEADERS = 'Missing required headers',
}

// Define the parsed CSV data interface
interface ParsedCsvData {
  rawData: string;
  headers: string[];
  rows: any[];
  preview: any[];
  errors: CsvParsingError[];
}

interface CsvImportData {
  csvData: string;
  fileName: string;
  maxClassrooms: number;
  currentClassroomsCount: number;
}

interface DetectedField {
  csvHeader: string;
  fieldName: string;
  fieldType: FieldType;
  sampleData: string;
}

@Component({
  selector: 'app-csv-import-dialog',
  templateUrl: './csv-import-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    MatCheckboxModule,
    MatStepperModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule,
    ReactiveFormsModule,
  ],
})
export class CsvImportDialogComponent implements OnInit {
  readonly #dialogRef = inject(MatDialogRef<CsvImportDialogComponent>);
  readonly #fb = inject(FormBuilder);
  readonly #snackBar = inject(MatSnackBar);
  readonly #classroomsService = inject(ClassroomsService);

  readonly data = inject<CsvImportData>(MAT_DIALOG_DATA);

  @ViewChild('stepper')
  stepper!: MatStepper;

  readonly classNameForm = this.#fb.group({
    className: [
      '',
      [Validators.required, Validators.maxLength(MAX_CLASSROOM_NAME_LENGTH)],
    ],
    createNewClass: [true],
  });

  readonly classNameFormValid = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  currentStep = 1;

  // Create the source signal for CSV data
  readonly rawCsvData = signal<string>('');

  // This will be our main computed value that contains parsing results and errors
  readonly parsedCsvData = computed<ParsedCsvData>(() => {
    const rawData = this.rawCsvData();
    const result: ParsedCsvData = {
      rawData,
      headers: [],
      rows: [],
      preview: [],
      errors: [],
    };

    if (!rawData || rawData.trim() === '') {
      result.errors.push(CsvParsingError.EMPTY_FILE);
      return result;
    }

    try {
      const delimiter = ',';
      const skipHeader = true;
      const trimWhitespace = true;

      const rows = rawData.split(/\r?\n/);
      if (rows.length === 0) {
        result.errors.push(CsvParsingError.EMPTY_FILE);
        return result;
      }

      let headers = rows[0].split(delimiter);

      if (trimWhitespace) {
        headers = headers.map((header) => header.trim());
      }

      // Check for duplicate headers
      if (areAnyStringsEqual(headers)) {
        result.errors.push(CsvParsingError.DUPLICATE_HEADERS);
      }

      result.headers = headers;

      // Parse all data rows
      const parsedRows = [];
      const startRow = skipHeader ? 1 : 0;

      for (let i = startRow; i < rows.length; i++) {
        if (rows[i].trim() === '') continue;

        const rowData = rows[i].split(delimiter);
        const rowObj: { [key: string]: string } = {};

        for (let j = 0; j < headers.length; j++) {
          const header = headers[j] || `Column ${j + 1}`;
          let value = rowData[j] || '';
          if (trimWhitespace) {
            value = value.trim();
          }
          rowObj[header] = value;
        }

        parsedRows.push(rowObj);
      }

      result.rows = parsedRows;

      // Only get a few rows for preview
      const previewEndRow = Math.min(3, parsedRows.length);
      result.preview = parsedRows.slice(0, previewEndRow);

      return result;
    } catch (error) {
      console.error('Error parsing CSV', error);
      result.errors.push(CsvParsingError.INVALID_FORMAT);
      return result;
    }
  });

  // Derived computed values
  readonly csvHeaders = computed(() => this.parsedCsvData().headers);
  readonly previewData = computed(() => this.parsedCsvData().preview);
  readonly csvErrors = computed(() => this.parsedCsvData().errors);
  readonly hasErrors = computed(() => this.csvErrors().length > 0);

  readonly displayedPreviewColumns = computed(() => this.csvHeaders());

  // Calculate field types based on parsed data
  readonly detectedFields = computed(() => {
    const { headers, preview } = this.parsedCsvData();
    const detected: DetectedField[] = [];

    const isNumeric = (value: string) => {
      return !isNaN(parseFloat(value)) && isFinite(Number(value));
    };

    const isEmail = (value: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    headers.forEach((header) => {
      const values = preview
        .map((row) => row[header])
        .filter((val) => val !== undefined && val !== null && val !== '');

      let fieldType = FieldType.TEXT;

      if (values.length > 0) {
        if (values.every(isNumeric)) {
          fieldType = FieldType.NUMBER;
        } else if (values.every(isEmail)) {
          fieldType = FieldType.EMAIL;
        }
      }

      detected.push({
        csvHeader: header,
        fieldName: this.generateFieldName(header),
        fieldType: fieldType,
        sampleData: values.length > 0 ? values[0] : '',
      });
    });

    return detected;
  });

  // Calculate import summary based on parsed data
  readonly importSummary = computed(() => {
    const { rawData, headers, errors } = this.parsedCsvData();
    const rows = rawData.split(/\r?\n/);
    const delimiter = ',';
    const skipHeader = true;

    const startRow = skipHeader ? 1 : 0;
    let totalRows = 0;
    let validRows = 0;
    let errorRows = 0;
    const warnings: string[] = [];

    // Add parsing errors to warnings (convert enum values to strings)
    const errorStrings = errors.map((error) => error.toString());

    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i];

      if (row.trim() === '') continue;

      totalRows++;

      const rowData = row.split(delimiter);
      let hasEmptyValue = false;

      for (let j = 0; j < headers.length; j++) {
        let value = rowData[j] || '';
        value = value.trim();

        if (value === '') {
          hasEmptyValue = true;
          break;
        }
      }

      if (hasEmptyValue) {
        errorRows++;
      } else {
        validRows++;
      }
    }

    if (
      errorRows > 0 &&
      !errorStrings.includes('Some rows have empty values')
    ) {
      warnings.push('Some rows have empty values');
    }

    return {
      totalRows,
      validRows,
      errorRows,
      warnings,
      errorStrings, // Add error strings for comparison in template
    };
  });

  // Create a filtered warnings computed signal to avoid template function calls
  readonly filteredWarnings = computed(() => {
    const summary = this.importSummary();
    const errorStrings = summary.errorStrings || [];

    return summary.warnings.filter(
      (warning) => !errorStrings.includes(warning)
    );
  });

  readonly totalSteps = 2;
  readonly FieldType = FieldType;
  readonly MAX_CLASSROOM_NAME_LENGTH = MAX_CLASSROOM_NAME_LENGTH;

  ngOnInit() {
    // Initialize the raw CSV data from the input
    this.rawCsvData.set(this.data.csvData);

    this.classNameForm.statusChanges.subscribe((status) => {
      this.classNameFormValid.set(status === 'VALID');
    });

    this.classNameFormValid.set(this.classNameForm.valid);
  }

  generateFieldName(header: string): string {
    const cleanHeader = header
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim();

    return cleanHeader
      .split(/\s+/)
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');
  }

  nextStep() {
    if (this.currentStep < this.totalSteps && this.canProceed()) {
      this.currentStep++;
      this.stepper.next();
    } else if (this.currentStep === this.totalSteps) {
      this.importStudents();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.stepper.previous();
    }
  }

  handleStepperSelectionChange(event: StepperSelectionEvent) {
    // Only update if there's a valid change
    if (event.selectedIndex >= 0) {
      this.currentStep = event.selectedIndex + 1;
    }
  }

  canProceed(): boolean {
    if (this.currentStep === 1) {
      // Only proceed if we have preview data and no critical errors
      return this.previewData().length > 0 && !this.hasErrors();
    } else if (this.currentStep === 2) {
      return this.classNameFormValid();
    }
    return true;
  }

  importStudents() {
    this.isLoading.set(true);

    const importPayload = {
      csvData: this.rawCsvData(),
      className: this.classNameForm.get('className')?.value,
      createNewClass: this.classNameForm.get('createNewClass')?.value,
      fields: this.detectedFields().map((field) => ({
        csvHeader: field.csvHeader,
        fieldName: field.fieldName,
        fieldType: field.fieldType,
      })),
    };

    console.log('[Import CSV Dialog] Import Payload:', importPayload);

    setTimeout(() => {
      this.isLoading.set(false);
      this.#snackBar.open('Students imported successfully!', 'Close', {
        duration: 3000,
        panelClass: 'success-snackbar',
      });
      this.#dialogRef.close(true);
    }, 1500);
  }

  cancel() {
    this.#dialogRef.close(false);
  }

  getStepLabel(step: number): string {
    switch (step) {
      case 1:
        return 'Review CSV';
      case 2:
        return 'Create Classroom';
      default:
        return `Step ${step}`;
    }
  }
}
