import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accountType'
})
export class AccountTypePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let obj = {
      '0': '客服',
      '1': '管理员',
    }
    return obj[value] || '-';
  }

}