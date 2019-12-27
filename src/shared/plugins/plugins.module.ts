import { NgModule } from '@angular/core';

import { AntModule } from './ant.module'; // ant-design
import { Qrcode } from './qrcode.module'; // ng2_qrcode

@NgModule({
  imports: [
    AntModule,
    Qrcode
  ],
  exports: [
    AntModule,
    Qrcode
  ]
})

export class PluginsModule { }