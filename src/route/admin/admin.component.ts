import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../shared/service/http.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NzMessageService, UploadFile, NzModalService } from 'ng-zorro-antd';
import { CommonService } from '../../shared/service/common.service';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { UploadXHRArgs } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  constructor(
    private router: Router,
    private http: HttpService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private modalService: NzModalService,
    private common: CommonService
  ) { }

  // 初始化数据
  user:any = {};
  userInfoObserver;//用户信息观察者对象
  myList:any = [];//我创建的项目列表
  tableLoading:boolean = false;//是否在请求数据

  ngOnInit() {
    this.getMyList();
    this.userInfoObserver = this.common.getUserInfo(data => {
      this.user = data;
    })
  }

  // 组件销毁前取消订阅用户信息
  ngOnDestroy(){
    this.userInfoObserver.unsubscribe();
  }
  
  // 获取账户列表
  getMyList(){
    let params = {}
    this.tableLoading = true;
    this.http.get({path: '/user-list', params}).then((data:any = []) => {
      this.tableLoading = false;
      this.myList = data || []
    }).catch(error => {
      this.myList = []
      this.tableLoading = false;
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
    } else if (control.value !== this.addForm.controls.password.value) {
      return { password2: true, error: true };
    }
    return {};
  }
  
  // 添加账号
  addModal = false; // 是否显示新建工单弹框
  addForm: FormGroup; // 添加工单表单
  activeItem:any; //当前编辑工单
  sessionStorage = sessionStorage;
  // 打开添加账号弹框
  openAddModal(){
    this.addForm = this.fb.group({
      role: [ '0', [ Validators.required ] ],
      username: [ null, [ Validators.required ] ],
      password: [ null, [ this.passwordValidator ] ],
      password2: [ null, [ this.password2Validator ] ],
    }); 
    this.addModal = true;
  }

  // 校验表单
  submitForm(form): void {
    for (const i in this[form].controls) {
      this[form].controls[i].markAsDirty();
      this[form].controls[i].updateValueAndValidity();
    }
  }

  // 确定添加账号
  addOkLoading = false; // 确定添加loading
  addOk(){
    this.submitForm('addForm')
    if(this.addForm.invalid){
      this.message.create('info', '请按提示填写数据');
      return;
    }
    let params:any = {...this.addForm.value};
    delete params.password2
    this.addOkLoading = true
    this.http.post({path: '/register', params}).then(() => {
      this.getMyList();
      this.addModal = false;
      this.addOkLoading = false;
      this.message.create('success', '创建成功！');
    }).catch(err => {
      this.addOkLoading = false;
    })
  }

  // 删除账号
  delAccount(item){
    this.modalService.confirm({
      nzTitle: `确定删除账号“${item.username}”吗?`,
      nzOnOk: () => {
        return new Promise(resolve => {
          let params = {user_id: item.user_id}
          this.http.del({path: '/user', params}).then(() => {
            this.message.create('success', '已删除！');
            let myList2 = [...this.myList]
            myList2.forEach((v, i, a) => {
              if (v.user_id === item.user_id) {
                a.splice(i, 1)
              }
            })
            this.myList = myList2
            resolve(true)
          }, err => {
            resolve(false)
          })
        })        
      }
    });
  }


}
