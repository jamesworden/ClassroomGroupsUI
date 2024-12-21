import { Routes } from '@angular/router';
import { LandingViewComponent } from './views/landing-view/landing-view.component';
import { ClassroomsViewComponent } from './views/classrooms-view/classrooms-view.component';
import { ClassroomViewComponent } from './views/classroom-view/classroom-view.component';
import { PageNotFoundViewComponent } from './views/page-not-found-view/page-not-found-view.component';
import { SignInViewComponent } from './views/sign-in-view/sign-in-view.component';
import { SignUpViewComponent } from './views/sign-up-view/sign-up-view.component';

export const routes: Routes = [
  { path: '', component: LandingViewComponent },
  {
    path: 'sign-in',
    component: SignInViewComponent,
  },
  {
    path: 'sign-up',
    component: SignUpViewComponent,
  },
  {
    path: 'classrooms',
    component: ClassroomsViewComponent,
  },
  {
    path: 'classrooms/:id',
    component: ClassroomViewComponent,
  },
  { path: '**', component: PageNotFoundViewComponent },
];
