import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../shared/service/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService, UploadFile, NzModalService } from 'ng-zorro-antd';
import { CommonService } from '../../shared/service/common.service';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { UploadXHRArgs } from 'ng-zorro-antd/upload';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private modalService: NzModalService,
    private common: CommonService
  ) { }

  // 初始化数据
  user:any = {};
  userInfoObserver;//用户信息观察者对象
  key:string;
  list = [];//所有项目列表
  myList = [];//我创建的项目列表
  tableLoading:boolean = false;//是否在请求数据
  mapOfExpandData: { [key: string]: boolean } = {};
  searchForm: FormGroup; // 搜索表单
  currentParams = {}; // 当前搜索条件

  ngOnInit() {
    this.searchForm = this.fb.group({
      tx_id: [ '' ],
      tag: [ '' ],
      status: [ '' ],
      coin: [ '' ],
      time: [ [] ],
    });
    this.getMyList();
    this.userInfoObserver = this.common.getUserInfo(data => {
      this.user = data;
    })
  }

  //组件销毁前取消订阅用户信息
  ngOnDestroy(){
    this.userInfoObserver.unsubscribe();
  }

  // 搜索数据
  search(){
    this.submitForm('searchForm')
    if(this.searchForm.invalid){
      return;
    }
    let searchParams:any = {}
    for (let i in this.searchForm.value) {
      if (this.searchForm.value[i]) {
        searchParams[i] = this.searchForm.value[i]
      }
    }
    if (searchParams.time && searchParams.time[0]) {
      searchParams.start_date = new Date(searchParams.time[0].toLocaleString().slice(0, 11) + '00:00:00').getTime()
      searchParams.end_date = new Date(searchParams.time[1].toLocaleString().slice(0, 11) + '23:59:59').getTime()
    }
    delete searchParams.time
    this.getMyList({...searchParams})
  }

  // 中表单
  reset() {
    this.searchForm = this.fb.group({
      tx_id: [ '' ],
      tag: [ '' ],
      status: [ '' ],
      coin: [ '' ],
      time: [ [] ],
    });
    this.getMyList({})
  }
  
  //获取我创建的项目列表
  currentPage = 1; // 当前页码
  page_size = 10; // 每天显示条数
  total_count = 0; // 搜索出来的数据量
  getMyList(searchParams?){
    let params:any;
    if (searchParams) {
      this.currentPage = 1
      params = {
        page: 1,
        page_size: this.page_size,
        ...searchParams
      }      
    } else {
      params = {
        ...this.currentParams,
        page: this.currentPage,
        page_size: this.page_size,
      }
    }
    this.tableLoading = true;
    this.http.get({path: '/ticket', params}).then((data:any = {}) => {
      this.tableLoading = false;
      this.currentParams = params
      this.myList = (data.items || []).map(v => {
        let domain = environment.production ? '/api' : 'http://order-system.t.youbank.top/api'
        if (v.image_path && v.image_path.length) {
          let imgList = v.image_path.map(v => domain + v)
          v.image_path = imgList
        }
        return v
      })
      this.total_count = data.total_count || 0
    }).catch(error => {
      this.myList = []
      this.tableLoading = false;
    })
  }
  
  //新建/编辑 项目
  addModal = false; // 是否显示新建工单弹框
  addForm: FormGroup; // 添加工单表单
  editModal = false; // 是否显示编辑工单弹框
  editForm: FormGroup; // 编辑工单表单
  editTitle = '编辑工单'; // 编辑工单弹框标题
  activeItem:any; //当前编辑工单
  sessionStorage = sessionStorage;
  //打开新建/编辑 项目弹框
  openModal(item?){
    if(item){
      this.activeItem = item;
      this.editTitle = `编辑工单（ID：${item.id}）`;
      if(item.icon){
        this.fileList = [
          {url: item.icon}
        ];
      }else{
        this.fileList = [];
      }
      let coinList = ['XRP', 'EOS']
      this.editForm = this.fb.group({
        coin: [ coinList.filter(v => v === item.coin).length ? item.coin : 'EOS', [ Validators.required ] ],
        tag: [ item.tag, [ Validators.required ] ],
        user: [ item.user, [] ],
        tx_id: [ item.tx_id, [ Validators.required ] ],
      }); 
      this.editModal = true;
    }else{
      this.fileList = [];
      this.addForm = this.fb.group({
        ticket_type: [ 'tag', [ Validators.required ] ],
        coin: [ 'EOS', [ Validators.required ] ],
        tag: [ '', [ Validators.required ] ],
        remark: [ '', [] ],
        user: [ '', [] ],
        tx_id: [ '', [ Validators.required ] ],
      }); 
      this.addModal = true;
    }
  }

  // 校验表单
  submitForm(form): void {
    for (const i in this[form].controls) {
      this[form].controls[i].markAsDirty();
      this[form].controls[i].updateValueAndValidity();
    }
  }

  //确定新建工单
  addOkLoading = false; // 确定新建工单loading
  addOk(){
    this.submitForm('addForm')
    if(this.addForm.invalid){
      this.message.create('info', '请按提示填写数据');
      return;
    }
    let params:any = {...this.addForm.value};
    if(this.fileList.length){
      params.image_path = this.fileList.map(v => v.response && v.response[0])
    }
    if (!params.image_path.length) {
      this.message.create('info', '请上传图片');
      return;
    }
    this.addOkLoading = true;
    this.http.post({path: '/create-ticket', params}).then(() => {
      this.getMyList();
      this.addModal = false;
      this.addOkLoading = false;
      this.message.create('success', '创建成功！');
    }).catch(() => {
      this.addOkLoading = false;
    })
  }

  //确定编辑项目
  editOkLoading = false; // 编辑确定loading
  editOk(){
    this.submitForm('editForm')
    if(this.editForm.invalid){
      this.message.create('info', '请按提示填写数据');
      return;
    }

    let params:any = {...this.editForm.value};
    params.ticket_id = this.activeItem.ticket_id
    this.editOkLoading = true
    this.http.put({path: `/edit-ticket/${this.activeItem.id}`, params}).then(() => {
      for (let i in params) {
        if (i !== 'ticket_id') {
          this.activeItem[i] = params[i]
        }
      }
      this.editOkLoading = false;
      this.editModal = false;
      this.message.create('success', '编辑成功！');
    }).catch(() => {
      this.editOkLoading = false;
    })

  }

  // 处理工单确认弹框
  handleId = 0; // 当前处理的工单id
  handleLastTime = 0;// 上次处理同个工单的时间
  handleIt(item){
    this.modalService.confirm({
      nzTitle: `确认处理ID为${item.id}的工单吗?`,
      nzOnOk: () => {
        return new Promise((resolve, reject) => {
          if (this.handleId === item.id && (new Date().getTime() - this.handleLastTime < 5000)) {
            this.message.create('warning', '操作过于频繁，请稍后重试！');
            resolve(false)
            return
          }
          this.handleId = item.id
          this.http.post({path: `/handle/${item.id}`}).then((data:any = {}) => {
            item.status = data.status || 0
            item.handler = data.handler
            item.handled_at = data.handled_at
            this.message.create('success', '处理成功！');
            this.handleLastTime = new Date().getTime()
            resolve(true)
          }, err => {
            if (+err.status === 400) {
              let obj = (err.error && err.error.data) ? err.error.data : {}
              item.status = obj.status || 1
              item.handler = obj.handler
              item.handled_at = obj.handled_at
              item.error_message = err.error ? err.error.description : '-'
            }
            this.handleLastTime = new Date().getTime()
            resolve(false)
          })
        })        
      }
    });
  }

  //上传图片
  fileList = [];
  previewImage = '';
  previewVisible = false;
  //图片预览
  handlePreview = (file: UploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  }

  // 自定义上传请求
  customReq = (item: UploadXHRArgs) => {
    return this.http.postImg({path: '/upload', params: item.file}).subscribe((event:HttpEvent<any>) => {
      if (event.type === HttpEventType.UploadProgress) {
        if (event.total! > 0) {
          (event as any).percent = (event.loaded / event.total!) * 100;
        }
        item.onProgress!(event, item.file!);
      } else if (event instanceof HttpResponse) {
        item.onSuccess!(event.body, item.file!, event);
      }
    }, err => {
      item.onError!(err, item.file!);
    });
  }

  // 预览列表图片
  listImgVisible = false; // 列表显示图片预览弹框是否显示
  listImgUrl = '';
  handleListImg = (url) => {
    this.listImgUrl = url
    this.listImgVisible = true
  }

  // 查看工单处理记录
  openHistoryModal = false; // 打开工单处理记录弹框
  historyTableLoading = false; // 加载工单处理记录列表
  historyList = []; // 工单记录列表
  history(item) {
    this.openHistoryModal = true;
    this.historyTableLoading = true;
    this.http.get({path: `/trace-ticket/${item.id}`}).then((data:any = []) => {
      this.historyTableLoading = false;
      this.historyList = data || []
    }).catch(error => {
      this.historyTableLoading = false;
    })
  }

}
