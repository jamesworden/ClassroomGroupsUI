import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { StoreModule } from '@ngrx/store';
import { counterReducer } from './classrooms.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(StoreModule.forRoot({ count: counterReducer })),
  ],
};
