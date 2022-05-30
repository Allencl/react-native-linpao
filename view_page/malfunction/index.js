import React, { Component } from 'react';
import { TouchableOpacity,Dimensions,StyleSheet,DeviceEventEmitter, ScrollView, View,Text,TextInput, Image   } from 'react-native';
import { Icon,InputItem,WingBlank, DatePicker, List, Tag, WhiteSpace, Toast,Button } from '@ant-design/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createForm, formShape } from 'rc-form';
import { WisInput,WisSelect, WisFormHead, WisDatePicker, WisTextarea,WisCamera } from '@wis_component/form';   // form 
import { WisTable,WisButtonFloat } from '@wis_component/ul';   // ul 


import WISHttpUtils from '@wis_component/http'; 
import {WisTableCross,WisInputSN} from '@wis_component/ul';
import {WisFormPhoto} from '@wis_component/form';   // form 
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import {origin} from '@wis_component/origin';     // 服务地址


// 故障机 新增
class PageForm extends Component {

  constructor(props) {
    super(props);

    this.state={
      imageList:[],   // 图片

      SNObject:{},   // 扫描对象
      config:{},   // 登录信息
      initData:{},     // 初始化数据
      classesList:[],  // 班次
      typeList:[],     // 故障类型
      contentList:[],   // 故障内容
      positionList:[],   // 发现工位
      exitList:[],       // NG 出口

      // SNValue:"70219E026F00060033211T",  // SN 码
      // code:"A065",  // 背番号
      // name:"RPCZQ7BAV",  // 机种名
      // no:"F001111",      // 机号

      SNValue:"",
      code:"",  // 背番号
      name:"",  // 机种名
      no:"",      // 机号

      classes:[],   // 班次
      type:[],   // 故障类型
      content:[],  // 故障内容
      grade:"",   // 故障等级
      NGimport:"",   // 适应NG入口
      station:[],   // 发现工位
      NGexport:[],  // 适应NG出口
      remark:"",   // 备注

    }
  }

  static propTypes = {
    form: formShape,
  };  

  componentWillMount(){
    this.initFunc();   // 初始化
    this.getSelectData();   // 获取下拉数据  缓存值
  }

  componentDidMount(){
    let that=this;

    this.initFunc();   // 初始化
    this.getSelectData();   // 获取下拉数据  缓存值

    this.InputSN.focusHandle(); // 自动聚焦


    // 监听扫码枪
    this.honeyWell=DeviceEventEmitter.addListener('globalEmitter_honeyWell',function(key){
      if( key && (key.length==21 || key.length==22)){
        that.InputSN.setValue(key,()=>{
          that.setState({
            SNValue:key
          },()=>{
            that.snQuery(key);
          });
        }); 
      }else{
        Toast.offline('SN码必须是21(或22)位字符编码！',1);
      }
    });

  }


  componentWillUnmount(){
    this.honeyWell.remove();
  }

  /**
   * 初始化
   */
   initFunc(){
     let that=this;
      WISHttpUtils.post("faultMachineApp/faultMachineAddInput.do",{
        params:{

        },
        hideLoading:true
      },(result) => {
        let {data}=result;

        // console.log(result);
        that.setState({
          initData: result,
          typeList: data["ncGroup"].map(o=>Object.assign({},o,{id:o.code})),
          positionList: data["optionUloc"].map(o=>Object.assign({},o,{id:o.code})),
          exitList:  data["optionUlocExits"].map(o=>Object.assign({},o,{id:o.code})),
        });

        // console.log( data );
      });     
   }

   /**
    * 故障内容 list
  */
  getContentList(list){
    let that=this;
    let {initData}=this.state;
    let ID=list[0]["code"];


    // 重置
    this.props.form.resetFields("content",[]);
    this.setState({
      grade:'',
      NGimport:''
    });


    WISHttpUtils.post("faultMachineApp/getNcItem.do",{
      params:{
        tmNcGroupId:ID
      }
    },(result) => {
      // console.log(result);
      that.setState({
        contentList:result.data.map(o=>Object.assign({},o,{id:o.code}))
      },()=>{
        // that.getGrade();
      });
    });
  }

  /**
   * 获取 故障等级 NG入口
   */
  getGrade(data={}){
    let {initData}=this.state;

    this.setState({
      grade:'',  
      NGimport:''
    });


    // 等级
    let _obj=initData["data"]["faultGrades"].filter(o=>o["code"]==data["ngLevel"])[0];
    let relevantParameter=(_obj["relevantParameter"]||'').split(",");
    // let _NG=initData["data"]["optionNgEntrance"]
    // 适应 NG入口


    let _relevantParameter=relevantParameter.map(o=>{
      var _s=initData["data"]["optionNgEntrance"].filter(k=>k["code"]==o)[0];
      return (_s||{})["name"];
    })

    this.setState({
      grade:(_obj||{}).name,  // 等级
      NGimport:_relevantParameter.join()
    });
 
  }

  /**
   * 获取下拉数据
   */
  getSelectData(){
    let that=this;

    AsyncStorage.getItem("token_config").then((option)=>{
      let data=JSON.parse(option)["entrys"];

      that.setState({
        config:JSON.parse(option),
        classesList:Object.entries(data["SHIFT_TYPE"]).map(o=>{
          return {id:o[0],name:o[1]["zh_CN"]};
        })   
      });


      // console.log(this.state.classesList);
    });

  }

  // /**
  //  * 清空
  //  */
  // clearHandle(){
  //   // 清空
  //   this.setState({

  //   });
  // }

  /**
   * 读取
   */
  // readHandle(){
  //   let that=this;
    
  //   WISHttpUtils.post("faultMachineApp/ulocToPlcSn.do",{
  //     params:{
  //       sn:"70219E026F00060033211T"
  //     }
  //   },(result) => {
  //     console.log(result);
  //     Toast.success("数据更新成功！");
  //   });    
  // }

  /**
   * sn查询
  */
  snQuery(_text){
    let that=this;
    // let {SNValue}=this.state;
    let SNValue=_text;

    if(SNValue && ( SNValue.length==21 || SNValue.length==22) ){
      WISHttpUtils.post("faultMachineApp/analyzeSn.do",{
        params:{
          sn: SNValue
        }
      },(result) => {
        // console.log(result)
        // Toast.offline(,1);
        that.setState({
          code:result.data.backNumber,
          name:result.data.machineOfName,
          no:result.data.machineName   
        });

      });
    } else{
      Toast.offline('SN码必须是21(或22)位字符编码！',1);
    }

  }

  /**
   * 提交
   */
  passHandle=(value)=>{
    const {navigation} = this.props;
    let {initData={},config,SNValue,imageList,remark}=this.state;
    let{code,name,no}=this.state;

    // 校验必填
    if(!code){
      Toast.fail('背番号不能为空！');
      return
    }

    if(!name){
      Toast.fail('机种名不能为空！');
      return
    }

    if(!no){
      Toast.fail('机号不能为空！');
      return
    }
    
    
    this.props.form.validateFields((error, value) => {
      // 表单 不完整
      if(error){
        // Toast.fail('必填字段未填！');

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

        if(!value["station"]["length"]){
          Toast.fail('发现工位未选择！');
          return
        }

        if(!value["NGexport"]["length"]){
          Toast.fail('NG出口未选择！');
          return
        }

      } else{

        // 出口必须大于发现工位
        let _station=value["station"][0]["code"];   // 工位
        let _NGexport=value["NGexport"][0]["code"];   // NG出口
        let _obj=initData["data"]["optionUloc"].filter(o=>o.code==_station)[0];   
        if(_obj){
          let _str=_obj["name"].match(/\[(.+?)\]/g)[0];
          if(parseInt(_NGexport)<parseInt( _str.slice(1,_str.length-1)) ){
            Toast.fail("出口必须大于发现工位！");
            return;
          }
        }




        let _json={
          createUser:config.user.id,    // createUser 
          sn:SNValue.trim(),
          backNumber:value["code"],    //背番号
          machineOfName:value["name"],  // 机种名
          machineName:value["no"],   // 机号

          shiftno:value["classes"][0]["id"],   // 班次
          tmNcGroupId:value["type"][0]["id"],  // 故障类型
          tmNcId:value["content"][0]["id"],   // 故障内容

          ngLevel:value["grade"],   //故障等级
          ngEntrance:value["NGimport"],  // 适应NG入口
          discoveryStation:value["station"][0]["id"],  // 发现工位
          ngExit:value["NGexport"][0]["id"],    // NG出口
          remarks:value["remark"],               // 备注
        };


        const _formData = new FormData();
        Object.entries(_json).map(o=>{
          _formData.append(o[0],o[1]);
        });


        imageList.map((o)=>{
          _formData.append("files",o);
        });



        // console.log(_formData);
        WISHttpUtils.post('faultMachineApp/newFaultMachineAdd.do',{
          params:{},
          headers:{
            'Content-Type':'multipart/form-data',
          },
          body: _formData
        },(result={}) => {
          // console.log(result)
          if(result.success){
            Toast.success("提交成功！");
            setTimeout(()=>{
              navigation.navigate('malfunctionList',{
                id:result.data['id'],
              }); 
            },700);
          }
        });


        // fetch(origin+"faultMachineApp/faultMachineAdd.do",{
        //   method:'POST',
        //   headers:{
        //     'Content-Type':'multipart/form-data',
        //   },
        //   body: _formData
        // })
        // .then((response) => {

        //   // console.log("post 返回数据");
        //   // console.log(response); 

        //   // 如果相应码为200 将字符串转换为json对象
        //   if(response.ok){
        //     return response.json();
        //   }else{
        //     Toast.offline('服务器报错！',1);
        //   }                  
        // })
        // .then((json) => {
        //     // 提示
        //     if(json && json["message"]){
        //       Toast.info(json["message"],1);
        //     }

        //     if(json["success"]){
        //       Toast.success("提交成功！");
        //     }
        // })
        // .catch(error => {

        // }); 



        // WISHttpUtils.post('faultMachineApp/faultMachineAdd.do',{
        //   params:_json
        // },(result) => {
        //   console.log(result)
        //   if(result.success){
        //     Toast.success("提交成功！");
        //   }
        // });

      }
  });
  }  





  render() {
    let that=this;
    let {SNValue,classesList,typeList,contentList,positionList,exitList,imageList} = this.state;
    let{code,name,no,classes,type,content,grade,NGimport,station,NGexport,remark}=this.state;

    let {navigation,form} = this.props;
    const {getFieldProps, getFieldError, isFieldValidating} = this.props.form;


    return (
      <ScrollView style={{padding:8,backgroundColor:"#fff"}}>
          {/* <View style={{flexDirection:"row"}}>
            <View style={{flex:9,paddingRight:4}}>
              <TextInput
                style={styles.inputBox}
                value={SNValue}
                
                placeholder="请扫描条码..."
                onChangeText={(text)=>{
                  that.setState({
                    SNValue:text
                  });
                  setTimeout(()=>{
                    that.snQuery(text)
                  },300);
                }}
              />
            </View>

          </View> */}

          <WisInputSN
            onRef={(ref)=>{this.InputSN =ref}}
            onQuery={(_text)=>{
              that.setState({
                SNValue:_text
              });
              setTimeout(()=>{
                that.snQuery(_text)
              },100);
            }}
            onSearch={(_text)=>{
              that.setState({
                SNValue:_text
              });
              setTimeout(()=>{
                that.snQuery(_text)
              },100);
            }}
          />        

        <View style={{marginTop:22}}>
          <WisInput  
            requiredSign={true}
            {...getFieldProps('code',{
              rules:[{required:false }],
              initialValue:code
            })} 
            error={getFieldError('code')}               
            lableName="背番号"
            disabled
          />

          <WisInput  
            requiredSign={true}
            {...getFieldProps('name',{
              rules:[{required:false }],
              initialValue:name
            })} 
            error={getFieldError('name')}               
            lableName="机种名"
            disabled
          />  

          <WisInput          
            requiredSign={true}
            {...getFieldProps('no',{
              rules:[{required:false }],
              initialValue:no
            })} 
            error={getFieldError('no')}               
            lableName="机号"
            disabled
          />  

          <WisSelect 
            form={form} 
            name="classes"
            requiredSign={true}
            {...getFieldProps('classes',{
              rules:[{required:true }],
              initialValue:[]
            })} 
            error={getFieldError('classes')}  
            title="班次（单选）"             
            lableName="班次"
            textFormat={o=>o.name}
            labelFormat={o=>o.name}
            onChangeValue={(_list)=>{

            }}
            data={classesList}
            
          />


          <WisSelect 
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
            
          />


          <WisSelect 
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
              this.getGrade(_list[0]);
            }}
            data={contentList}
            
          />



          <WisInput  
            {...getFieldProps('grade',{
              rules:[{required:false }],
              initialValue:grade
            })} 
            error={getFieldError('grade')}               
            lableName="故障等级"
            disabled
          />    

          <WisInput  
            {...getFieldProps('NGimport',{
              rules:[{required:false }],
              initialValue:NGimport
            })} 
            error={getFieldError('NGimport')}               
            lableName="适应NG入口"
            
          />      


          <WisSelect 
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
            
          />


          <WisSelect 
            form={form} 
            name="NGexport"
            requiredSign={true}
            {...getFieldProps('NGexport',{
              rules:[{required:true }],
              initialValue:[]
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
          />



        </View>



        <View style={{marginTop:32,marginBottom:50}}>
          <Button type="primary" onPress={this.passHandle}>提交</Button>
        </View>      
                
      </ScrollView>
    );
  }
}


const styles = StyleSheet.create({
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

