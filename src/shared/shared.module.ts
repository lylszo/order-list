import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PluginsModule } from './plugins/plugins.module';

import { ServiceModule } from './service/service.module';
import { PipeModule } from './pipe/pipe.module';
import { DirectiveModule } from './directive/directive.module';
import { ComponentModule } from './component/component.module';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ServiceModule.forRoot(),
  	PipeModule,
  	DirectiveModule,
  	ComponentModule,
    PluginsModule,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ServiceModule,
  	PipeModule,
  	DirectiveModule,
  	ComponentModule,
    PluginsModule,
  ],
  providers: []
})
export class SharedModule { }
