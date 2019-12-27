import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module'
import { LoginComponent } from './login.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent }
];

@NgModule({
  imports:[
    RouterModule.forChild(routes),
    SharedModule,
  ],
  declarations: [
    LoginComponent
  ]
})
export class LoginModule { }