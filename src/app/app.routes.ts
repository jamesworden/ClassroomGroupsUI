import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-view/landing-view.component';
import { ClassroomsPageComponent } from './pages/classrooms-view/classrooms-view.component';
import { ClassroomPageComponent } from './pages/classroom-view/classroom-view.component';
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
