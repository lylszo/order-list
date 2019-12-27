import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../shared/service/http.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  //数据初始化
  loginForm: FormGroup; // 登录表单
  loginLoading = false; // 登录表单确认loading

  constructor(private router: Router, private fb: FormBuilder, private http: HttpService, private message: NzMessageService) { }

  ngOnInit() {
    if (sessionStorage.getItem('token')) {
      this.router.navigate(['/']);
    }
    this.loginForm = this.fb.group({
      username: [ null, [ Validators.required ] ],
      password: [ null, [ this.passwordValidator ] ]
    });
  }

  // 校验表单
  submitForm(form): void {
    for (const i in this[form].controls) {
      this[form].controls[i].markAsDirty();
      this[form].controls[i].updateValueAndValidity();
    }
  }

  // 校验密码为 大写字母/小写字母/数字/特殊字符 中至少三种
  passwordValidator = (control: FormControl) => {
    let val = control.value
    if (!val) {
      return { error: true, required: true };
    } else if (!/^.{6,12}$/.test(val)) {
      return { passwordLength: true, error: true };
    } else if ([
        /[0123456789]+/.test(val),
        /[a-z]+/.test(val),
        /[A-Z]+/.test(val),
        /[\!@#\$%\^&\*\(\)\-_\=\+\[\{\]\};:',<\.>\?\/]+/.test(val)
      ].filter(v => v).length < 3
    ) {
      return { error: true, passwordPattern: true };
    }
    return {};
  }

  // 校验谷歌验证码
  googleValidator = (control: FormControl) => {
    let val = control.value
    if (!val) {
      return { error: true, required: true };
    } else if (!/^\d{6}$/.test(val)) {
      return { pattern: true, error: true };
    }
    return {};
  }

  // 点击登录按钮
  googleModal = false; // 是否显示谷歌验证弹框
  googleForm: FormGroup; // 登录表单
  identity = ''; // 登录标识
  openGoogle = false; // 是否已经绑定了谷歌验证
  qr = ''; // 谷歌验证注册二维码链接
  login(values){
    this.submitForm('loginForm')
    if(this.loginForm.invalid) {
      return
    }
    let params = {...values}
    this.loginLoading = true;
    this.http.post({path: "/login", params}).then((data: any = {}) => {
      this.identity = data.identity || ''
      this.openGoogle = !!data.google_bind
      this.qr = data.opt_url
      // 打开谷歌验证弹框
      this.googleForm = this.fb.group({
        google_code: [ null, [ this.googleValidator ] ]
      });
      this.googleModal = true
    }).catch(() => {
      this.loginLoading = false;
    })
  }

  // 谷歌验证确定
  googleLoading = false; // 谷歌验证确定loading
  googleOk() {
    this.submitForm('googleForm')
    if(this.googleForm.invalid){
      return;
    }
    let params:any = {
      ...this.googleForm.value, 
      identity: this.identity
    }
    this.googleLoading = true
    this.http.post({path: this.openGoogle ? '/auth' : '/google-bind', params}).then((data: any={}) => {
      if (data.access_token) {
        sessionStorage.setItem("token", "JWT " + data.access_token);
        sessionStorage.setItem("refresh_token", data.refresh_token);       
      }
      this.router.navigate(['/home']);
      this.message.create('success', '登录成功！');
      this.googleLoading = false
      this.loginLoading = false;
      this.googleModal = false;
    }).catch(err => {
      this.googleLoading = false
    })
  }

  // 谷歌确定取消
  googleCancel() {
    this.googleModal = false
    this.loginLoading = false
  }
}
