import { computed, Signal } from '@angular/core';
import { ClassroomsState } from './classrooms.service';
import { ConfigurationViewModel } from './models';
import { getColumnViewModels } from './logic/get-view-models';

export class ClassroomSelectors {
  constructor(private _state: Signal<ClassroomsState>) {}

  private readonly configurationViewModels: Signal<ConfigurationViewModel[]> =
    computed(() =>
      this._state().configurationDetails.map((configurationDetail) => ({
        ...configurationDetail,
        columnDetails: getColumnViewModels(configurationDetail.columnDetails),
      }))
    );

  public readonly classroomDetails = computed(() =>
    this._state().classroomDetails.sort((a, b) =>
      a.label.localeCompare(b.label)
    )
  );

  public readonly classroomDetail = (classroomId?: string) =>
    computed(() => this.classroomDetails().find((c) => c.id === classroomId));

  public readonly configurationDetail = (configurationId?: string) =>
    computed(() =>
      this.configurationViewModels().find((c) => c.id === configurationId)
    );

  public readonly configurationDetails = (classroomId?: string) =>
    computed(() =>
      this.configurationViewModels().filter(
        (c) => c.classroomId === classroomId
      )
    );

  public readonly configurations = (classroomId?: string) =>
    computed(() =>
      this._state()
        .configurations.filter((c) => c.classroomId === classroomId)
        .sort((a, b) => a.label.localeCompare(b.label))
    );

  public readonly configuration = (
    classroomId?: string,
    configurationId?: string
  ) =>
    computed(() =>
      this.configurations(classroomId)()?.find((c) => c.id == configurationId)
    );

  public readonly classroomsLoading = computed(
    () => this._state().classroomsLoading
  );

  public readonly loadingConfigurationDetailIds = computed(
    () => this._state().loadingConfigurationDetailIds
  );

  public readonly configurationsLoading = computed(
    () => this._state().configurationsLoading
  );

  public readonly configurationLoading = (configurationId?: string) =>
    computed(() =>
      configurationId
        ? this._state().loadingConfigurationDetailIds.has(configurationId)
        : false
    );

  public readonly columnDetails = (configurationId?: string) =>
    computed(
      () => this.configurationDetail(configurationId)()?.columnDetails
    )() ?? [];

  public readonly groupDetails = (configurationId?: string) =>
    computed(
      () => this.configurationDetail(configurationId)()?.groupDetails ?? []
    );

  public readonly listGroupDetails = (configurationId?: string) =>
    computed(() =>
      this.groupDetails(configurationId)().filter(
        (g) =>
          g.id !== this.configurationDetail(configurationId)()?.defaultGroupId
      )
    );

  public readonly groupIds = (configurationId?: string) =>
    computed(() => this.groupDetails(configurationId)().map(({ id }) => id));

  public readonly configurationUpdating = (configurationId?: string) =>
    computed(() =>
      configurationId
        ? this._state().updatingConfigurationIds.has(configurationId)
        : false
    );

  public readonly classroomUpdating = (classroomId?: string) =>
    computed(() =>
      classroomId ? this._state().updatingClassroomIds.has(classroomId) : false
    );

  public readonly groupUpdating = (groupId?: string) =>
    computed(() =>
      groupId ? this._state().updatingGroupIds.has(groupId) : false
    );

  public readonly configurationIds = (classroomId?: string) =>
    computed(() => this.configurations(classroomId)().map(({ id }) => id));

  public readonly defaultGroup = (configurationId?: string) =>
    computed(() => {
      const configurationDetail = this.configurationDetail(configurationId)();
      return configurationDetail?.groupDetails.find(
        (g) => g.id === configurationDetail.defaultGroupId
      );
    });

  public readonly studentsInConfiguration = (configurationId?: string) =>
    computed(
      () =>
        this.configurationDetail(configurationId)()?.groupDetails?.flatMap(
          (g) => g.studentDetails
        ) || []
    );
}
