/*
	本服务提供获取项目中多次使用的一些数据
*/
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
  	providedIn: 'root'
})
export class CommonService {

 	constructor(private http: HttpService) { }

  	//用户信息
  	userInfo$ = new Subject();
  	//获取当前用户信息,如果已经请求了用户信息就返回之前请求的数据
  	getUserInfo(callback){
      let thisSubscrible = this.userInfo$.subscribe(data => {
        callback(data);
      })
      this.http.get({path: '/user-info', params: {}}).then(data => {
        this.userInfo$.next(data);
      })
      return thisSubscrible;
  	}
}
