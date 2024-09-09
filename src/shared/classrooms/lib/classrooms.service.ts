import { computed, inject, Injectable, signal } from '@angular/core';
import { ClassroomDetail, ConfigurationDetail } from './models';

import { HttpClient } from '@angular/common/http';

interface ClassroomsState {
  classroomDetails: ClassroomDetail[];
  configurationDetails: ConfigurationDetail[];
}

@Injectable({
  providedIn: 'root',
})
export class ClassroomsService {
  readonly #httpClient = inject(HttpClient);

  private readonly _state = signal<ClassroomsState>({
    classroomDetails: [],
    configurationDetails: [],
  });

  public readonly classroomDetails = computed(
    () => this._state().classroomDetails
  );

  public readonly classroomDetail = (classroomId?: string) =>
    computed(() => this.classroomDetails().find((c) => c.id === classroomId));

  public readonly configurationDetail = (configurationId?: string) =>
    computed(() =>
      this._state().configurationDetails.find((c) => c.id === configurationId)
    );

  public getClassroomDetails() {
    return this.#httpClient
      .get<ClassroomDetail[]>('/api/v1/classrooms/classroom-details', {
        withCredentials: true,
      })
      .subscribe((classroomDetails) => {
        console.log('[Classrooms]', classroomDetails);
        this._state.set({
          ...this._state(),
          classroomDetails,
        });
      });
  }

  public getConfigurationDetail(configurationId: string) {
    return this.#httpClient
      .get<ConfigurationDetail[]>(
        `/api/v1/classrooms/configuration-detail/${configurationId}`,
        {
          withCredentials: true,
        }
      )
      .subscribe((configurationDetails) => {
        console.log('[Classrooms]', configurationDetails);
        this._state.set({
          ...this._state(),
          configurationDetails,
        });
      });
  }
}
