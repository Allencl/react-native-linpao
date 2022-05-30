import React, { Component } from 'react';
import { TouchableOpacity,DeviceEventEmitter,Dimensions,StyleSheet, ScrollView, View,Text,   } from 'react-native';
import { Icon,InputItem,WingBlank, DatePicker, List, Tag, WhiteSpace, Toast,Button,Tabs } from '@ant-design/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createForm, formShape } from 'rc-form';
import { WisInput,WisSelect, WisFormHead, WisDatePicker, WisTextarea,WisCamera } from '@wis_component/form';   // form 
import { WisTable,WisButtonFloat } from '@wis_component/ul';   // ul 


import WISHttpUtils from '@wis_component/http'; 
import {WisTableCross} from '@wis_component/ul';
import {WisFormText} from '@wis_component/form';   // form 

import AwaitPage from './await.js';   // 待维修
import FinishPage from './finish.js';   // 已完成



class Page extends Component {
  constructor(props) {
    super(props);

    this.state={
      show:false,
      config:{}
    }

  }

  componentWillMount(){
    this.getInitFunc();



  }

  componentWillUnmount(){
    // 更新列表
    this.updateList.remove();
  }

  componentDidMount(){
    let that=this;
    let routeParams=this.props.route.params.routeParams;


    // 过滤
    // if(routeParams && routeParams.id){
    //   setTimeout(()=>{
    //     this.awaitPageRef.getInitFunc({
    //       id:routeParams.id
    //     })
    //   },200);      
    // }



    // 更新列表
    this.updateList =DeviceEventEmitter.addListener('globalEmitter_malfunctionList',function(){
        that.setState({
          show:false
        },()=>{
          that.setState({show:true})
        });
    });    
  }


  /**
   * 页面 初始化
   * @param {}  
   */
   getInitFunc(){
    let that=this;

    AsyncStorage.getItem("token_config").then((option)=>{
      let data=JSON.parse(option)["entrys"];
      
      that.setState({
        show:true,
        config:data
      });
    });  


  }


  /**
   * tabs 切换
   * @returns 
   */
   tabsChange(index){
      // 待维修 | 已完成
      if(!index){
        this.awaitPageRef.resetInputHandle();
      }else{
        this.finishPageRef.resetInputHandle();
      }
   }

  render() {
    let{config,show}=this.state;
    let {navigation,form} = this.props;
    const {width, height, scale} = Dimensions.get('window');
    let routeParams=this.props.route.params.routeParams;



    const tabs = [
      { title: '待维修' },
      { title: '已完成' },
    ];

    return ( show ?
      <View style={{height:height,backgroundColor:"#fff"}}>
        <Tabs tabs={tabs} 
          animated={false}
          onChange={(obj,index)=>{
            this.tabsChange(index)
          }}
        >
          <View>
            <AwaitPage 
              onRef={(ref)=>{this.awaitPageRef=ref}}
              config={config} 
              navigation={navigation} 
              routeParams={routeParams}
            />
          </View>
          <View >
            <FinishPage 
            onRef={(ref)=>{this.finishPageRef=ref}}
            config={config} 
            navigation={navigation} />
          </View>
        </Tabs> 
      </View>
      :
      <View></View>
    );
  }
}



export default Page;

