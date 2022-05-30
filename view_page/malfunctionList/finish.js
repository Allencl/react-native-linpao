import React, { Component } from 'react';
import { TouchableOpacity,TextInput,DeviceEventEmitter,Dimensions,StyleSheet, ScrollView, View,Text,   } from 'react-native';
import { Icon,InputItem,WingBlank, DatePicker, List, Tag, WhiteSpace, Toast,Button,Tabs } from '@ant-design/react-native';

import { createForm, formShape } from 'rc-form';
import { WisInput,WisSelect, WisFormHead, WisDatePicker, WisTextarea,WisCamera } from '@wis_component/form';   // form 
import { WisTable,WisButtonFloat } from '@wis_component/ul';   // ul 


import WISHttpUtils from '@wis_component/http'; 
import {WisTableCross,WisInputSN} from '@wis_component/ul';
import {WisFormText} from '@wis_component/form';   // form 


// 已完成
class Page extends Component {
  constructor(props) {
    super(props);

    let {config}=this.props;
    this.props.onRef && this.props.onRef(this);


    this.state={
        searchValue:'',   // 查询值
        lodding:false,   // 是否加载

        currentPage:1,
        totalPage:1,  
        columns:[
          {
            label:"SN",
            name:"sn"
          },
          {
            label:"背番号",
            name:"backNumber"
          },    
          {
            label:"机种名",
            name:"machineOfName"
          },
          {
            label:"机号",
            name:"machineName"
          },   
          {
            label:"班次",
            name:"shiftno",
            render:(row)=>{
              if(row.shiftno){
                return ((config["SHIFT_TYPE"][row.shiftno])||{})["zh_CN"];
              }
              return '';
            }           
          },           
          {
            label:"故障类型",
            name:"machineName",
            render:(row)=>{
              if(row.tmNcGroup){
                return row.tmNcGroup.name?row.tmNcGroup.name:'';
              }
              return '';
            }
          }, 
          {
            label:"故障内容",
            name:"machineName",
            render:(row)=>{
              if(row.tmNc){
                return row.tmNc.name?row.tmNc.name:'';
              }
              return '';
            }
          }, 
          {
            label:"故障处理方式",
            name:"ncProcessMode",
            render:(row)=>{
              if(row.ncProcessMode){
                return ((config["SHIFT_TYPE"][row.ncProcessMode])||{})["zh_CN"];
              }
              return '';
            }           
          },   
          {
            label:"发现工位",
            name:"discoveryUloc",
            render:(row)=>{
              if(row.discoveryUloc && row.discoveryUloc.name){
                return ('['+row.discoveryUloc.no+']'+row.discoveryUloc.name);
              }
              return '';
            }
          },                                       
          {
            label:"NG出口",
            name:"ngExit"
          },  
          {
            label:"状态",
            name:"status",
            render:(row)=>{
              if(row.status){
                return ((config["UNQUALIFIED_STATE"][row.status])||{})["zh_CN"];
              }
              return '';
            }           
          }, 
          {
            label:"创建时间",
            name:"createTime"
          },  
          {
            label:"录入时间",
            name:"submitTime"
          },  
          {
            label:"备注",
            name:"remarks"
          },                                   
        ],
        dataList:[]
    }

  }

  componentWillMount(){
    this.getInitFunc();
  }

  componentDidMount(){
    let that=this;

    let {lodding}=this.state;
    if(!lodding) this.getInitFunc();

    // 监听扫码枪
    this.honeyWell=DeviceEventEmitter.addListener('globalEmitter_honeyWell',function(key){
      if(key && (key.length==21 || key.length==22)){
        that.InputSN.setValue(key,()=>{
          that.getInitFunc({
            _sn:key
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
   * 聚焦
   * @param {*} option 
   */
  focusHandle(){
    // this.InputSN.focusHandle(); // 自动聚焦
  }

  /**
   * 重置input
   * @param {*} option 
   * @returns 
  */
  resetInputHandle(){
    this.InputSN.setValue("");
  }  

  /**
   * 页面 初始化
   * @param {}  
   */
   getInitFunc(option={}){

    let that=this;


    // 判断SN位数
    if( (option["_sn"]) && ( ((option["_sn"]).length!=21) && ((option["_sn"]).length!=22) ) ){
      Toast.offline('SN码必须是21(或22)位字符编码！',1);
      return;
    }    

    WISHttpUtils.post("faultMachineApp/faultMachineList.do",{
      params:{
        limit:10,
        offset:option["currentPage"]?((option["currentPage"]-1)*10):0,
        "queryCondition[status]":'CLOSED',
        "queryCondition[sn]":option["_sn"]||''
      }
    },(result) => {
      // console.log(result)

      that.setState({
          currentPage:result.currentPage,
          totalPage:result.totalPage,
          dataList: result.rows,
          lodding:true
        },()=>{
          // 刷新table 
          that.refs.tableRef.updateTable();
      });


    });

  }



  render() {
    let that=this;
    let {searchValue,currentPage,totalPage}=this.state;
    let {navigation,form} = this.props;
    const {width, height, scale} = Dimensions.get('window');


    return (
      <View style={{height:height}}>
          <WisInputSN
            onRef={(ref)=>{this.InputSN =ref}}
            onQuery={(_text)=>{
              that.getInitFunc({
                _sn:_text
              });
            }}           
            onSearch={(_text)=>{
              that.getInitFunc({
                _sn:_text
              });
            }}
          />       
          <WisTable 
            ref="tableRef"            
            currentPage={currentPage}   // 当前页
            totalPage={totalPage}       // 总页数

            height={height-260}
            columns={this.state.columns} // columns 配置列
            data={this.state.dataList}  // table 数据   
            onChangePage={(option)=>{
              that.getInitFunc({
                currentPage:option["targetPage"]
              });
            }}  
            onClickRow={(row)=>{
              navigation.navigate('awaitDetails',{
                id:row['id'],
                row:row||{},
                isFinish:true
              }); 
            }}
          /> 
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container:{
    // backgroundColor:"red",

  },
});

export default Page;

