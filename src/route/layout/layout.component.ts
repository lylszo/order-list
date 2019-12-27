import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../shared/service/http.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonService } from '../../shared/service/common.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy  {

  constructor(
    private router: Router, 
    private http: HttpService,
    private common: CommonService, 
    private modalService: NzModalService,
    private message: NzMessageService,
    private fb: FormBuilder
  ) { }

  // 初始化数据
  user: any = {};
  token = sessionStorage.getItem('token');
  activeLink = ''; // 当前激活菜单栏
  userInfoObserver;//用户信息观察者对象

  ngOnInit() {
    if (!this.token) {
      this.router.navigate(['/login']);
    } else {
      this.userInfoObserver = this.common.getUserInfo(data => {
        this.user = data;
      })      
    }
    let routerNameArr = /\w+/.exec(this.router.url)
    this.activeLink = routerNameArr ? routerNameArr[0] : ''
  }

  //点击导航菜单
  toggleActive(activeName){
    this.activeLink = activeName
  }

  // 修改密码
  resetModal = false; // 是否显示修改密码弹框
  resetForm: FormGroup; // 修改密码表单
  // 打开修改密码弹框
  openResetModal(){
    this.resetForm = this.fb.group({
      old_password: [ null, [ this.passwordValidator ] ],
      new_password: [ null, [ this.passwordValidator ] ],
      password2: [ null, [ this.password2Validator ] ],
    }); 
    this.resetModal = true;
  }

  // 校验表单
  submitForm(form): void {
    for (const i in this[form].controls) {
      this[form].controls[i].markAsDirty();
      this[form].controls[i].updateValueAndValidity();
    }
  }

  // 确定修改密码
  editOkLoading = false; // 确定修改loading
  resetOk(){
    this.submitForm('resetForm')
    if(this.resetForm.invalid){
      this.message.create('info', '请按提示填写数据');
      return;
    }
    let params:any = {...this.resetForm.value};
    delete params.password2
    this.editOkLoading = true;
    this.http.put({path: '/user-info', params}).then(() => {
      this.logoutFn()
      this.resetModal = false;
      this.editOkLoading = false;
      this.message.create('success', '修改成功，请重新登录！');
    }).catch(err => {
      this.editOkLoading = false;
    })
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

  // 确认密码是否一致表单验证
  password2Validator = (control: FormControl) => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value !== this.resetForm.controls.new_password.value) {
      return { password2: true, error: true };
    }
    return {};
  }

  //退出登录
  logout(){
    this.modalService.confirm({
      nzTitle: '确定退出登录吗?',
      nzOnOk: this.logoutFn
    })
  }

  // 退出登录函数
  logoutFn = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  menuActive = false; // 当前是否激活菜单栏
  // 下拉菜单显示状态变化函数
  downMenuVisibleChange(bool) {
    this.menuActive = bool
  }

  //组件销毁前取消订阅用户信息
  ngOnDestroy(){
    if (sessionStorage.getItem('token')) {
      this.userInfoObserver.unsubscribe();
    }
  }

}
