<template>
  <div class="demo-ruleForm login-container">
    <h3 class="title">欢迎使用无忧机器人</h3>
    <el-skeleton id="qrcode" style="width:150px;" class="remember" :loading="loading" animated>
      <template slot="template">
        <div style="width:100%;display:flex;flex-direction:column;align-items:center;">
          <el-skeleton-item variant="image" style="width: 150px; height: 150px;" />
        </div>
      </template>
      <template>
        <img :src="qrCode" class="image" style="width: 150px; height: 150px;" />
      </template>
    </el-skeleton>
    <p>{{tip}}</p>
  </div>
</template>

<script>
import { getLoginQrCode, getLoginState, getMemberInfo } from '../api/api';
//import NProgress from 'nprogress'
export default {
  data() {
    return {
      loading: true,
      qrCode: '',
      timeInterval: null,
      loadingMask: null,
      tip: '请使用QQ扫码登录',
      group: 0,
    };
  },
  onShow() {
    // this.getQrCode()
  },
  created() {
    this.group = this.$route.query.group
    console.log(this.group);
    console.log(this.$cookies);
    let loginKey = this.$cookies.get('loginKey')
    if (loginKey) {
      this.key = loginKey
    } else {
      this.$cookies.set('loginKey', new Date().getTime())
      this.key = this.$cookies.get('loginKey')
    }
    this.getQrCode()
  },
  methods: {
    getQrCode() {
      getLoginQrCode({
        key: this.key
      }).then(res => {
        this.loading = false
        if (res.data.code == 0) {
          this.qrCode = 'data:image/png;base64,' + res.data.result
          this.getLogin()
        }
      })
    },
    getLogin() {
      this.timeInterval = setInterval(() => {
        getLoginState({ key: this.key }).then(res => {
          let cookies = res.data.result.cookies
          let response = res.data.result.response
          console.log(res);
          console.log(cookies);
          if (~response.indexOf('ptuiCB(\'67\'')) {
            if (!this.loadingMask) {
              this.tip = '扫描成功,请确认登录'
              console.log(document.getElementById('qrcode'));
              this.loadingMask = this.$loading({
                lock: true,
                text: 'Loading',
                fullscreen: false,
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.6)',
                target: document.getElementById('qrcode')
              });
            }
            console.log(this.loadingMask);
          } else if (~response.indexOf('ptuiCB(\'0\'')) {
            this.tip = '登录成功! 跳转中...'
            clearInterval(this.timeInterval)
            console.log(cookies.find(item => item.name == 'uin'));
            let user = {
              uin: cookies.find(item => item.name == 'uin').value.substring(1)
            }
            console.log(this.group);
            getMemberInfo({
              groupCode: this.group,
              qqCode: user.uin
            }).then(res => {
              console.log(res);
              Object.assign(user, res.data.result)
              sessionStorage.setItem('user', JSON.stringify(user));
              this.$router.push({ path: '/' })
            })
          }
        })
      }, 1500);
    }
  }
}

</script>

<style lang="scss" scoped>
.login-container {
  /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
  -webkit-border-radius: 5px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  background-clip: padding-box;
  margin: 180px auto;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
  display: flex;
  flex-direction: column;
  align-items: center;
  .title {
    margin: 0px auto 40px auto;
    text-align: center;
    color: #505458;
  }
  .remember {
    margin: 0px 0px 35px 0px;
  }
}
</style>