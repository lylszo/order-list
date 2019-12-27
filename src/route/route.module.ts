import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginModule } from './login/login.module';
import { LayoutModule } from './layout/layout.module';
import { HomeModule } from './home/home.module';
import { AdminModule } from './admin/admin.module';

@NgModule({
  imports: [
    RouterModule.forRoot([]),
    LoginModule,
    LayoutModule,
    HomeModule,
    AdminModule,
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class RouteModule { }
