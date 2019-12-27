import { NgModule } from '@angular/core';
import { QRCodeModule } from 'angular2-qrcode';

@NgModule({
  imports: [
    QRCodeModule,
  ],
  exports: [
    QRCodeModule,
  ]
})

export class Qrcode { }