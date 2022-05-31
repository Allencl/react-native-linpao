import React, { Component } from 'react';

import { Linking,DeviceEventEmitter,StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Toast,Modal,Card, WhiteSpace, WingBlank, Button, Icon } from '@ant-design/react-native';

import WISHttpUtils from '@wis_component/http';   // http 
import AsyncStorage from '@react-native-async-storage/async-storage';


class HomeScreen extends Component{
    constructor(props) {
        super(props);
    
        this.state={
            isProcurement: false,  // 采购商
            isFinancing:false,   //  财务

            visible: !true,    // 版本更新
            version:'1.0.1',  // 当前版本号

            numberConfig:{},  // 数字


        }
      }

    componentWillUnmount(){
        this.listener.remove();
        this.toCenter.remove();
    }


    componentDidMount(){

        var that=this;
        var {navigation} = this.props;


        // 获取 菜单 
        that.getMenu()

        // 未登录   
        AsyncStorage.getItem("login_type").then((option)=>{
            // Toast.offline(option,1);
            if( option !="in" ){
                navigation.navigate('Login');
            }else{
             

            }
        });  



        // 到个人中心
        this.toCenter =DeviceEventEmitter.addListener('globalEmitter_to_center',function(){
            navigation.navigate('centerPage'); 
        });

        // 退出登录
        this.listener =DeviceEventEmitter.addListener('globalEmitter_logOut',function(){
            AsyncStorage.setItem("login_type","out").then(()=>{
                navigation.navigate('Login'); 
            });
        });
    }



    /**
     * 获取菜单
     */
    getMenu(){
        AsyncStorage.getItem("menu_buffer_list").then((option)=>{
            let _menuJson=JSON.parse(option)

            console.log(_menuJson)
        })
    }

    /**
     * 
     * @param {*} code 
     */
    onClose =()=> {
        this.setState({
            visible: false,
        });
    }

    /**
     * 下载 最新版
     * @param {*} code 
     */
    onDownload=()=>{
        var downloadURL = 'http://www.baidu.com/';  // 下载页面         
  
        Linking.canOpenURL(downloadURL).then(supported => {         
            if (!supported) {            
                console.warn('Can\'t handle url: ' + downloadURL);            
            } else {            
                return Linking.openURL(downloadURL);            
            }            
        }).catch(err => console.error('An error occurred',downloadURL));           
    }


    /**
     * 页面跳转
     * @param {路由名称} code 
    */
    authority=(code)=>{
        const {navigation} = this.props;
        navigation.navigate(code);
    }

    render() {
        const {navigation} = this.props;
        const {isProcurement,isFinancing,version,numberConfig}=this.state;

        return (
        <ScrollView style={styles.page}>

            <Modal
            title="版本更新"
            transparent
            onClose={this.onClose}
            maskClosable
            visible={this.state.visible}
            closable
            //   footer={footerButtons}
            >
            <View style={{ paddingVertical: 20 }}>
                <View style={styles.versionContent}>
                    <Text style={{ fontSize:16 }}>当前版本1：</Text>
                    <Text style={{ fontSize:16 }}>1.0.1</Text>
                </View>
                <View style={styles.versionContent}>
                    <Text style={{ fontSize:16 }}>更新版本1：</Text>
                    <Text style={{ fontSize:16 }}>1.0.3</Text>
                </View>

                <View style={{paddingTop:8}}>
                    <Button type="primary" onPress={this.onDownload}>点击下载安装版</Button>
                </View>
            </View>
            <Button type="ghost" onPress={this.onClose}>取消</Button>
            </Modal>



            <WingBlank size="md" style={styles.wingBlank}>

                <Card style={styles.card}>
                    <Card.Header
                        title="常用"
                        thumb={<Icon name="audit" size="md" color="#1890ff" style={{marginRight:6}} />}
                    />
                    <Card.Body>
                        <View style={styles.cardContent}>
                            <View style={styles.flexBox}>
                                <View style={styles.flexBoxCol}>
                                    <View style={styles.flexBoxColChild}>
                                        <TouchableOpacity onPress={() => this.authority('malfunction') }>
                                            <View style={styles.menu_child}>
                                                <Icon style={styles.menu_child_icon} name="folder-add" size="lg" color="#1890ff" />
                                                <Text style={styles.menu_child_text}>故障机新增</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>  
                                <View style={styles.flexBoxCol}>
                                    <View style={styles.flexBoxColChild}>
                                        <TouchableOpacity onPress={() => this.authority('malfunctionList') }>
                                            <View style={styles.menu_child}>
                                                <Icon style={styles.menu_child_icon} name="unordered-list" size="lg" color="#009" />
                                                <Text style={styles.menu_child_text}>故障机列表</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View> 
                                <View style={styles.flexBoxCol}>
                                    <View style={styles.flexBoxColChild}>
                                        <TouchableOpacity onPress={() => this.authority('NG') }>
                                            <View style={styles.menu_child}>
                                                <Icon style={styles.menu_child_icon} name="export" size="lg" color="#ffad33" />
                                                <Text style={styles.menu_child_text}>NG出入口手动触发</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>                                                         
                            </View>
                                 
                        </View>         
                    </Card.Body>
                </Card>

                <View style={styles.footer}><Text style={styles.footerText}>——到底了——</Text></View>
            </WingBlank>
        </ScrollView>
        );
    }
}



const styles = StyleSheet.create({
    cardContent:{
        paddingTop:8
    },
    flexBox:{
        flexDirection:"row",
        paddingLeft:6,
        paddingRight:6
    },
    flexBoxCol:{
        flex:1,
    },
    flexBoxColChild:{
        alignItems: 'center'
    },    
    versionContent:{
        flexDirection:'row',
        paddingBottom:12
        // justifyContent:'space-between',        
    },
    page:{ 
        backgroundColor:"white"
    },
    wingBlank:{
        paddingBottom:50
    },
    card:{
        marginTop:16
    },
    menu_box: {
        flexDirection: "row",
        flexWrap:"wrap",
        // height: 100,
        // padding: 12
        paddingTop:10,
        // paddingLeft:12,
        // paddingRight:12,
    },
    menu_child_icon:{
        fontSize:32
    },
    menu_child_icon_text:{
        marginTop:8,
        fontSize:12,
        paddingTop:3
    },    
    menu_child: {
        justifyContent: 'center',
        alignItems: 'center',
        width:100,
        height:100,   
        borderWidth: 1,
        borderColor: "#e8eaec",
        borderRadius: 6,
        // marginRight:12,
        marginBottom:3,
        // paddingLeft:6,
        // paddingRight:6
    },
    menu_child_text: {
        textAlign:"center",
        marginTop:3,
        fontSize:15,
        paddingTop:3,
        paddingLeft:10,
        paddingRight:10,
        color:"#000000d9"
 
    },
    footer:{
        justifyContent: 'center',
        alignItems: 'center',  
        paddingTop:16, 
        fontSize:12
    },
    footerText:{
        color:"#000000d9"
    }
  });

export default HomeScreen;
