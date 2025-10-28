import { Routes } from '@angular/router';
import { DashboardView } from '../views/dashboard-view/dashboard-view';

export const routes: Routes = [
    {
        path: '',
        component: DashboardView,
        pathMatch: 'full'
    },
    {
        path: '**',
        component: DashboardView
    }
];
