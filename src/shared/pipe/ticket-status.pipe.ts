import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ticketStatus'
})
export class TicketStatusPipe implements PipeTransform {

  transform(value: any, args?: any): any {
  	let obj = {
  		'1': '处理失败',
  		'2': '待处理',
  		'0': '处理成功',
  	}
    return obj[value] || '-';
  }

}