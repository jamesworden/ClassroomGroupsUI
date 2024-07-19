import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ResizableService {
  private readonly resizingIds = signal(new Set<string>());

  public readonly isResizingMultiple = computed(
    () => this.resizingIds().size > 1
  );

  public readonly isResizing = computed(() => this.resizingIds().size > 0);

  public addResizingId(resizingId: string) {
    const existingIds = this.resizingIds();
    existingIds.add(resizingId);
    this.resizingIds.set(new Set<string>(existingIds));
  }

  public removeResizingId(resizingId: string) {
    const existingIds = this.resizingIds();
    existingIds.delete(resizingId);
    this.resizingIds.set(new Set<string>(existingIds));
  }
}
