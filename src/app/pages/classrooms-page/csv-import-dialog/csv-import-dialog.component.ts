import { Component, Inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClassroomsService } from '@shared/classrooms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';

interface CsvImportData {
  csvData: string;
  fileName: string;
  maxClassrooms: number;
  currentClassroomsCount: number;
}

@Component({
  selector: 'app-csv-import-dialog',
  templateUrl: './csv-import-dialog.component.html',
  styleUrls: ['./csv-import-dialog.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatListModule,
  ],
})
export class CsvImportDialogComponent implements OnInit {
  importForm: FormGroup;
  csvHeaders: string[] = [];
  previewData: any[] = [];
  isLoading = signal<boolean>(false);
  currentStep = signal<number>(1);
  totalSteps = 3;
  fieldMappings: { [key: string]: string } = {
    className: '',
    studentName: '',
    studentEmail: '',
    studentId: '',
  };
  fieldOptions = [
    { value: 'className', label: 'Class Name' },
    { value: 'studentName', label: 'Student Name' },
    { value: 'studentEmail', label: 'Student Email' },
    { value: 'studentId', label: 'Student ID' },
  ];
  availableClasses: string[] = [];

  constructor(
    private fb: FormBuilder,
    private classroomsService: ClassroomsService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CsvImportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CsvImportData
  ) {
    this.importForm = this.fb.group({
      createNewClassrooms: [true],
      skipHeaderRow: [true],
      delimiter: [',', Validators.required],
    });
  }

  ngOnInit() {
    this.parseCSV();
  }

  parseCSV() {
    const delimiter = this.importForm.get('delimiter')?.value || ',';
    const skipHeader = this.importForm.get('skipHeaderRow')?.value;

    try {
      // Basic CSV parsing
      const rows = this.data.csvData.split('\\n');
      if (rows.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Get headers
      this.csvHeaders = rows[0].split(delimiter).map((header) => header.trim());

      // Get preview data (first 5 rows)
      this.previewData = [];
      const startRow = skipHeader ? 1 : 0;
      const endRow = Math.min(startRow + 5, rows.length);

      for (let i = startRow; i < endRow; i++) {
        if (rows[i].trim() === '') continue;

        const rowData = rows[i].split(delimiter);
        const rowObj: { [key: string]: string } = {};

        for (let j = 0; j < this.csvHeaders.length; j++) {
          const header = this.csvHeaders[j] || `Column ${j + 1}`;
          rowObj[header] = rowData[j] ? rowData[j].trim() : '';
        }

        this.previewData.push(rowObj);
      }

      // Auto-detect fields based on common header names
      this.autoDetectFields();

      // Extract unique class names for display
      this.extractUniqueClasses();
    } catch (error) {
      console.error('Error parsing CSV', error);
      this.snackBar.open(
        'Error parsing CSV file. Please check the format.',
        'Dismiss',
        {
          duration: 5000,
          panelClass: 'error-snackbar',
        }
      );
    }
  }

  autoDetectFields() {
    const headerMapping: { [key: string]: string } = {
      class: 'className',
      classroom: 'className',
      'class name': 'className',
      course: 'className',
      section: 'className',
      student: 'studentName',
      'student name': 'studentName',
      name: 'studentName',
      'full name': 'studentName',
      email: 'studentEmail',
      'student email': 'studentEmail',
      mail: 'studentEmail',
      id: 'studentId',
      'student id': 'studentId',
      'student number': 'studentId',
    };

    // Check for matches (case-insensitive)
    this.csvHeaders.forEach((header) => {
      const lowerHeader = header.toLowerCase();
      for (const [pattern, field] of Object.entries(headerMapping)) {
        if (lowerHeader.includes(pattern)) {
          this.fieldMappings[field] = header;
          break;
        }
      }
    });
  }

  extractUniqueClasses() {
    // const classNameHeader = this.fieldMappings.className;
    // if (!classNameHeader || !this.previewData.length) return;
    // // Get all unique class names from the data
    // const allClasses = new Set<string>();
    // this.previewData.forEach((row) => {
    //   const className = row[classNameHeader];
    //   if (className) {
    //     allClasses.add(className);
    //   }
    // });
    // this.availableClasses = Array.from(allClasses);
  }

  updateMapping(field: string, header: string) {
    this.fieldMappings[field] = header;

    // If the class name mapping changed, update the available classes
    if (field === 'className') {
      this.extractUniqueClasses();
    }
  }

  onDelimiterChange() {
    this.parseCSV();
  }

  onSkipHeaderChange() {
    this.parseCSV();
  }

  nextStep() {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.set(this.currentStep() + 1);

      // If moving to class selection step, validate field mappings
      if (this.currentStep() === 2) {
        // Ensure at least className and studentName are mapped
        // if (!this.fieldMappings.className || !this.fieldMappings.studentName) {
        //   this.snackBar.open(
        //     'Please map at least Class Name and Student Name fields',
        //     'Dismiss',
        //     {
        //       duration: 5000,
        //     }
        //   );
        //   this.currentStep.set(1);
        //   return;
        // }
      }
    } else {
      this.importData();
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  importData() {
    this.isLoading.set(true);

    // Here you would process the entire CSV with the selected mappings
    // and send it to your ClassroomService

    // Sample implementation:
    setTimeout(() => {
      this.isLoading.set(false);
      this.dialogRef.close(true);
    }, 1500);

    // Actual implementation would look something like:
    /*
    const importPayload = {
      mappings: this.fieldMappings,
      createNew: this.importForm.get('createNewClassrooms')?.value,
      data: this.data.csvData,
      delimiter: this.importForm.get('delimiter')?.value,
      skipHeader: this.importForm.get('skipHeaderRow')?.value
    };
    
    this.classroomService.importCsvData(importPayload).subscribe({
      next: (result) => {
        this.isLoading.set(false);
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.snackBar.open('Error importing data: ' + error.message, 'Dismiss', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
    */
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
