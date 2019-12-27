/*
  本服务提供请求后台的一系列方法
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { Observable } from 'rxjs';

// 参数接口类型
class Options {
  path: string; // 接口路径
  params?: any = {}; // 接口参数
}

// 发送请求接口类型
class Items {
  method: string; // 请求类型
  options: any = {}; // 请求参数配置
  observer?: any; // 观察者
  reject?: any; // promise拒绝
  resolve?: any; // promise成功
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  /*数据初始化*/
  bathUrl: string = '/api'; //api接口路径
  headers: any;//请求头

  constructor(private http: HttpClient, private router:Router, private message: NzMessageService) { }

  // 设置header
  setHeaders(sort?) {
    this.headers = new HttpHeaders({'Content-Type': 'application/json;charset=UTF-8'});
    let token = sessionStorage.getItem('token'); 
    if(token){
      if (sort && sort === 'postImg') {
        this.headers = new HttpHeaders({'Authorization': token});
      } else {
        this.headers = new HttpHeaders({'Authorization': token, 'Content-Type': 'application/json;charset=UTF-8'});
      }
    }else{
      this.router.navigate(['/login']);
    }
  }

  //错误处理
  handleError(error, items) {
    let noRefreshPath = ['/login', '/auth', '/google-bind']
    if(+error.status === 500){
      this.message.create('error', '服务异常，请稍后重试！');
      items.reject(error)
    } else if(+error.status === 401 && items.options && !noRefreshPath.filter(v => v === items.options.path).length) { // token失效调用refresh_token重新获取token
      let params = {
        refresh_token: sessionStorage.getItem('refresh_token')
      }
      this.post({path: '/refresh-token', params}).then((data: any = {}) => {
        if (data.access_token) {
          sessionStorage.setItem("token", "JWT " + data.access_token);
          sessionStorage.setItem("refresh_token", data.refresh_token);
          this.request(items)
        }
      }).catch(() => {})
    } else if(+error.status === 403){
      this.message.create('error', '登录失效，请重新登录');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refresh_token');
      this.router.navigate(['/login']);
      items.reject(error)
    } else {
      console.log(error)
      let errTxt = '接口报错！'
      let err = error.error && error.error.description ? error.error.description : ''
      if (err) {
        if (typeof err === 'object') {
          errTxt = JSON.stringify(error.error)
        } else {
          errTxt = err
        }
      }
      this.message.create('error', errTxt);
      items.reject(error)
    }
    
    if (+error.status !== 401) {
      if (items.method === 'postImg') {
        items.observer.error(error)
      }      
    }
  }

  // 测试接口，返回的是请求的参数params，可以通过在params对象中添加属性，属性值设置为测试数据，来实现模拟数据
  testApi(options: Options) {
    return new Promise((resolve, reject) =>{
      setTimeout(() => {
        if (Math.random() < 0.95) {
          resolve(options.params)
        } else {
          this.message.create('error', '接口报错');
        }
      }, 1000)      
    })
  }

  // get请求
  get(options: Options) {
    return new Promise((resolve, reject) => {
      this.request({method: 'get', options, resolve, reject})
    })
  }

  // post请求
  post(options: Options) {
    return new Promise((resolve, reject) => {
      this.request({method: 'post', options, resolve, reject})
    })
  }

  // del请求
  del(options: Options) {
    return new Promise((resolve, reject) => {
      this.request({method: 'delete', options, resolve, reject})
    })
  }

  // put请求
  put(options: Options) {
    return new Promise((resolve, reject) => {
      this.request({method: 'put', options, resolve, reject})
    })
  }

  // post请求
  postImg(options: Options) {
    return new Observable(observer => {
      this.request({method: 'postImg', options, observer})
    })
  }

  // 发送请求
  request(items: Items) {
    this.setHeaders(items.method);
    let observer;
    if (items.method === 'get') {
      observer = this.http[items.method](this.bathUrl + items.options.path, {params: items.options.params, headers: this.headers})
    } else if (items.method === 'delete') {
      const options = {headers: this.headers, body: items.options.params}
      observer = this.http[items.method](this.bathUrl + items.options.path, options)
    } else if (items.method === 'post' || items.method === 'put') {
      observer = this.http[items.method](this.bathUrl + items.options.path, items.options.params, {headers: this.headers})
    } else if (items.method === 'postImg') {
      const formData = new FormData();
      formData.append('file', items.options.params);
      const req = new HttpRequest('POST', this.bathUrl + items.options.path, formData, {
        reportProgress: true,
        withCredentials: true,
        headers: this.headers
      });
      observer = this.http.request(req)
    }
    observer.subscribe(data => {
      if (items.method === 'postImg') {
        items.observer.next(data);
      } else {
        items.resolve(data)
      }
    }, error => {
      this.handleError(error, items)
    })
  }

}
