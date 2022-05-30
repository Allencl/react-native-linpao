import React, { Component } from 'react';
import { TouchableOpacity,Image,DeviceEventEmitter,Modal,Dimensions,StyleSheet, ScrollView, View,Text,TextInput   } from 'react-native';
import { Icon,InputItem,WingBlank,Modal as ModalAnt, DatePicker, List, Tag, WhiteSpace, Toast,Button } from '@ant-design/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createForm, formShape } from 'rc-form';
import { WisInput,WisSelect,WisFormPhoto, WisFormHead, WisDatePicker, WisTextarea,WisCamera } from '@wis_component/form';   // form 
import { WisTable,WisButtonFloat } from '@wis_component/ul';   // ul 


import WISHttpUtils from '@wis_component/http'; 
import {WisTableCross} from '@wis_component/ul';
import {WisFormText} from '@wis_component/form';   // form 
import moment from 'moment';
import {origin} from '@wis_component/origin';     // 服务地址
import ImageViewer from 'react-native-image-zoom-viewer';


// 待维修 详情
class PageForm extends Component {

  constructor(props) {
    super(props);



    this.state={
      indexImage:0,
      visibleImage:false,                    // 显示


      imageFiles:[],   // 图片回显
      imageList:[],   // 图片
      showModal:false,
      formData:{},     // 详情数据
      lodding:false,   // 是否加载

      isFinish:false,  // 是否是已完成
      config:{},   // 登录信息
      initData:{},     // 初始化数据

      classesList:[],  // 班次数据
      sourceList:[],   // 信息来源数据

      typeList:[],     // 故障类型数据
      contentList:[],   // 故障内容数据
      positionList:[],   // 发现工位数据
      exitList:[],       // NG 出口数据
      statusList:[],     // 状态


      id:"",    // ID
      updateUser:"",  // updateUser

      code:"",  // 背番号
      no:"",      // 机号
      name:"",  // 机种名
      classes:[],   // 班次
      source:[],   // 信息来源
      type:[],   // 故障类型
      content:[],  // 故障内容
      grade:"",   // 故障等级
      NGimport:"",   // 适应NG入口
      NG:"",     // NG入口
      station:[],   // 发现工位
      NGexport:"",  // NG出口
      status:[],    // 状态
      createTime:"",   // 创建时间
      submitTime:"",   // 录入时间
      userName:"",   // 提交人
      remark:"",   // 备注



    }
  }

  static propTypes = {
    form: formShape,
  };  

  componentWillMount(){
    this.getSelectData();   // 获取下拉数据  缓存值
    this.initFunc();   // 初始化
  }

  componentDidMount(){
    let {lodding}=this.state;
    if(!lodding) {
      this.getSelectData();   // 获取下拉数据  缓存值
      this.initFunc();   // 初始化      
    }
  }  

  /**
   * 初始化
   */
   initFunc(){
     let that=this;
     let ID=this.props.route.params.routeParams["id"];

    // console.log(ID)
    WISHttpUtils.post("faultMachineApp/faultMachineDetailInput.do",{
      params:{
        id:ID
      }
    },(result) => {
      let {data}=result;

      // console.log(result);
      that.setState({
        formData:data.bean,
        lodding:true,
        initData: result,
        imageFiles:data["files"]||[],
        typeList: data["ncGroup"].map(o=>Object.assign({},o,{id:o.code})),
        positionList: data["optionUloc"].map(o=>Object.assign({},o,{id:o.code})),
        // exitList:  data["optionUlocExits"].map(o=>Object.assign({},o,{id:o.code})),
      },()=>{
        that.initForm();
      });


    });     
   }


   /**
    * 初始化表单
    */
  initForm(){
    let {formData,typeList,classesList,sourceList,positionList,statusList}=this.state;
    let {bean}=this.state.initData.data;


    this.setState({

      id:bean["id"],    // ID
      updateUser:bean["updateUser"],  // updateUser

      code: bean["backNumber"],  // 背番号
      no: bean["machineName"],      // 机号
      name: bean["machineOfName"],  // 机种名
      // classes:[],   // 班次
      // source:[],   // 信息来源
      // type:[],   // 故障类型
      // content:[],  // 故障内容
      grade: bean["ngLevel"],   // 故障等级
      NGimport:bean["ngEntrance"],   // 适应NG入口
      NG:bean["ngin"],     // NG入口
      // station:[],   // 发现工位
      NGexport:bean["ngExit"],  // NG出口
      // status:[],    // 状态
      // createTime:bean["createTime"]?new Date(bean["createTime"]):'',   // 创建时间
      // submitTime:bean["submitTime"]?new Date(bean["submitTime"]):'',   // 录入时间

      createTime:bean["createTime"]||'',   // 创建时间
      submitTime:bean["submitTime"]||'',   // 录入时间

      userName:(bean["employee"]||{})["name"],   // 提交人
      remark:bean["remarks"]||'',    // 备注
    });

    // 初始化 故障类型
    if(formData.tmNcGroupId){
      let _typeList=typeList.filter(o=>o.id==formData.tmNcGroupId);

      this.selectType.setInitValue(_typeList);   // 故障类型 初始化
      this.getContentList(_typeList);    // 故障内容 初始化 
    }


    this.selectClasses.setInitValue(classesList.filter(o=>o.id==bean.shiftno));   // 班次 初始化
    this.selectSource.setInitValue(sourceList.filter(o=>o.id==bean.infoSources)); // 信息源 初始化
    this.selectStation.setInitValue(positionList.filter(o=>o.id==bean.discoveryStation)); // 发现工位 初始化
    this.selectStatus.setInitValue(statusList.filter(o=>o.id==bean.status)); // 状态 初始化
 
  }

   /**
    * 故障内容 list
  */
  getContentList(list){
    let that=this;
    let {formData,contentList}=this.state;
    let ID=list[0]["code"];

    WISHttpUtils.post("faultMachineApp/getNcItem.do",{
      params:{
        tmNcGroupId:ID
      }
    },(result={}) => {

      that.setState({
        contentList:result.data.map(o=>Object.assign({},o,{id:o.code}))
      },()=>{

        // 初始化 故障内容
        if(formData.tmNcId){
          that.seleCtcontent.setInitValue(that.state.contentList.filter(o=>o.code==formData.tmNcId));   // 故障内容 初始化
          that.getGradeData(formData.tmNcId,result.data);
        }


      });
    });
  }

  /**
   * 获取 故障等级  适应NG入口
   */
  getGradeData(ID,list=[]){
    let that=this;
    let {initData}=this.state;
    let levelId = (list.filter(o=>o.code==ID)[0]||{})["ngLevel"];

    this.setState({
      grade:"",
      NGimport:''
    }); 

    // 
    if(levelId){
      var _json=(initData.data["faultGrades"].filter(o=>o.code==levelId)[0]);

      if(_json){

        let relevantParameter=(_json["relevantParameter"]||'').split(",");
        let _relevantParameter=relevantParameter.map(o=>{
          var _s=initData["data"]["optionNgEntrance"].filter(k=>k["code"]==o)[0];
          return (_s||{})["name"];
        })

        this.setState({
          grade:_json["name"]||"",
          NGimport:_relevantParameter.join()
        });
      }

    }


  }

  /**
   * 获取下拉数据
   */
  getSelectData(){
    let that=this;
    let isFinish=this.props.route.params.routeParams["isFinish"];


    

    AsyncStorage.getItem("token_config").then((option)=>{
      let data=JSON.parse(option)["entrys"];

      that.setState({
        isFinish:isFinish,
        config:JSON.parse(option),
        classesList:Object.entries(data["SHIFT_TYPE"]).map(o=>{
          return {id:o[0],name:o[1]["zh_CN"]};
        }),
        sourceList:Object.entries(data["INFO_SOURCES"]).map(o=>{
          return {id:o[0],name:o[1]["zh_CN"]};
        }),
        statusList: Object.entries(data["UNQUALIFIED_STATE"]).map(o=>{
          return {id:o[0],name:o[1]["zh_CN"]};
        }),
      });

    });

  }


  /**
   * 提交
   */
  passHandle=(value)=>{
    const {navigation} = this.props;
    let {id,updateUser,imageList}=this.state;

    // let {config}=this.state;
    // let ID=this.props.route.params.routeParams["id"];


    this.props.form.validateFields((error, value) => {
      // 表单 不完整
      if(error){
        // Toast.fail('必填字段未填！');


        if(!value["code"]){
          Toast.fail('背番号未填！');
          return
        }

        if(!value["no"]){
          Toast.fail('机号未填！');
          return
        }
      
        if(!value["classes"]["length"]){
          Toast.fail('班次未选择！');
          return
        }

        if(!value["type"]["length"]){
          Toast.fail('故障类型未选择！');
          return
        }

        if(!value["content"]["length"]){
          Toast.fail('故障内容未选择！');
          return
        }

        // if(!value["NGimport"]){
        //   Toast.fail('适应NG入口未填！');
        //   return
        // }

        if(!value["station"]["length"]){
          Toast.fail('发现工位未选择！');
          return
        }

      } else{
        // Toast.success("操作成功！");

        // console.log(value);

        let _json={
          id:id,   // 详情id
          updateUser:updateUser,  // 用户ID

          backNumber:value.code,  // 背番号
          machineName:value.no,      // 机号
          machineOfName:value.name,  // 机种名
          shiftno:value.classes["length"]?value.classes[0]["id"]:null,   // 班次
          infoSources:value.source["length"]?value.source[0]["id"]:null,   // 信息来源
          tmNcGroupId:value.type["length"]?value.type[0]["id"]:null,    // 故障类型
          tmNcId:value.content["length"]?value.content[0]["id"]:null,  // 故障内容
          ngLevel:value.grade,   // 故障等级
          ngEntrance:value.NGimport,   // 适应NG入口
          ngin:value.NG,     // NG入口
          discoveryStation:value.station["length"]?value.station[0]["id"]:null,   // 发现工位
          ngExit:value.NGexport,  // NG出口
          status:value.status["length"]?value.status[0]["id"]:null,    // 状态
          // createTime:value.createTime?moment(value.createTime).format('YYYY-MM-DD HH:mm:ss'):"",   // 创建时间
          // submitTime:value.submitTime?moment(value.submitTime).format('YYYY-MM-DD HH:mm:ss'):"",   // 录入时间
          userName:value.userName,   // 提交人
          remarks:value.remark,   // 备注
        };

        let _json2={

        }

        Object.entries(_json).map(o=>{
          if(o[1]) _json2[o[0]]=o[1];
        });

        const _formData = new FormData();
        Object.entries(_json2).map(o=>{
          _formData.append(o[0],o[1]);
        });

        imageList.map((o)=>{
          _formData.append("files",o);
        });
        
        // console.log(_formData);

        WISHttpUtils.post('faultMachineApp/newFaultMachineUpdate.do',{
          params:{},
          headers:{
            'Content-Type':'multipart/form-data',
          },
          body: _formData      
        },(result) => {
          if(result.success){
            Toast.success("提交成功！");

            setTimeout(()=>{
              DeviceEventEmitter.emit('globalEmitter_malfunctionList');
            },300);

          }
        });

      }
    });
  }  

  /**
   * 故障关闭
  */
  closeHandle=()=>{
    this.setState({
      showModal:true
    });   
  }

  /**
   * 关闭 故障单
   * @returns 
   */
  malfunctionClose(){
    let that=this;
    let {config}=this.state;
    let ID=this.props.route.params.routeParams["id"];
    const {navigation} = this.props;



    let _json={
      id:ID,
      userId:config.user.id
    };

    const _formData = new FormData();
    Object.entries(_json).map(o=>{
      _formData.append(o[0],o[1]);
    });

    // console.log(_formData)
    // console.log(_json)
    WISHttpUtils.post('faultMachineApp/UnqualifiedClosure.do',{
      params:{},
      headers:{
        'Content-Type':'multipart/form-data',
      },
      body: _formData      
    },(result) => {
      if(result.success){
        Toast.success("关闭成功！");
        navigation.navigate('malfunctionList'); 

        setTimeout(()=>{
          DeviceEventEmitter.emit('globalEmitter_malfunctionList');
        },300);
      }
    });
    



  }


  /**
   * 删除
   * @param {} action 
  */
  deleteHandle(obj){
    let that=this;
    let {formData,imageFiles}=this.state;

    // console.log(obj);

    let _json={
      id:formData["id"],
      path:obj
    };

    const _formData = new FormData();
    Object.entries(_json).map(o=>{
      _formData.append(o[0],o[1]);
    });


    WISHttpUtils.post('faultMachineApp/deleteImage.do',{
      params:{},
      headers:{
        'Content-Type':'multipart/form-data',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: _formData     
    },(result) => {
      if(result.success){
        that.setState({
          imageFiles:imageFiles.filter(o=>o!=obj)
        });
        // Toast.success("成功！");
      }
    });

  } 

  render() {
    let that=this;
    let {imageList,visibleImage,indexImage,imageFiles,isFinish,showModal,classesList,sourceList,typeList,contentList,positionList,exitList,statusList} = this.state;
    let{code,name,no,classes,type,content,grade,NGimport,NG,station,NGexport,createTime,submitTime,userName,remark}=this.state;

    let {navigation,form} = this.props;
    const {getFieldProps, getFieldError, isFieldValidating} = this.props.form;

    const footerButtons = [
      { text: '取消', onPress: () => {
        that.setState({
          showModal:false
        });
      } },
      { text: '确定', onPress: () => {
        that.malfunctionClose();
      }},
    ];

    const images =imageFiles.map(o=>{
      return {url:`${origin}/img/${o}`};
    });


    return (
      <ScrollView style={{padding:8,backgroundColor:"#fff"}}>


        <Modal 
            visible={visibleImage} 
            transparent={true}
            onRequestClose={()=>{
              if(visibleImage){
                  this.setState({
                      visibleImage:false
                  }); 
              }
          }}            
        >   
          <View style={styles.ImageClose}>
              <TouchableOpacity 
                  onPress={()=>{
                      this.setState({
                          visibleImage:false
                      });
                  }}
              >
                  <Icon style={{fontSize:28}} name="close-circle" size="md" color="#fff" />
              </TouchableOpacity>
          </View>
          <ImageViewer 
              imageUrls={images}
              index={indexImage}
              enableImageZoom={true}
          />
        </Modal>  


        <ModalAnt
          title="提示！"
          transparent
          visible={showModal}
          
          footer={footerButtons}
        >
          <View style={{ paddingVertical: 20 }}>
            <Text style={{ textAlign: 'center' }}>确定关闭此故障单！</Text>
          </View>
        </ModalAnt>


        <View>
          <WisInput  
            form={form} 
            name="code"
            requiredSign={true}
            {...getFieldProps('code',{
              rules:[{required:true }],
              initialValue:code
            })} 
            error={getFieldError('code')}               
            lableName="背番号"
            disabled
          />

          <WisInput  
            form={form} 
            name="no"   
            requiredSign={true}       
            {...getFieldProps('no',{
              rules:[{required:true }],
              initialValue:no
            })} 
            error={getFieldError('no')}               
            lableName="机号"
            disabled
          />  


          <WisInput  
            form={form} 
            name="name"             
            {...getFieldProps('name',{
              rules:[{required:false }],
              initialValue:name
            })} 
            error={getFieldError('name')}               
            lableName="机种名"
            disabled
          />  


          <WisSelect 
            form={form} 
            name="classes"      
            requiredSign={true}       
            onRef={(ref)=>{this.selectClasses =ref}}
            form={form} 
            name="classes"
            {...getFieldProps('classes',{
              rules:[{required:true }],
              initialValue:[]
            })} 
            error={getFieldError('classes')}  
            disabled={isFinish}
            title="班次（单选）"             
            lableName="班次"
            textFormat={o=>o.name}
            labelFormat={o=>o.name}
            onChangeValue={(_list)=>{

            }}
            data={classesList}
            
          />
          <WisSelect 
            onRef={(ref)=>{this.selectSource=ref}}
            form={form} 
            name="source"
            {...getFieldProps('source',{
              rules:[{required:false }],
              initialValue:[]
            })} 
            error={getFieldError('source')}  
            disabled
            title="信息来源（单选）"             
            lableName="信息来源"
            textFormat={o=>o.name}
            labelFormat={o=>o.name}
            onChangeValue={(_list)=>{
              // console.log(_list);
            }}
            data={sourceList}
            
          />




          <WisSelect 
            onRef={(ref)=>{this.selectType =ref}}
            form={form} 
            name="type"
            requiredSign={true}
            {...getFieldProps('type',{
              rules:[{required:true }],
              initialValue:[]
            })} 
            error={getFieldError('type')}  
            title="故障类型（单选）"             
            lableName="故障类型"
            textFormat={o=>o.name}
            labelFormat={o=>o.name}
            onChangeValue={(_list)=>{
              that.getContentList(_list);
            }}
            data={typeList}
            disabled={isFinish}
            
          />


          <WisSelect 
            onRef={(ref)=>{this.seleCtcontent =ref}}
            form={form} 
            name="content"
            requiredSign={true}
            {...getFieldProps('content',{
              rules:[{required:true }],
              initialValue:[]
            })} 
            error={getFieldError('content')}  
            title="故障内容（单选）"             
            lableName="故障内容"
            textFormat={o=>o.name}
            labelFormat={o=>o.name}
            onChangeValue={(_list)=>{
              that.getGradeData(_list[0]["code"],contentList);
            }}
            data={contentList}
            disabled={isFinish}
            
          />



          <WisInput  
            form={form} 
            name="grade"           
            {...getFieldProps('grade',{
              rules:[{required:false }],
              initialValue:grade
            })} 
            error={getFieldError('grade')}               
            lableName="故障等级"
            disabled
          />    

          <WisInput  
            form={form} 
            name="NGimport"   
          
            {...getFieldProps('NGimport',{
              rules:[{required:false }],
              initialValue:NGimport
            })} 
            error={getFieldError('NGimport')}               
            lableName="适应NG入口"
            disabled
            
          />     

          <WisInput  
            form={form} 
            name="NG"            
            {...getFieldProps('NG',{
              rules:[{required:false }],
              initialValue:NG
            })} 
            error={getFieldError('NG')}               
            lableName="NG入口"
            disabled
          />  
           


          <WisSelect         
            onRef={(ref)=>{this.selectStation=ref}}
            form={form} 
            name="station"
            requiredSign={true}
            {...getFieldProps('station',{
              rules:[{required:true }],
              initialValue:[]
            })} 
            error={getFieldError('station')}  
            title="发现工位（单选）"             
            lableName="发现工位"
            textFormat={o=>o.name}
            labelFormat={o=>o.name}
            onChangeValue={(_list)=>{
              // this.onChangeHandle(_list);
            }}
            data={positionList}
            disabled={isFinish}
            
          />


          <WisInput  
            form={form} 
            name="NGexport"              
            {...getFieldProps('NGexport',{
              rules:[{required:false }],
              initialValue:NGexport
            })} 
            error={getFieldError('NGexport')}               
            lableName="NG出口"
            disabled
          />  

          {/* <WisSelect 
            form={form} 
            name="NGexport"
            {...getFieldProps('NGexport',{
              rules:[{required:false }],
              initialValue:NGexport
            })} 
            error={getFieldError('NGexport')}  
            title="NG出口（单选）"             
            lableName="NG出口"
            textFormat={o=>o.name}
            labelFormat={o=>o.name}
            onChangeValue={(_list)=>{
              // this.onChangeHandle(_list);
            }}
            data={exitList}
            
          /> */}

          <WisSelect 
            onRef={(ref)=>{this.selectStatus=ref}}
            form={form} 
            name="status"
            {...getFieldProps('status',{
              rules:[{required:false }],
              initialValue:[]
            })} 
            error={getFieldError('status')}  
            disabled
            title="状态（单选）"             
            lableName="状态"
            textFormat={o=>o.name}
            labelFormat={o=>o.name}
            onChangeValue={(_list)=>{

            }}
            data={statusList}
            
          />


          <WisInput  
            form={form} 
            name="createTime"            
            {...getFieldProps('createTime',{
              rules:[{required:false }],
              initialValue:createTime
            })} 
            error={getFieldError('createTime')}               
            lableName="创建时间"
            disabled
          />  


          <WisInput  
            form={form} 
            name="submitTime"            
            {...getFieldProps('submitTime',{
              rules:[{required:false }],
              initialValue:submitTime
            })} 
            error={getFieldError('submitTime')}               
            lableName="录入时间"
            disabled
          /> 

          <WisInput  
            form={form} 
            name="userName"             
            {...getFieldProps('userName',{
              rules:[{required:false }],
              initialValue:userName
            })} 
            error={getFieldError('userName')}               
            lableName="提交人"
            disabled
          /> 

          <WisInput  
            form={form} 
            name="remark"          
            {...getFieldProps('remark',{
              rules:[{required:false }],
              initialValue:remark
            })} 
            error={getFieldError('remark')}               
            lableName="备注"
            disabled={isFinish}
            
          /> 

          <WisFormPhoto 
            lableName="上传照片"
            onChange={(_list)=>{
              that.setState({
                imageList:_list
              })
              // console.log(_list)
              // Toast.success( JSON.stringify(_list) );
            }} 
            disabled={isFinish}          
          />


          <View style={styles.imageFilesBox}>
            { imageFiles.map((o,i)=>{
                return <View key={i} style={styles.imageFilesBoxLi}>
                  
                  { !isFinish ?
                    <View style={styles.ImageFilesLiClose}>
                        <TouchableOpacity 
                            onPress={()=>{
                                this.deleteHandle(o);
                            }}
                        >
                            <Icon style={{fontSize:28}} name="close-circle" size="md" color="#990000" />
                        </TouchableOpacity>
                    </View>
                    :
                    <View></View>
                  }

                  <TouchableOpacity 
                    onPress={()=>{
                        this.setState({
                            visibleImage:true,
                            indexImage:i
                        });
                    }}
                  >
                    <Image 
                      source={{
                        // uri:"https://gw.alipayobjects.com/mdn/prod_resou/afts/img/A*OwZWQ68zSTMAAAAAAAAAAABkARQnAQ"
                        uri:`${origin}/img/${o}`
                        // cache: 'only-if-cached',
                      }} 
                      style={{
                      width: 100,
                      height: 100,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              })
            }
          </View>



        </View>
        
        { !isFinish ?
          <View style={styles.footerBox}>
            <Button type="primary" onPress={this.passHandle}>提交</Button>
            <Button type="primary" onPress={this.closeHandle}>关闭故障</Button>
          </View>
          :
          <View></View>  
        }
    
                
      </ScrollView>
    );
  }
}


const styles = StyleSheet.create({
  ImageClose:{
    position:"absolute",
    top:15,
    right:15,
    zIndex:11        
  },  
  ImageFilesLiClose:{
    position:"absolute",
    top:0,
    right:0,
    zIndex:11
  },
  imageFilesBox:{
    flexDirection: "row",
    flexWrap:'wrap'    
  },
  imageFilesBoxLi:{
    width:100,
    marginRight:8,
    marginBottom:8,    
  },
  footerBox:{
    flexDirection: "row",
    justifyContent:'space-between',
    paddingLeft:50,
    paddingRight:50,
    marginTop:32,
    marginBottom:50
  },
  inputBox:{
    fontSize:14,
    height:48,
    borderColor:'#515a6e',
    borderWidth:1,
    borderRadius:3,
    paddingLeft:8,

  },
  headContainer:{
    flexDirection:'row',
    paddingTop:18,
    paddingBottom:2,
    backgroundColor:"white",
    borderBottomWidth:1,
    borderColor:"#e9e9e9", 
  },
  headIcon:{
    paddingLeft:10,
    paddingRight:10
  }
});



export default createForm()(PageForm);

