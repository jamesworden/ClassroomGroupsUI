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

enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  EMAIL = 'email',
  DATE = 'date',
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
  readonly csvHeaders = signal<string[]>([]);
  readonly previewData = signal<any[]>([]);
  readonly detectedFields = signal<DetectedField[]>([]);
  readonly importSummary = signal<{
    totalRows: number;
    validRows: number;
    errorRows: number;
    warnings: string[];
  }>({ totalRows: 0, validRows: 0, errorRows: 0, warnings: [] });

  readonly displayedPreviewColumns = computed(() => this.csvHeaders());

  readonly totalSteps = 2;
  readonly FieldType = FieldType;
  readonly MAX_CLASSROOM_NAME_LENGTH = MAX_CLASSROOM_NAME_LENGTH;

  ngOnInit() {
    this.parseCSV();

    this.classNameForm.statusChanges.subscribe((status) => {
      this.classNameFormValid.set(status === 'VALID');
    });

    this.classNameFormValid.set(this.classNameForm.valid);
  }

  parseCSV() {
    const delimiter = ',';
    const skipHeader = true;
    const trimWhitespace = true;

    try {
      const rows = this.data.csvData.split(/\r?\n/);
      if (rows.length === 0) {
        throw new Error('CSV file is empty');
      }

      let headers = rows[0].split(delimiter);

      if (trimWhitespace) {
        headers = headers.map((header) => header.trim());
      }

      this.csvHeaders.set(headers);

      const preview = [];
      const startRow = skipHeader ? 1 : 0;
      const endRow = Math.min(startRow + 3, rows.length);

      for (let i = startRow; i < endRow; i++) {
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

        preview.push(rowObj);
      }

      this.previewData.set(preview);

      this.detectFieldTypes(headers, preview);

      // TODO: Angular material doesn't like when we upload files with duplicate column names
      // Therefore, we should throw a mat snackbar error here if they are the same.
      if (areAnyStringsEqual(headers)) {
        // Throw snackbar message
        // Close Modal
        return;
      }

      this.validateImport();
    } catch (error) {
      console.error('Error parsing CSV', error);
      this.#snackBar.open(
        'Error parsing CSV file. Please check the format.',
        'Close',
        {
          duration: 5000,
          panelClass: 'error-snackbar',
        }
      );
    }
  }

  detectFieldTypes(headers: string[], preview: any[]) {
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

    this.detectedFields.set(detected);
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

  validateImport() {
    const rows = this.data.csvData.split(/\r?\n/);
    const headers = this.csvHeaders();
    const delimiter = ',';
    const skipHeader = true;

    const startRow = skipHeader ? 1 : 0;
    let totalRows = 0;
    let validRows = 0;
    let errorRows = 0;
    const warnings: string[] = [];

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

    if (errorRows > 0) {
      warnings.push('Some rows have empty values');
    }

    this.importSummary.set({
      totalRows,
      validRows,
      errorRows,
      warnings,
    });
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
      return this.previewData().length > 0;
    } else if (this.currentStep === 2) {
      return this.classNameFormValid();
    }
    return true;
  }

  importStudents() {
    this.isLoading.set(true);

    const importPayload = {
      csvData: this.data.csvData,

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
        return 'Create Class';
      default:
        return `Step ${step}`;
    }
  }
}

function areAnyStringsEqual(arr: string[]): boolean {
  const normalizedStrings = arr.map((str) =>
    str.replace(/\s+/g, '').toLowerCase()
  );
  const uniqueStrings = new Set(normalizedStrings);
  return uniqueStrings.size < normalizedStrings.length;
}
