<template>
  <section>
    <div>
      <el-page-header @back="goBack" :content="groupInfo.groupName||'群信息'" style="height:50px;line-height:50px">
      </el-page-header>
      <el-container style="height:60vh">
        <el-aside width="20%" :style="'background:'+backgroundColor">
          <el-skeleton style="width: 100%" :loading="loading" animated>
            <template slot="template">
              <el-skeleton-item variant="image" style="width: 200px;" />
              <div style="padding: 14px;">
                <el-skeleton-item variant="h3" style="width: 50%;" />
              </div>
            </template>
            <div style="width:100%;">
              <canvas id="myCanvas" style="display:none"></canvas>
              <img id="img" :src="groupInfo.groupAvatar" alt="" style="width:80%;margin:10px auto">
            </div>
            <div style="width:100%;height:50px;">{{groupInfo.groupName}}</div>
          </el-skeleton>
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
              <el-col :span="24" style="padding: 0px;margin: 0px">
                <el-form :inline="true" size="mini">
                  <el-form-item size="mini">
                    <el-input size="mini" v-model="memberName" placeholder="搜索群成员" @change="searchMember"></el-input>
                  </el-form-item>
                  <el-form-item size="mini">
                    <el-button size="mini" type="primary" @click="searchMember">搜索</el-button>
                  </el-form-item>
                </el-form>
              </el-col>
              <el-table height="500" :data="memberList" style="width: 100%">
                <el-table-column label="头像" width="80">
                  <template width="80" slot-scope="scope">
                    <div style="width:40px;height:50px;display:flex;align-items:center;">
                      <img style="width:40px;height:40px;" :src="scope.row.accountAvatar">
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="accountNickname" label="成员" min-width="100" sortable>
                </el-table-column>
                <el-table-column prop="accountRemarkOrNickname" label="群昵称" min-width="100" sortable>
                </el-table-column>
                <el-table-column prop="accountCode" label="QQ号" min-width="100" sortable>
                </el-table-column>
                <el-table-column prop="permission" label="权限" min-width="80" :formatter="getPermission">
                </el-table-column>
                <el-table-column prop="joinTime" label="入群时间" :formatter="formatDate" min-width="100" sortable>
                </el-table-column>
                <el-table-column prop="lastSpeakTime" label="最后发言" :formatter="formatDate" min-width="100" sortable>
                </el-table-column>
                <el-table-column prop="muteTime" label="禁言时长" :formatter="formatTime" min-width="100" sortable>
                </el-table-column>
                <el-table-column label="操作" min-width="160">
                  <template slot-scope="scope">
                    <!-- <el-button size="small" @click="toManager(scope.row.groupCode)">管理群</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">退群</el-button> -->
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="功能设置" name="setting">
              <el-tabs tab-position="left" style="height: 100%;" value="autoReply">
                <el-tab-pane label="机器人状态">
                  <el-switch style="margin:20px" @change="power" v-model="groupInfo.powerSwitch" active-text="开启" inactive-text="关闭">
                  </el-switch>
                </el-tab-pane>
                <el-tab-pane label="自动回复" name="autoReply">
                  <el-col :span="24" style="margin:5px">
                    <el-button icon="el-icon-circle-plus" type="primary" @click="messageDialogVisible = !messageDialogVisible" size="mini">添加</el-button>
                    <el-popconfirm title="确定删除所选消息吗？" @confirm="deleteMessage">
                      <el-button slot="reference" icon="el-icon-remove" type="danger" size="mini" :disabled="messageMultipleSelection.length==0">删除</el-button>
                    </el-popconfirm>
                  </el-col>
                  <el-dialog title="添加自动回复消息" :visible.sync="messageDialogVisible">
                    <el-form :model="form" :rules="rules" ref="messageForm">
                      <el-form-item label="消息内容" prop="message" :label-width="formLabelWidth">
                        <el-autocomplete :highlightFirstItem="true" style="width:100%" v-model="form.message" :fetch-suggestions="(val, cb)=>{querySearch(val, cb, 'message')}" :trigger-on-focus="false" @select="(val)=>handleSelect(val, 'message')" ref='messageInput'></el-autocomplete>
                      </el-form-item>
                      <el-form-item label="回复内容" prop="answer" :label-width="formLabelWidth">
                        <el-autocomplete :highlightFirstItem="true" style="width:100%" v-model="form.answer" :fetch-suggestions="(val, cb)=>{querySearch(val, cb, 'answer')}" :trigger-on-focus="false" @select="(val)=>handleSelect(val, 'answer')" ref='answerInput'></el-autocomplete>
                      </el-form-item>
                    </el-form>
                    <div slot="footer" class="dialog-footer">
                      <el-button @click="resetForm">取 消</el-button>
                      <el-button type="primary" @click="submitForm">确 定</el-button>
                    </div>
                  </el-dialog>
                  <el-table ref="multipleTable" :data="groupInfo.messageList" tooltip-effect="dark" style="width: 100%" @selection-change="handleMessageSelectionChange">
                    <el-table-column type="selection" min-width="55">
                    </el-table-column>
                    <el-table-column prop="message" label="消息内容" min-width="120">
                      <template slot-scope="scope">
                        <el-tooltip placement="top" v-if="scope.row.messageTooltip">
                          <div slot="content">
                            <div v-for="item in scope.row.messageTooltip" :key="item">{{item}}<br /></div>
                          </div>
                          <div v-html="scope.row.showMessage"></div>
                        </el-tooltip>
                        <div v-else v-html="scope.row.showMessage"></div>
                      </template>
                    </el-table-column>
                    <el-table-column prop="answer" label="回复内容" min-width="120">
                      <template slot-scope="scope">
                        <el-tooltip placement="top" v-if="scope.row.answerTooltip">
                          <div slot="content">
                            <div v-for="item in scope.row.answerTooltip" :key="item">{{item}}<br /></div>
                          </div>
                          <div v-html="scope.row.showAnswer"></div>
                        </el-tooltip>
                        <div v-else v-html="scope.row.showAnswer"></div>
                      </template>
                    </el-table-column>
                    <el-table-column label="添加人" width="100">
                      <template slot-scope="scope">
                        <el-tooltip :content="scope.row.nickname" placement="top">
                          <div>{{ scope.row.qq }}</div>
                        </el-tooltip>
                      </template>
                    </el-table-column>
                  </el-table>
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
                <!-- <el-tab-pane label="定时任务">

                </el-tab-pane> -->
              </el-tabs>
            </el-tab-pane>
          </el-tabs>
        </el-main>
      </el-container>
    </div>
  </section>
</template>

<script>
import { addMessage, removeMessages, powerSwitch, getMemberList, getGroupInfo, getAts } from '../../api/api';

export default {
  data() {
    return {
      specialChar: '‭', //看不见的特殊字符,用于区分@
      messageMultipleSelection: [],
      messageDialogVisible: false,
      form: {
        message: '',
        answer: ''
      },
      rules: {
        message: [
          { required: true, message: '请输入消息内容', trigger: 'change' }
        ],
        answer: [
          { required: true, message: '请输入回复内容', trigger: 'change' }
        ],
      },
      formLabelWidth: '120px',
      banMessageMultipleSelection: [],
      groupCode: '',
      groupInfo: {},
      memberList: [],
      loading: true,
      activeName: 'info',
      backgroundColor: '',
      backgroundColor2: '',
      memberName: '',
      dynamicObj: {},
    }
  },
  mounted() {
    this.groupCode = this.$route.query.code
    this.getInfo()
  },
  methods: {
    deleteMessage() {
      console.log(this.messageMultipleSelection);
      removeMessages({
        groupCode: this.groupCode,
        messageList: this.messageMultipleSelection.map(i => i.bakMessage || i.message)
      }).then(res => {
        if (res.data.code == 0) {
          this.$message({
            message: '删除成功',
            type: 'success'
          });
          this.getGroup()
        } else {
          this.$message.error(res.data.msg);
        }
      })
    },
    handleSelect(e, type) {
      var endPos = this.$refs[type + 'Input'].getInput().selectionEnd
      var startPos = this.$refs[type + 'Input'].getInput().selectionStart
      let val = this.dynamicObj['bak' + type]
      let start = val.substring(0, startPos - 1)
      let end = val.substring(endPos)
      this.form[type] = start + e.atNeko + end
      setTimeout(() => {
        this.$refs[type + 'Input'].focus()
        this.$refs[type + 'Input'].getInput().selectionStart = (start + e.atNeko).length
        this.$refs[type + 'Input'].getInput().selectionEnd = (start + e.atNeko).length
      }, 0);
    },
    querySearch(val, cb, type) {
      // this.setCaretPosition(this.$refs[type + 'Input'].$refs.input.$refs.input, 4)
      this.$refs[type + 'Input'].highlight('1194151796')
      var endPos = this.$refs[type + 'Input'].getInput().selectionEnd
      let str = val.substring(0, endPos)
      if (str.charAt(str.length - 1) == '@') {
        cb(this.memberList)
        this.$set(this.dynamicObj, 'bak' + type, this.form[type])
        return
      }
      if (~val.indexOf('@')) {
        str = str.substring(str.indexOf('@') + 1)
        let memberList = this.memberList.filter(item => ~item.accountRemarkOrNickname.indexOf(str) || ~item.accountCode.indexOf(str));
        cb(memberList)
        return
      }
      cb([])
    },
    resetForm() {
      this.form = {
        message: '',
        answer: ''
      }
      this.messageDialogVisible = false
    },
    submitForm() {
      this.$refs.messageForm.validate((valid) => {
        if (valid) {
          this.messageDialogVisible = false
          addMessage(Object.assign({
            groupCode: this.groupCode
          }, this.form)).then(res => {
            if (res.data.code == 0) {
              this.$message({
                message: '添加成功',
                type: 'success'
              });
              this.getGroup()
            } else {
              this.$message.error(res.data.msg);
            }
          })
          this.form = {
            message: '',
            answer: ''
          }
        } else {
          return false;
        }
      });
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
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleMessageSelectionChange(val) {
      this.messageMultipleSelection = val;
    },
    handleBanMessageSelectionChange(val) {
      this.banMessageMultipleSelection = val;
    },
    handleClick(tab, event) {
      if (tab.index == 1) {
        this.getMember()
      }
    },
    goBack() {
      this.$router.go(-1)
    },
    getInfo() {
      this.getGroup()
      this.getMember()
    },
    getMember() {
      getMemberList({ groupCode: this.groupCode }).then((res) => {
        let memberList = res.data.result
        let qqList = memberList.map(i => i.accountCode)
        getAts({ qqList }).then(res => {
          Object.keys(res.data.result).forEach(item => {
            let member = memberList.find(member => item == member.accountCode)
            member.atNeko = res.data.result[item]
            member.value = member.accountRemarkOrNickname + '(' + member.accountCode + ')'
          });
        })
        this.memberList = memberList
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
        this.loading = false
      });
    },
    searchMember() {
      getMemberList({ groupCode: this.groupCode, search: this.memberName }).then((res) => {
        this.memberList = res.data.result
      })
    },
    formatDate(row, column, value) {
      return new Date(value).format('yyyy-MM-dd')
    },
    formatTime(row, column, val) {
      val = val / 1000
      var second = val,
        minute = parseInt(second / 60),
        hour = 0,
        day = 0;
      second %= 60;
      if (minute > 60) {
        hour = parseInt(minute / 60);
        minute %= 60;
      }
      if (hour > 24) {
        day = parseInt(hour / 24);
        hour %= 24;
      }
      return (day ? day + '天' : '') + (hour ? hour + '小时' : '') + (minute ? minute + '分' + second + '秒' : second ? second + '秒' : '')
    },
    getPermission(row) {
      switch (row.permission) {
        case "OWNER":
          return '群主'
        case "ADMINISTRATOR":
          return '管理员'
        default:
          break;
      }
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