import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import {
  Classroom,
  ClassroomColumn,
  ClassroomColumnSort,
  ClassroomField,
} from './models/classroom.models';
import { toSignal } from '@angular/core/rxjs-interop';
import { INITIAL_CLASSROOMS } from './metadata/initial-classrooms';
import { generateUniqueId } from './logic/generate-unique-id';

@Injectable({
  providedIn: 'root',
})
export class ClassroomsService {
  private readonly _classrooms$ = new BehaviorSubject<Classroom[]>(
    INITIAL_CLASSROOMS
  );
  public readonly classrooms = toSignal(this._classrooms$, {
    initialValue: [],
  });

  private readonly _viewingClassroomId$ = new BehaviorSubject<
    string | undefined
  >(INITIAL_CLASSROOMS[0].id);
  public readonly viewingClassroomId = toSignal(this._viewingClassroomId$);

  private readonly _viewingClassroom$ = combineLatest([
    this._classrooms$,
    this._viewingClassroomId$,
  ]).pipe(
    map(([classrooms, viewingClassroomId]) =>
      classrooms.find(({ id }) => id === viewingClassroomId)
    )
  );
  public readonly viewingClassroom = toSignal(this._viewingClassroom$);

  private readonly _viewingConfigurationId$ = new BehaviorSubject<
    string | undefined
  >(INITIAL_CLASSROOMS[0].configurations[0].id);
  public readonly viewingConfigurationId = toSignal(
    this._viewingConfigurationId$
  );

  private readonly _viewingConfiguration$ = combineLatest([
    this._viewingClassroom$,
    this._viewingConfigurationId$,
  ]).pipe(
    map(([classroom, viewingConfigurationId]) =>
      classroom?.configurations.find(({ id }) => id === viewingConfigurationId)
    )
  );
  public readonly viewingConfiguration = toSignal(this._viewingConfiguration$);

  public deleteClassroom(classroomId: string) {
    this._classrooms$.next(
      this._classrooms$.getValue().filter(({ id }) => id !== classroomId)
    );
  }

  public updateClassroomDescription(classroomId: string, description: string) {
    this._classrooms$.next(
      this._classrooms$.getValue().map((classroom) => {
        if (classroom.id === classroomId) {
          classroom.description = description;
        }
        return { ...classroom };
      })
    );
  }

  public updateClassroomLabel(classroomId: string, label: string) {
    this._classrooms$.next(
      this._classrooms$.getValue().map((classroom) => {
        if (classroom.id === classroomId) {
          classroom.label = label;
        }
        return { ...classroom };
      })
    );
  }

  public viewClassroom(classroomId: string) {
    this._viewingClassroomId$.next(classroomId);
  }

  public addClassroom(label: string) {
    this._classrooms$.next(
      this._classrooms$.getValue().concat([
        {
          configurations: [],
          fields: [],
          id: generateUniqueId(),
          label,
          students: [],
          description: '',
        },
      ])
    );
  }

  public updateConfigurationDescription(
    classroomId: string,
    configurationId: string,
    description: string
  ) {
    this._classrooms$.next(
      this._classrooms$.getValue().map((classroom) => {
        if (classroom.id === classroomId) {
          classroom.configurations.map((configuration) => {
            if (configuration.id === configurationId) {
              configuration.description = description;
            }
            return { ...configuration };
          });
        }
        return { ...classroom };
      })
    );
  }

  public updateConfigurationLabel(
    classroomId: string,
    configurationId: string,
    label: string
  ) {
    this._classrooms$.next(
      this._classrooms$.getValue().map((classroom) => {
        if (classroom.id === classroomId) {
          classroom.configurations.map((configuration) => {
            if (configuration.id === configurationId) {
              configuration.label = label;
            }
            return { ...configuration };
          });
        }
        return { ...classroom };
      })
    );
  }

  public deleteConfiguration(classroomId: string, configurationId: string) {
    this._classrooms$.next(
      this._classrooms$.getValue().map((classroom) => {
        if (classroom.id === classroomId) {
          classroom.configurations = classroom.configurations.filter(
            ({ id }) => configurationId !== id
          );
        }
        return { ...classroom };
      })
    );
  }

  public updateColumns(
    classroomId: string,
    configurationId: string,
    columns: ClassroomColumn[]
  ) {
    this._classrooms$.next(
      this._classrooms$.getValue().map((classroom) => {
        if (classroom.id === classroomId) {
          classroom.configurations.map((configuration) => {
            if (configuration.id === configurationId) {
              configuration.columns = columns;
            }
            return { ...configuration };
          });
        }
        return { ...classroom };
      })
    );
  }

  public createColumn(
    classroomId: string,
    column: ClassroomColumn,
    field: ClassroomField
  ) {
    const newClassrooms: Classroom[] = [
      ...this._classrooms$.getValue().map((classroom) => {
        if (classroom.id === classroomId) {
          classroom.configurations.map((configuration) => {
            configuration.columns = [...configuration.columns, column];
            return { ...configuration };
          });
          classroom.fields = [...classroom.fields, field];
        }
        return { ...classroom };
      }),
    ];
    this._classrooms$.next(
      JSON.parse(JSON.stringify(newClassrooms)) as Classroom[]
    );
  }

  public viewConfiguration(configurationId: string) {
    this._viewingConfigurationId$.next(configurationId);
  }

  public addConfiguration(classroomId: string, label: string) {
    this._classrooms$.next(
      this._classrooms$.getValue().map((classroom) => {
        if (classroom.id === classroomId) {
          classroom.configurations.push({
            columns: classroom.fields.map((field) => {
              const newCol: ClassroomColumn = {
                enabled: true,
                fieldId: field.id,
                id: generateUniqueId(),
                sort: ClassroomColumnSort.NONE,
              };
              return newCol;
            }),
            groups: [],
            id: generateUniqueId(),
            label,
          });
        }
        return { ...classroom };
      })
    );
  }
}