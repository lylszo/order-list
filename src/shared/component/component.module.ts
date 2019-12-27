import { NgModule } from '@angular/core';

import { DemoComponent } from './demo/demo.component';

@NgModule({
  declarations: [
  	DemoComponent
  ],
  exports: [
  	DemoComponent
  ]
})
export class ComponentModule { }