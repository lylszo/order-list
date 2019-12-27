import { NgModule } from '@angular/core';
import { DemoDirective } from './demo.directive';

@NgModule({
  declarations: [
  	DemoDirective
  ],
  exports: [
  	DemoDirective
  ]
})
export class DirectiveModule { }