import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module'
import { LayoutComponent } from './layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
        { path: '', loadChildren: '../home/home.module#HomeModule' },
        { path: 'admin', loadChildren: '../admin/admin.module#AdminModule' },
        { path: '**', redirectTo: ''}
    ]
  },
  { path: '**', redirectTo: ''}
];

@NgModule({
  imports:[
    RouterModule.forChild(routes),
    SharedModule,
  ],
  declarations: [
    LayoutComponent
  ]
})
export class LayoutModule { }