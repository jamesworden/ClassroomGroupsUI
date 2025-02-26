import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { ClassroomsPageComponent } from './pages/classrooms-page/classrooms-page.component';
import { ClassroomPageComponent } from './pages/classroom-page/classroom-page.component';
import { NotFoundPageComponent } from './pages/page-not-found-page/page-not-found-page.component';
import { SignInPageComponent } from './pages/sign-in-page/sign-in-page.component';
import { SignUpViewComponent } from './pages/sign-up-page/sign-up-page.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  {
    path: 'sign-in',
    component: SignInPageComponent,
  },
  {
    path: 'sign-up',
    component: SignUpViewComponent,
  },
  {
    path: 'classrooms',
    component: ClassroomsPageComponent,
  },
  {
    path: 'classrooms/:classroomId',
    component: ClassroomPageComponent,
  },
  {
    path: 'classrooms/:classroomId/configurations/:configurationId/:configurationViewMode',
    component: ClassroomPageComponent,
  },
  { path: '**', component: NotFoundPageComponent },
];
