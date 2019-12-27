import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module'
import { HomeComponent } from './home.component';

const routes: Routes = [
  { path: '', component: HomeComponent }
];

@NgModule({
  imports:[
    SharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    HomeComponent
  ]
})
export class HomeModule { }
