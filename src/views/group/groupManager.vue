<template>
  <section>
    <div v-if="groupInfo.groupCode">
      <el-page-header @back="goBack" :content="groupInfo.groupName||'群信息'" style="height:50px;line-height:50px">
      </el-page-header>
      <el-container style="height:60vh">
        <el-aside width="20%" :style="'background:'+backgroundColor">
          <div style="width:100%;">
            <canvas id="myCanvas" style="display:none"></canvas>
            <img id="img" :src="groupInfo.groupAvatar" alt="" style="width:80%;margin:10px auto">
          </div>
          <div style="width:100%;height:50px;">{{groupInfo.groupName}}</div>
        </el-aside>
        <el-main :style="'background:'+backgroundColor2">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="信息" name="info">
              <div style="width:100%;height:100%">
                <div class="info">
                  <div>群号码</div>
                  <div>{{groupInfo.groupCode}}</div>
                </div>
                <div class="info">
                  <div>群名称</div>
                  <div>{{groupInfo.groupName}}</div>
                </div>
                <div class="info">
                  <div>群介绍</div>
                  <div></div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="成员" name="member">
              <memberList :groupInfo="groupInfo" :memberList="memberList" @updateMember="updateMember"></memberList>
            </el-tab-pane>
            <el-tab-pane label="功能设置" name="setting">
              <el-tabs tab-position="left" style="height: 100%;">
                <el-tab-pane label="机器人状态">
                  <el-switch style="margin:20px" @change="power" v-model="groupInfo.powerSwitch" active-text="开启" inactive-text="关闭">
                  </el-switch>
                </el-tab-pane>
                <el-tab-pane label="自动回复">
                  <autoReply :groupInfo="groupInfo" :memberList="memberList" @updateGroup="getGroup"></autoReply>
                </el-tab-pane>
                <!-- <el-tab-pane label="禁言关键词">
                  <el-col :span="24" style="margin:5px">
                    <el-button icon="el-icon-circle-plus" type="primary" @click="" size="mini">添加</el-button>
                    <el-popconfirm title="确定删除所选消息吗？">
                      <el-button icon="el-icon-remove" type="danger" @click="" size="mini" :disabled="messageMultipleSelection.length==0">删除</el-button>
                    </el-popconfirm>
                  </el-col>
                  <el-table ref="multipleTable" :data="groupInfo.banMessageList" tooltip-effect="dark" style="width: 100%" @selection-change="handleBanMessageSelectionChange">
                    <el-table-column prop="" type="selection" min-width="55">
                    </el-table-column>
                  </el-table>
                </el-tab-pane> -->
                <el-tab-pane label="定时任务">
                  <timeTask :groupInfo="groupInfo" :memberList="memberList" @updateGroup="getGroup"></timeTask>
                </el-tab-pane>
              </el-tabs>
            </el-tab-pane>
          </el-tabs>
        </el-main>
      </el-container>
    </div>
  </section>
</template>

<script>
import { powerSwitch, getGroupInfo } from '../../api/api';
import autoReply from './autoReply.vue'
import memberList from './memberList.vue'
import timeTask from './timeTask.vue'
export default {
  components: {
    autoReply,
    memberList,
    timeTask
  },
  data() {
    return {
      specialChar: '‭', //看不见的特殊字符,用于区分@
      groupCode: '',
      groupInfo: {},
      memberList: [],
      activeName: 'info',
      backgroundColor: '',
      backgroundColor2: '',
    }
  },
  mounted() {
    this.groupCode = this.$route.query.code
    this.getInfo()
  },
  methods: {
    handleClick(tab, event) {
      if (tab.index == 1) {
        // this.getMember()
      }
    },
    goBack() {
      this.$router.go(-1)
    },
    getInfo() {
      this.getGroup()
      // this.getMember()
    },
    updateMember(memberList) {
      this.memberList = memberList
    },
    power(e) {
      var that = this
      powerSwitch({
        groupCode: this.groupCode,
        power: e
      }).then(res => {
        if (res.data.code == 0) {
          that.$message({
            message: '设置成功',
            type: 'success'
          });
        } else {
          that.$message.error(res.data.msg);
        }
      })
    },
    getGroup() {
      getGroupInfo({ groupCode: this.groupCode }).then((res) => {
        this.groupInfo = res.data.result
        this.groupInfo.groupAvatar = this.groupInfo.groupAvatar.replace('https://p.qlogo.cn', 'http://localhost:8090/headimage')
        this.getBase64(this.groupInfo.groupAvatar)
        if (this.groupInfo.messageList) {
          this.groupInfo.messageList.forEach(item => {
            if (~item.showMessage.indexOf(this.specialChar)) {
              let str = item.showMessage
              item.showMessage = str.replace(/(@.*‭)/, (m, p) => {
                return '<span style="background:rgb(228,231,237);padding:2px;border-radius:2px;">' + m.substring(0, m.length - 1) + '</span>‭'
              })
              item.showMessage = item.showMessage.replace(/(‭.*‬)/, function (match, param) {
                if (!item.messageTooltip) {
                  item.messageTooltip = [param]
                } else {
                  item.messageTooltip.push(param)
                }
                return ''
              })
            }
            if (~item.showAnswer.indexOf(this.specialChar)) {
              let str = item.showAnswer
              item.showAnswer = str.replace(/(@.*‭)/, (m, p) => {
                return '<span style="background:rgb(228,231,237);padding:2px;border-radius:2px;">' + m.substring(0, m.length - 1) + '</span>‭'
              })
              item.showAnswer = item.showAnswer.replace(/(‭.*‬)/, function (match, param) {
                if (!item.answerTooltip) {
                  item.answerTooltip = [param]
                } else {
                  item.answerTooltip.push(param)
                }
                return ''
              })
            }
          })
        }
      });
    },
    getImageColor(canvas, img) {
      canvas.width = img.width;
      canvas.height = img.height;
      img.onload = () => {
        var context = canvas.getContext("2d");
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        // 获取像素数据
        var data = context.getImageData(0, 0, img.width, img.height).data;
        var r = 1, g = 1, b = 1;
        // 取所有像素的平均值
        for (var row = 0; row < img.height; row++) {
          for (var col = 0; col < img.width; col++) {
            if (row == 0) {
              r += data[((img.width * row) + col)];
              g += data[((img.width * row) + col) + 1];
              b += data[((img.width * row) + col) + 2];
            } else {
              r += data[((img.width * row) + col) * 4];
              g += data[((img.width * row) + col) * 4 + 1];
              b += data[((img.width * row) + col) * 4 + 2];
            }
          }
        }

        // 求取平均值
        r /= (img.width * img.height);
        g /= (img.width * img.height);
        b /= (img.width * img.height);

        // 将最终的值取整
        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);
        // this.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
        this.backgroundColor = this.getLightColor([r, g, b], 0.6);
        this.backgroundColor2 = this.getLightColor([r, g, b], 0.9);
      }
    },
    getBase64(imgUrl) {
      let that = this
      window.URL = window.URL || window.webkitURL;
      var xhr = new XMLHttpRequest();
      xhr.open("get", imgUrl, true);
      // 至关重要
      xhr.responseType = "blob";
      xhr.onload = function () {
        if (this.status == 200) {
          //得到一个blob对象
          var blob = this.response;
          // 至关重要
          let oFileReader = new FileReader();
          oFileReader.onloadend = function (e) {
            // 此处拿到的已经是 base64的图片了
            let base64 = e.target.result;
            var canvas = window.document.getElementById('myCanvas');
            var img = window.document.getElementById('img');
            img.src = base64
            that.getImageColor(canvas, img)
          };
          oFileReader.readAsDataURL(blob);
          let src = window.URL.createObjectURL(blob);
          img.src = src
        }
      }
      xhr.send();
    },
    getLightColor(rgbc, level) {
      for (var i = 0; i < 3; i++) rgbc[i] = Math.floor((255 - rgbc[i]) * level + rgbc[i]);
      return "rgb(" + rgbc[0] + "," + rgbc[1] + "," + rgbc[2] + ")";
    },
  }
}

</script>

<style scoped>
.info {
  display: flex;
  flex-direction: row;
}

.info > div {
  line-height: 100%;
  margin: 4px 0;
}

.info :nth-child(1) {
  font-weight: bold;
  margin-left: 5px;
  margin-right: 5px;
}

.el-header,
.el-footer {
  text-align: center;
}

.el-aside {
  color: #333;
  text-align: center;
}

.el-main {
  color: #333;
}

body > .el-container {
  margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}
</style>