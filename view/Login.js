import React from 'react';
import { BackHandler,DeviceEventEmitter,window,TouchableOpacity,Text,Image, View, StyleSheet } from 'react-native';
import { Icon,Button,Modal, Provider, InputItem, List, Toast } from '@ant-design/react-native';
import { createForm, formShape } from 'rc-form';

import WISHttpUtils from '@wis_component/http';   // http 

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Base64 } from 'js-base64';

class LoginScreenForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      toggleEye:true,  // 显示密码
      modalVisible:true,

      userName:"",
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
            userName:loginMessage["userName"],
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

          // let _name = Base64.encode(value["userName"].trim());
          // let _password = Base64.encode(value["password"].trim());

          // fetch("http://10.6.12.4:8080/"+"phoneMain/phoneLogin.do",{
          //   method: 'POST',
          //   mode: 'cors',
          //   body: JSON.stringify({
          //     'j_username': value["userName"].trim(),
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
            userName:value["userName"].trim(),
            password:value["password"].trim(),
          },()=>{

            // 登录状态
            AsyncStorage.removeItem("login_type").then(()=>{
              AsyncStorage.setItem("login_type","in");
            });

            navigation.navigate('Home');           
          })
       
        }
    });
  }


  render() {

    const {navigation} = this.props;
    const {getFieldProps, getFieldError, isFieldValidating} = this.props.form;
    const {modalVisible,userName,password,toggleEye}=this.state;
  
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
                  {...getFieldProps('userName',{
                    rules:[{required:true}],
                    initialValue:userName
                  })}
                  error={getFieldError('userName')}
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
            <View style={{ paddingVertical: 20 }}>
              <Button type="ghost" style={styles.warehouseButton}>
                <View style={styles.warehouseButtonIcon} >
                  <Icon name="cloud" color="#ffad33"/>
                </View>
                <Text>宁波仓</Text>
              </Button>
              <Button type="ghost" style={styles.warehouseButton}>
                <View style={styles.warehouseButtonIcon} >
                  <Icon name="cloud" color="#ffad33"/>
                </View>
                <Text>上海仓</Text>
              </Button>


              <Button type="ghost" style={styles.warehouseButton}>
                <View style={styles.warehouseButtonIcon} >
                  <Icon name="cloud" color="#ffad33"/>
                </View>
                <Text>深圳仓</Text>
              </Button>
            </View>

          </Modal>


      </Provider>
    );
  }
}



const styles = StyleSheet.create({
  warehouseButton:{
    marginTop:16
  },
  warehouseButtonIcon:{
    width:28,
    height:22,
    // marginTop:16,
    // marginRight:6,
    // backgroundColor:"red",
    paddingTop:4,
    paddingRight:1
    // position:'absolute',
    // top:36
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