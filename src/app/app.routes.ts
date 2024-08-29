import { Routes } from '@angular/router';
import { LandingViewComponent } from './views/landing-view/landing-view.component';
import { ClassroomsViewComponent } from './views/classrooms-view/classrooms-view.component';
import { ClassroomViewComponent } from './views/classroom-view/classroom-view.component';
import { PageNotFoundViewComponent } from './views/page-not-found-view/page-not-found-view.component';

export const routes: Routes = [
  { path: '', component: LandingViewComponent },
  {
    path: 'classrooms',
    component: ClassroomsViewComponent,
    children: [
      {
        path: ':classroomId',
        component: ClassroomViewComponent,
      },
    ],
  },

  { path: '**', component: PageNotFoundViewComponent },
];
