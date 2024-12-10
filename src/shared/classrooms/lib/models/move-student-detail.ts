import { StudentDetail } from '.';

export interface MoveStudentDetail {
  prevIndex: number;
  prevGroupId: string;
  currIndex: number;
  currGroupId: string;
  studentId: string;
}
