import { Component, inject, OnInit, signal, computed } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
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
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  // Injected services - make public for template access
  dialogRef = inject(MatDialogRef<CsvImportDialogComponent>);
  data = inject<CsvImportData>(MAT_DIALOG_DATA);
  fb = inject(FormBuilder);
  classroomsService = inject(ClassroomsService);
  snackBar = inject(MatSnackBar);

  // Form controls
  classNameForm = this.fb.group({
    className: ['', [Validators.required, Validators.maxLength(50)]],
    createNewClass: [true],
  });

  // State signals
  isLoading = signal<boolean>(false);
  currentStep = signal<number>(1);
  csvHeaders = signal<string[]>([]);
  previewData = signal<any[]>([]);
  detectedFields = signal<DetectedField[]>([]);
  importSummary = signal<{
    totalRows: number;
    validRows: number;
    errorRows: number;
    warnings: string[];
  }>({ totalRows: 0, validRows: 0, errorRows: 0, warnings: [] });

  // Computed values
  canProceedToNextStep = computed(() => {
    if (this.currentStep() === 1) {
      // Can proceed if there's data to import
      return this.previewData().length > 0;
    } else if (this.currentStep() === 2) {
      // Can proceed if class name is valid
      return this.classNameForm.valid;
    }
    return true;
  });

  // Constants
  readonly totalSteps = 2;
  readonly FieldType = FieldType;
  readonly MAX_CLASSROOM_NAME_LENGTH = MAX_CLASSROOM_NAME_LENGTH;

  // Display column configurations
  displayedPreviewColumns = computed(() => this.csvHeaders());

  ngOnInit() {
    this.parseCSV();
  }

  parseCSV() {
    const delimiter = ','; // Default to comma as specified
    const skipHeader = true; // Default to treating first row as headers
    const trimWhitespace = true; // Default to trimming whitespace

    try {
      // Split into rows
      const rows = this.data.csvData.split(/\r?\n/);
      if (rows.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Get headers (first row as headers)
      let headers = rows[0].split(delimiter);

      if (trimWhitespace) {
        headers = headers.map((header) => header.trim());
      }

      // Set CSV headers
      this.csvHeaders.set(headers);

      // Get preview data (first 5 rows)
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

      // Set preview data
      this.previewData.set(preview);

      // Auto-detect field types
      this.detectFieldTypes(headers, preview);

      // Validate the preview to give initial feedback
      this.validateImport();
    } catch (error) {
      console.error('Error parsing CSV', error);
      this.snackBar.open(
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

    // Helper function to check if a value could be numeric
    const isNumeric = (value: string) => {
      return !isNaN(parseFloat(value)) && isFinite(Number(value));
    };

    // Helper function to check if a value looks like an email
    const isEmail = (value: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    // Analyze each column
    headers.forEach((header) => {
      // Get all non-empty values for this column
      const values = preview
        .map((row) => row[header])
        .filter((val) => val !== undefined && val !== null && val !== '');

      // Default to TEXT
      let fieldType = FieldType.TEXT;

      // Check sample values to determine type
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
    // Convert header to camelCase and clean it up
    const cleanHeader = header
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .trim();

    return cleanHeader
      .split(/\s+/)
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');
  }

  validateImport() {
    // Get the entire CSV data, not just the preview
    const rows = this.data.csvData.split(/\r?\n/);
    const headers = this.csvHeaders();
    const delimiter = ',';
    const skipHeader = true;

    // Calculate actual totals from the full dataset
    const startRow = skipHeader ? 1 : 0;
    let totalRows = 0;
    let validRows = 0;
    let errorRows = 0;
    const warnings: string[] = [];

    // Process all rows in the CSV, not just the preview
    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i];

      // Skip empty rows
      if (row.trim() === '') continue;

      totalRows++;

      // Parse the row
      const rowData = row.split(delimiter);
      let hasEmptyValue = false;

      // Check each field in the row
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

    // Update import summary
    this.importSummary.set({
      totalRows,
      validRows,
      errorRows,
      warnings,
    });
  }

  nextStep() {
    if (this.currentStep() < this.totalSteps && this.canProceedToNextStep()) {
      this.currentStep.set(this.currentStep() + 1);
    } else if (this.currentStep() === this.totalSteps) {
      this.importData();
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  importData() {
    if (!this.classNameForm.valid) {
      this.snackBar.open('Please enter a valid class name', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.isLoading.set(true);

    // Prepare the import payload
    const importPayload = {
      // CSV data
      csvData: this.data.csvData,

      // Class settings
      className: this.classNameForm.get('className')?.value,
      createNewClass: this.classNameForm.get('createNewClass')?.value,

      // Field definitions
      fields: this.detectedFields().map((field) => ({
        csvHeader: field.csvHeader,
        fieldName: field.fieldName,
        fieldType: field.fieldType,
      })),
    };

    console.log('Import payload:', importPayload);

    // In a real implementation, you would call your service
    // this.classroomsService.importCSV(importPayload).subscribe(...)

    // Simulate successful import
    setTimeout(() => {
      this.isLoading.set(false);
      this.snackBar.open('Students imported successfully!', 'Close', {
        duration: 3000,
        panelClass: 'success-snackbar',
      });
      this.dialogRef.close(true);
    }, 1500);
  }

  cancel() {
    this.dialogRef.close(false);
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
