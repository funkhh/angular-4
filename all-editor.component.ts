import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, HostListener } from '@angular/core';
import { MatPaginator, MatSort, MatPaginatorIntl, MatCheckboxChange, MatSelectChange, MatDialog } from '@angular/material';
import { TableBase } from 'services/mat-table/table-base';
import { fuseAnimations } from '@fuse/animations';
import { MyPaginator } from 'services/mat-table/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { HxPlaceholderConfig } from 'services/define/placeholder';
import { FilesDataSource, HeaderConfig, setSortConfig, getHeaderRow } from 'services/mat-table/table';
import { AccountAllEditorService } from 'services/account/all-editor.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ACCOUNT_CONFIG } from 'services/define/account-base';
import { EditorDialogComponent } from 'component/editor-dialog/editor-dialog.component';
import { ConfirmDialogComponent } from 'component/confirm-dialog/confirm-dialog.component';
import { FormAdd } from 'services/form/form-add';
import { FormBuilder, Validators } from '@angular/forms';
import { HTTP_HEADERS } from 'services/global/http.global';
import { Http } from 'services/core/http/http';
import { CommonService } from 'services/user/common.service';
import { ResObject } from 'services/define/api.config';
import { HttpResponse } from '@angular/common/http';
import { MessageService } from 'services/core/message/message.service';

@Component({
  selector: 'app-all-editor',
  templateUrl: './all-editor.component.html',
  styleUrls: ['./all-editor.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class AllEditorComponent extends TableBase implements OnInit {

  dataSource: FilesDataSource;


  placeholderConfig = HxPlaceholderConfig;

  constructor(
    private service: AccountAllEditorService,
    private matPaginatorIntl: MatPaginatorIntl,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private http: Http,
    private commonService: CommonService,
    private message:MessageService
  ) {
    super();
    // console.log(this.placeholderConfig);
  }

  /**分页 */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /**监听键盘输入,搜索 */
  @ViewChild('filter') filter: ElementRef;
  /**排序用 */
  @ViewChild(MatSort) sort: MatSort;
  headerConfigArray: HeaderConfig[];

  qxdata = [
    {
      name: '申请单',
      qx: []
    },
    {
      name: '管理',
      qx: []
    },
    {
      name: '账户',
      qx: []
    },
    {
      name: '痕迹',
      qx: []
    },
    {
      name: '设置',
      qx: []
    },
  ];
  // 权限配置里面提交的信息
  qxInfo: any = {};
  userId: string;
  // 下拉内容
  tel: string[] = [];
  address: any[] = [];
  cityName: string[] = [];
  hospital: any[] = [];
  scope: string[] = [];
  secondScope: string[] = [];
  // 表单认证
  formgroup = this.fb.group({
    username: ['', Validators.required],
    name: ['', Validators.required],
    tel: ['', Validators.required],
    email: ['', Validators.required],
    province_name: ['', Validators.required],
    city_name: ['', Validators.required],
    hospital_name: [''],
    group1_name: ['', Validators.required],
    group2_name: [''],
    role_name: ['', Validators.required],
  });
  // 省份id
  provinceId: string;
  // 城市id
  cityId: string;
  // 医院id
  hospitalId: string;
  // 没有医院的话展示输入医院
  hospitalShowType: Boolean = true;
  // 角色 
  role_name: string;

  username: string;
  // 代理等级名
  group1_name: string;
  // 代理等级码
  group1:any;
  group2:any;
  // 电话
  telphone: string;

  /**实际操作用的数组 */
  useQXData = [];
  qxColumn = ['权限名', '选项'];
  sortConfig: Object;
  displayedColumns: string[];
  flag = {
    qxbtn: false,
    /**
     * ! 接口获得
     * 权限分开给查看,编辑,删除 */
    readbtn: 0b111,
    operateQX: false,
    editqx: 0
  };
  /**选择用 */
  selection = new SelectionModel<any>(true, []);
  /**新增权限列表,用完重置 */
  addQXArray = [];
  /**
   * !接口获得,现在模拟 */
  addAllQXArray = [
    {
      name: '测试权限1', list: ['删除1', '删除1', '删除1']
    },
    {
      name: '测试权限2', list: ['删除2', '删除2', '删除2']
    },
  ];

  btnIsShow = false;

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.getShowData();
    this.getScope();

    if (this.route.routeConfig.path === 'mine/:id') {
      this.btnIsShow = true;
    } else {
      this.btnIsShow = false;
    }

    // this.service.getData().then(() => {
    // })
    this.headerConfigArray = FormAdd.table2Form(ACCOUNT_CONFIG);
    // console.log(this.headerConfigArray)
    // console.log('搜索', this.sort);
    this.matPaginatorIntl = new MyPaginator(this.matPaginatorIntl).setPaginator();
    this.dataSource = new FilesDataSource(this.service, setSortConfig(this.headerConfigArray), this.paginator, this.sort);
    this.displayedColumns = getHeaderRow(this.headerConfigArray);
    console.log('显示行', this.displayedColumns);
    console.log('显示数据', this.service.onOrdersChanged.value);
    /**权限目前直接模拟 */
    // this.useQXData = this.service.setUseQXData(this.qxdata)

    
  }

  /**
   * doc 左上角箭头返回
   *
   * @memberof AllEditorComponent
   */
  return2List() {
    // console.log('点击返回');
    this.router.navigate(['/webapp/account/all']);
  }

  /**
   * doc 页面切换
   *
   * @param {*} index
   * @memberof AllEditorComponent
   */
  indexChange(index) {
    /**权限页面显示权限按钮 */
    this.flag.qxbtn = index == 2 ? true : false;
  }

  operateQX(index) {

  }

  /**
   * 选中行时触发
   *
   * @param {*} event
   * @param {*} obj
   * @memberof AllEditorComponent
   */


  /**
   * ! 接口 保存修改权限
   * todo 根据相关参数判断是新增/修改/删除
   * @memberof AllEditorComponent
   */


  /**
   * doc 新增,直接加号,通过选项选择需要添加的,然后配置权限,有保存取消/修改,出现左选项,右侧可配置,有保存,取消/删除,只出现左选项,然后保存,取消
   * 只执行切换编辑状态操作,不进行
   * @param {number} index
   * @memberof AllEditorComponent
   */
  editQX(index: number, cancel: boolean = false) {
    const oldindex = 0;
    this.flag.editqx = +index;
    if (cancel) {
      if (this.qxColumn.length == 3) {
        this.qxColumn.shift();
      }
      return;
    }
    switch (+index) {
      case 1:
        if (this.qxColumn.length == 3) {
          this.qxColumn.shift();
        }
        break;
      case 2:
        if (this.qxColumn.length == 2) {
          this.qxColumn.unshift('操作');
        }
        break;
      case 3:
        if (this.qxColumn.length == 2) {
          this.qxColumn.unshift('操作');
        }
        break;
      default:
        break;
    }
  }

  /**
   * 每点击一次多一个权限配置
   *
   * @memberof AllEditorComponent
   */
  addQX() {
    this.addQXArray.push({});
  }

  /**新增权限时选择某一权限后配置 */
  changeQX(event: MatSelectChange, i) {
    // console.log('测试选择变更', event);
    this.addQXArray[i].name = event.value;
    this.addQXArray[i].list = this.addAllQXArray.filter((val) => {
      return val.name === event.value;
    })[0].list.map((val) => {
      return { name: val, value: false };
    });
    // console.log('查看整个新增', this.addQXArray);
  }

  /**
   *1.弹窗查看,2.弹窗编辑,3,弹窗删除
   *
   * @param {*} obj
   * @param {*} index
   * @memberof AllEditorComponent
   */
  openDialog(obj, index) {
    console.log(obj, '查看相关信息');
    let readStatus = index == 1 ? true : false;
    // console.log('打开弹窗', obj);
    /**这个根据后期不同可能更换 */
    const a = ACCOUNT_CONFIG.concat();
    for (let i = 0; i < a.length; i++) {
      const element = a[i];
      try {
        /**这里的值应该是从对象中遍历出来的, */
        // element.value = obj[element.key]
        element.value = this.getValue4ViewUse(element.value4ViewUse, obj);
        console.log('返回数值', element.value);
        element.read = true;
      } catch (error) {
        // console.warn('出错', error);
      }
    }
    console.log('添加数组', ACCOUNT_CONFIG);
    switch (+index) {
      case 1:
      case 2:
        const editorRef = this.dialog.open(EditorDialogComponent, {
          height: '700px',
          data: {
            list: a,
            buttons: [
              {
                name: '提交',
                type: 'submit',
              },
              {
                name: '返回',
                type: 'cancel',
              },
            ],
            writeStatus: !readStatus ? 0b010 : null,
            read: readStatus,
            req: {
              name: 'usermodel',
              method: 'patch',
              composeurl: `${obj.id}/`
            }
          }
        });
        editorRef.afterClosed().subscribe((res) => { console.log(res) });
        break;
      case 3:
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          // height: '500px',
          data: {
            buttons: [
              {
                name: '确认',
                type: 'submit',
              },
              {
                name: '返回',
                type: 'cancel',
              },
            ],
            content: '你确定删除吗?',
            title: '提示'
          }
        });
        // ! 接口, 删除某一项,并刷新
        dialogRef.afterClosed().subscribe({
          next: (res) => {
            // console.log('返回内容', res);
          }
        });
      default:
        break;
    }
  }

  operateDisplay(num1, num2) {
    return num1 & +num2;
  }


  // 配置权限的数据
  getQx(data) {
    console.log(data,"权限信息有没有");
    data?data=JSON.parse(data):data={};
    Object.assign(this.qxInfo,data);
    this.http.call('permissionmodel', { limit: 100, offset: 1 }, { headers: HTTP_HEADERS, method: 'get' }).then(
      (res: any) => {
        console.log(res, "全部权限信息");
        const results = res.body.results;
        results.map((element) => {

          if(data.hasOwnProperty(element.key)){
            let name= element.key;
            if(data[name]==1){
              Object.assign(element,{checked:1})
            }else if(data[name]==0){
              Object.assign(element,{checked:0})
            }else{
              Object.assign(element,{checked:-1})
            }
          }else{
            Object.assign(element,{checked:0})
          }

          switch (element.module_id) {
            case 1:
              this.qxdata[0].qx.push({ name: element.name, value: element.key, id: element.id, module_id: element.module_id, checked:element.checked });
              break;
            case 2:
              this.qxdata[1].qx.push({ name: element.name, value: element.key, id: element.id, module_id: element.module_id, checked:element.checked });
              break;
            case 3:
              this.qxdata[2].qx.push({ name: element.name, value: element.key, id: element.id, module_id: element.module_id, checked:element.checked });
              break;
            case 4:
              this.qxdata[3].qx.push({ name: element.name, value: element.key, id: element.id, module_id: element.module_id, checked:element.checked });
              break;
            case 5:
              this.qxdata[4].qx.push({ name: element.name, value: element.key, id: element.id, module_id: element.module_id, checked:element.checked });
              break;
          }
        });
        console.log(this.qxdata,"构造后的权限数据");
      });
  }
  // 权限信息的选择
  selectRow(event: MatCheckboxChange = null, obj) {
    const name = obj.value;
    const newInfo = {};
    Object.assign(newInfo, this.qxInfo);
    if (Object.keys(newInfo).length > 0) {

      if (newInfo[name]) {
        newInfo[name] == 1 ? newInfo[name] = 0 : newInfo[name] = 1;
        Object.assign(this.qxInfo, newInfo);
        return;
      } else {
        Object.assign(this.qxInfo, { [name]: 1 });
        return;
      }
    } else {
      Object.assign(this.qxInfo, { [name]: 1 });
      return;
    }
  }
  // 提交配置信息
  saveQX() {
    const id = this.userId;
    this.http.call('usermodel', {permissions: JSON.stringify(this.qxInfo) }, { headers: HTTP_HEADERS, method: 'patch', composeurl: id + '/' }).then(
      (res: any) => {
        console.log(res);
        this.message.showToast("信息编辑成功")
        this.router.navigate(['/webapp/account/all']);
      });
  }



  // 获得基本信息模块的展示数据
  getShowData() {
    // console.log(this.route.snapshot.paramMap.get('id'), 123456789);
    const id = this.route.snapshot.paramMap.get('id');
    // 获取展示数据
    this.http.call('usermodel', null, { headers: HTTP_HEADERS, method: 'get', composeurl: id + '/' })
      .then(
        (res: { body: { [propName: string]: any } }) => {
          console.log(res, '基本信息模块展示的数据');
          // 活的权限配置信息
          this.getQx(res.body.permissions);
          
          this.formgroup.patchValue({
            username: res.body.username,
            name: res.body.name,
            role_name: res.body.role_name,
            tel: res.body.tel,
            email: res.body.email,
            province_name: res.body.province_name,
            city_name: res.body.city_name,
            hospital_name: res.body.hospital_name,
            group1_name: res.body.group1_name,
            group2_name: res.body.group2_name,
          });
          this.tel = [...this.tel, res.body.tel];
          if (res.body.hospital_name) {
            this.hospital = [...this.hospital,{name:res.body.hospital_name,id:res.body.hospital}];
          } else if (res.body.hospital_new) {
            this.hospital = [...res.body.hospital_new];
          } else {
            this.hospitalShowType = false;
          }
          // 代理等级码
          this.group1=res.body.group1;
          this.group2=res.body.group2;
          // 顶部展示信息的赋值
          this.role_name = res.body.role_name;
          this.group1_name = res.body.group1_name;
          this.telphone = res.body.tel;
          this.username = res.body.name;
          return { province: res.body.province_name, city: res.body.city_name, hospital: res.body.hospital_name };
        }).then(
          (res) => {
            console.log(res, '构造的城市');
            this.getProvince(res);
          });
  }

  // 获得归属及第二归属
  getScope() {
    this.http.call('groupmodel', null, { headers: HTTP_HEADERS, method: 'get' })
      .then(
        (res: { body: { [propName: string]: any } }) => {
          console.log(res,"获得的所属");
          const scope = res.body.results.map((element) => {
            return {name:element.name,id:element.id};
          });
          this.scope = [...scope];
          this.secondScope = [...scope];
          // console.log(this.scope);
        });
  }

  // 获得省份列表
  getProvince(data: any) {

    let province;
    let currentProvince;
    this.commonService.getCityModel(1)
      .then((res: HttpResponse<ResObject>) => {
        // console.log('获得省份列表', res);
        if (data.province == null) {
          data.province = '北京市';
          data.city = '市辖区';
          this.formgroup.patchValue({ province_name: '北京市' });
          this.formgroup.patchValue({ city_name: '市辖区' });
        }
        province = res.body.results.filter((element) => {
          if (element.name === data.province) {
            currentProvince = { id: element.id, name: element.name };
          } else {
            return { id: element.id, name: element.name };
          }
        });

        this.provinceId = currentProvince.id;
        this.address = [currentProvince, ...province];
        // console.log( this.address, '城市列表是什么样');
        return currentProvince.id;
      }).then(
        (res) => {
          // console.log(res, '收到的省份id');
          this.getCity(res, data);
        });
  }

  // 获得城市列表
  getCity(id, data?: any) {

    this.provinceId = id;
    this.commonService.getCityModel(2, id).then((res: HttpResponse<ResObject>) => {
      console.log('城市返回值', res.body.results);
      // debugger;
      if (data) {
        let currentCity;
        const city = res.body.results.filter((element) => {
          if (element.name === data.city) {
            currentCity = { id: element.id, name: element.name };
          } else {
            return { id: element.id, name: element.name };
          }
        });
        this.cityName = [currentCity, ...city];
        return currentCity.id;
      } else {
        // debugger;
        // 当点击列表时处理
        console.log(res.body);
        this.cityName = [...res.body.results];
        console.log(res.body);
        this.formgroup.patchValue({ city_name: res.body.results.slice(0, 1)[0].name });
        return res.body.results.slice(0, 1)[0].id;
      }

    }).then(
      (res) => {
        this.getHospital(res, data);
      }
    );
  }
  // 获得医院列表
  getHospital(id, data?) {
    this.cityId = id;
    console.log(id, '获取医院的城市的id');
    this.commonService.getHospitalModel({ city: id, limit: 1000 }).then((res: any) => {
      console.log(res,"医院列表");
      if (res.body.results.length <= 0) {
        return;
      }
      if (data) {
        if (data.hospital == null) {
          this.formgroup.patchValue({ hospithospital_nameal: res.body.results.slice(0, 1)[0].name });
          this.hospitalId = res.body.results.slice(0, 1)[0].id;
          return;
        }
        console.log(data.hospital,"你长什么样")
        let currentHospital={};
        const hospital = res.body.results.filter((element) => {
          if (element.name === data.hospital) {
            currentHospital = { id: element.id, name: element.name };
          } else {
            return { id: element.id, name: element.name };
          }
        });
        Object.keys(currentHospital).length>0?this.hospital = [currentHospital, ...hospital]:this.hospital = [...hospital];
        this.formgroup.patchValue({ hospital_name: this.hospital.slice(0, 1)[0].name });
        this.hospitalId = this.hospital.slice(0, 1)[0].id;
        // this.hospital = [currentHospital, ...hospital];
        if (this.hospital.length > 0) {
          this.hospitalShowType = true;
        } else {
          this.hospitalShowType = false;
        }
        console.log(this.hospital,"有没有问题")
      } else {
        // 当点击列表时处理
        this.hospital = [...res.body.results];
        if (this.hospital.length > 0) {
          this.hospitalShowType = true;
        } else {
          this.hospitalShowType = false;
        }
        this.formgroup.patchValue({ hospital_name: res.body.results.slice(0, 1)[0].name });
        this.hospitalId = res.body.results.slice(0, 1)[0].id;
      }
    });
  }
  // 获得提交的医院的id
  getHospitalId(id) {
    console.log(id);

    this.hospitalId = id;
  }
  // 权限取消
  cancel() {
    window.history.go(-1);
  }
  // 基本信息baocun
  saveBaseInfo() {
    const id = this.userId;
    console.log(this.formgroup.controls);
    console.log(this.formgroup.value);
    const tjValue= Object.assign({},this.formgroup.value,{hospital: this.hospitalId,city:this.cityId,address:this.provinceId,group2:this.group2})
    console.log(tjValue)
    // this.http.call('usermodel', tjValue, { headers: HTTP_HEADERS, method: 'patch', composeurl: id + '/' }).then(
    //   (res: any) => {
    //     console.log(res);
    //     this.message.showToast("信息编辑成功")
    //     // this.router.navigate(['/webapp/account/all']);
    //   });
  }
  getscope(id){
    this.group1=id;
  }
  getsecondScope(id){
    this.group2=id;
  }
   /**分页 */
   changePage(event) {
    console.log(event);
    this.service.params.offset = ((+event.pageIndex) * 10).toString();
    this.service.getData()

  }
}
