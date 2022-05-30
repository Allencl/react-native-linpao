import React from 'react';
import { BackHandler,DeviceEventEmitter,window,TouchableOpacity,Text,Image,ScrollView, View, StyleSheet } from 'react-native';
import { Icon,Button,Modal, Provider, InputItem, List, Toast } from '@ant-design/react-native';
import { createForm, formShape } from 'rc-form';
import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'


import WISHttpUtils from '@wis_component/http';   // http 

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Base64 } from 'js-base64';

// 密钥
const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDUWQteEr5ZCpOgO0NJ7SM706M\n' +
  'fUleLNxE/8tYhiEkViZ1TISv1oycR8oxO2PCQEAp8ek+RxpJVxGmhl6PWUIVCvr4\n' +
  'ZhBBv3B1aRhq1o5ZIvBkosDnFm+jWfX/LJ4R4uXMHXS7/xxPSz8OKOMs2IG9KdOq\n' +
  '+TLKFsTgqjKDWuOL9QIDAQAB'
const privateKey = 'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAMNRZC14SvlkKk6A\n' +
  '7Q0ntIzvTox9SV4s3ET/y1iGISRWJnVMhK/WjJxHyjE7Y8JAQCnx6T5HGklXEaaG\n' +
  'Xo9ZQhUK+vhmEEG/cHVpGGrWjlki8GSiwOcWb6NZ9f8snhHi5cwddLv/HE9LPw4o\n' +
  '4yzYgb0p06r5MsoWxOCqMoNa44v1AgMBAAECgYEAsE9NZbo7u4oOopTA52obEkmH\n' +
  'F0yVKPzHzUU2Mu/JBPr7dlEfSXcbsIshWnWo5JWJFhP4Hy6h7Og6155dx3qkKbOL\n' +
  'FQ9Shwr6ffJ8obLhmdQHIBCt5j58bth7oBGO/kCRGKAtCCnzfwJn/OuwSLQDgUkd\n' +
  '/ED9euQt7wXGj4zsGBUCQQDy8qvkGm2WeGTDCw/3DBswGK3yY591E45Gpn8bdddI\n' +
  'ByTWQpCsW6PlVQhYPe8ugUn1DWU7p9qo5Nbl7HXO2D6TAkEAzc+m0BH42WVaEyDi\n' +
  'JJa8yLQQk67b2jWIeg+NlJhNk+1dkLowPlVdd8F2GPDuxF4Cfnnsg/XP3OSxh5Ap\n' +
  'RSWYVwJAEUkw78btmzIvwSztUt+ao55t6fwqoVLl4aMBEjwdODPB7DjKQGk4zR1y\n' +
  'vYySkxWB5JyyYj88MJ4vqCZd73y1XwJAD9l4+DcaGevTNvvmTnkJSs+LI0RpC/Hp\n' +
  'c7T060ebWdQCy517D6HVU96jMKKFULwIpyLOkw8AFfvKrCzu8LNHewJBALFSNdle\n' +
  'XX5yzD1eMbIRTMKZ8PlD8JdFoPjX7sq5JLURjPkoc/Z6kNoLpDrvgW4U0Ipk/xiz\n' +
  'Yn9C33IPqIqjg5k='



// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export function decrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey) // 设置私钥
  return encryptor.decrypt(txt) // 对数据进行解密
}  


class LoginScreenForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      toggleEye:true,  // 显示密码
      modalVisible:false,

      warehouseMap:[],

      username:"",
      password:"",
    };
  }

  componentDidMount() {
    let that=this;

    // 缓存的 登录信息
    AsyncStorage.getItem("login_message").then((option)=>{
      if(option){
        try{
          let loginMessage=JSON.parse(option);
          that.setState({
            username:loginMessage["username"],
            password:loginMessage["password"],
          });
        } catch (error) {

        }          
      }
    });

    BackHandler.addEventListener('hardwareBackPress',this.onBackButtonPressAndroid);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress',this.onBackButtonPressAndroid);
  }  

  /**
   * 
   * @returns 禁用返回键
   */
  onBackButtonPressAndroid = () => {
    if (this.props.navigation.isFocused()) {
        if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
          // //最近2秒内按过back键，可以退出应用。
          // return false;
          BackHandler.exitApp();//直接退出APP
        }
        this.lastBackPressed = Date.now();
        Toast.info('再按一次退出应用',1);
        return true;
    }
  }  


  /**
   * 获取仓库
   */
  getWarehouse= ()=>{
    let that=this;

    // console.log("成功")

    WISHttpUtils.get("system/user/selectUserStore",{

    },(result)=>{
      const {code,rows=[]}=result;

      if(code==200){
        that.setState({
          modalVisible:true,
          warehouseMap:rows
        })
      }

    })

  }


  /**
   * 登录
   * @param
   */
   submit = () => {
    let that=this;

    that.props.form.validateFields((error, value) => {
        // 表单 不完整
        if(error){
          Toast.fail('用户名或密码未填！');
        } else{
          const {navigation} = that.props;

          // let _name = Base64.encode(value["username"].trim());
          // let _password = Base64.encode(value["password"].trim());

          // fetch("http://10.6.12.4:8080/"+"phoneMain/phoneLogin.do",{
          //   method: 'POST',
          //   mode: 'cors',
          //   body: JSON.stringify({
          //     'j_username': value["username"].trim(),
          //     'j_password': value["password"].trim()
          //   }),
          // }).then(res => {
          //   Toast.fail(111);
          //   // Toast.fail(res.status);
          //   console.log(res);
          //   // console.log();

          // }).then(json => {

          // }).catch(err => {

          // })


          WISHttpUtils.loginFunc({
            username:value["username"].trim(),
            password:value["password"].trim(),
            // password:encrypt( value["password"].trim() ),
          },()=>{

            that.getWarehouse()

            // 登录状态
            AsyncStorage.removeItem("login_type").then(()=>{
              AsyncStorage.setItem("login_type","in");
            });

            // navigation.navigate('Home');           
          })
       
        }
    });
  }


  render() {

    const {navigation} = this.props;
    const {getFieldProps, getFieldError, isFieldValidating} = this.props.form;
    const {modalVisible,username,password,toggleEye}=this.state;
  
    return (
      <Provider>
        <View
          style={styles.container}
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <List>
            <View style={styles.imgBox}>
              <Image
                style={styles.img}
                source={require('./img/logo.png')}
              />  
            </View>
            {/* <View style={styles.headTitle}>
              <Text style={styles.headTitleText}>	盈合机器人</Text>
            </View> */}

            <View style={{height:8}}></View>

              <View style={{paddingRight:18}}>
                <InputItem
                  {...getFieldProps('username',{
                    rules:[{required:true}],
                    initialValue:username
                  })}
                  error={getFieldError('username')}
                  placeholder=""
                >
                  用户名
                </InputItem>

                <InputItem
                  {...getFieldProps('password',{
                    rules:[{required:true}],
                    initialValue:password
                  })}
                  error={getFieldError('password')}
                  type={toggleEye?"password":"text"}
                  extra={
                    <TouchableOpacity onPress={()=>{
                        this.setState({
                          toggleEye:!toggleEye
                        });
                    }}>
                      <Icon name={toggleEye?"eye-invisible":"eye"} />
                    </TouchableOpacity>
                  
                  }
                  placeholder=""
                >
                  密码
                </InputItem>
              </View>
              <List.Item style={styles.footerBox}>
                <Button
                  style={styles.footerBtn}
                  onPress={this.submit}
                  // type="primary"
                >
                  <Text style={{fontSize:22,color:"#fff"}}>登 录</Text>
                </Button>
              </List.Item>
          </List>
        </View>

        {/* <Modal
          visible={modalVisible}
          maskClosable
        >
          <View style={styles.warehouseBox}>
            <Text>222</Text>
          </View>
        </Modal> */}


        <Modal
            title="选择仓库"
            transparent
            onClose={()=>{
              this.setState({modalVisible:false})
            }}
            
            visible={this.state.modalVisible}
            closable
   
            >
            <ScrollView style={{height:300, paddingVertical: 20 }}>

              { this.state.warehouseMap.map((o,i)=>{
                  return (<Button key={String(i)} type="ghost" style={styles.warehouseButton}>
                    <View style={styles.warehouseButtonBox}>
                      <View style={styles.warehouseButtonIcon} >
                        <Icon name="cloud" color="#ffad33"/>
                      </View>
                      <View >
                        <Text numberOfLines={1} style={styles.warehouseButtonText}>{o.storageName}</Text>
                      </View>
                    </View>

                  </Button>)
                })

              }

            </ScrollView>

          </Modal>


      </Provider>
    );
  }
}



const styles = StyleSheet.create({
  warehouseButton:{
    marginTop:16
  },
  warehouseButtonBox:{
    width:120,
    flexDirection:"row",
    textAlign:'left',
    // backgroundColor:'red'
  },
  warehouseButtonIcon:{
    // flex:1,
    // backgroundColor:'red',
    // width:28,
    // height:22,
    // // marginTop:16,
    // // marginRight:6,
    // // backgroundColor:"red",
    // paddingTop:4,
    // paddingRight:1
    // position:'absolute',
    // top:36
  },
  warehouseButtonText:{
    
    paddingLeft:8,
    fontSize:16
  },
  warehouseBox:{
    backgroundColor:'red'
  },  
  img:{
    width:120,
    height:120
  },
  imgBox:{
    alignItems:"center",
    marginTop:50,
    marginBottom:30
  },
  container:{
    flex: 1,    
    flexDirection: 'column',
    backgroundColor:"#fff"
  },
  headTitle:{
    paddingTop:60,
    paddingLeft:32,
    paddingBottom:50
  },
  headTitleText:{
    color:"#2d8cf0",
    fontSize:46,
    fontWeight:"bold",
    fontStyle:'italic',
    textAlign:"center"
  },
  footerBox:{
    paddingTop:60
  },
  footerBtn:{
    backgroundColor:"#009",
    borderWidth:0,
    borderRadius:6,
    fontSize:32
  }

});


export default createForm()(LoginScreenForm);