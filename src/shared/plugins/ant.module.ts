import { NgModule } from '@angular/core';

// antd
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
registerLocaleData(zh);

@NgModule({
  imports: [
    NgZorroAntdModule,
  ],
  exports: [
    NgZorroAntdModule,
  ],
  providers: [{ provide: NZ_I18N, useValue: zh_CN }]
})

export class AntModule { }