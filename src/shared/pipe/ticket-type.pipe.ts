import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ticketType'
})
export class TicketTypePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let obj = {
      'tag': '标签缺失或错误',
    }
    return obj[value] || '-';
  }

}