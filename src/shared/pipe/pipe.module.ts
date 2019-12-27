import { NgModule } from '@angular/core';

import { DatePipe } from "@angular/common";
import { TicketStatusPipe } from './ticket-status.pipe';
import { TicketTypePipe } from './ticket-type.pipe';
import { AccountTypePipe } from './account-type.pipe';

@NgModule({
  providers: [
  	DatePipe
  ],
  declarations: [
  	TicketStatusPipe,
    TicketTypePipe,
    AccountTypePipe,
  ],
  exports: [
  	TicketStatusPipe,
    TicketTypePipe,
    AccountTypePipe,
  ]
})
export class PipeModule { }