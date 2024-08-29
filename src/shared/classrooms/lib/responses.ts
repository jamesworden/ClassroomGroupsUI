import { Classroom, Column, Configuration } from "./models";

export interface CreateClassroomResponse {
    createdClassroom: Classroom,
    createdConfiguration: Configuration,
    createdColumns: Column[]
}