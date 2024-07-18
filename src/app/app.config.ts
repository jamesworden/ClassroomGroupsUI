import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { StoreModule } from '@ngrx/store';
import { classroomsReducer } from './state/classrooms/classrooms.reducer';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(StoreModule.forRoot({ classrooms: classroomsReducer })),
    provideAnimationsAsync(),
  ],
};
