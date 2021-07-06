<template>
  <section>
    <div>
      <el-page-header @back="goBack" :content="groupInfo.groupName||'群信息'" style="height:50px;line-height:50px">
      </el-page-header>
      <el-container>
        <el-container>
          <el-aside width="20%" :style="'background:'+backgroundColor">
            <el-skeleton style="width: 100%" :loading="loading" animated>
              <template slot="template">
                <el-skeleton-item variant="image" style="width: 200px;;" />
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
                <el-col :span="24" class="toolbar" style="padding: 0px;margin: 0px">
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
                  <el-table-column prop="accountNickname" label="成员" min-width="100">
                  </el-table-column>
                  <el-table-column prop="accountRemarkOrNickname" label="群昵称" min-width="100">
                  </el-table-column>
                  <el-table-column prop="accountCode" label="QQ号" min-width="100">
                  </el-table-column>
                  <!-- <el-table-column prop="address" label="性别" min-width="50">
                  </el-table-column> -->
                  <el-table-column prop="joinTime" label="入群时间" :formatter="formatDate">
                  </el-table-column>
                  <el-table-column prop="lastSpeakTime" label="最后发言" :formatter="formatDate">
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="设置" name="setting">角色管理</el-tab-pane>
            </el-tabs>
          </el-main>
        </el-container>
      </el-container>
    </div>
  </section>
</template>

<script>
import { getMemberList, getGroupInfo } from '../../api/api';

export default {
  data() {
    return {
      code: '',
      groupInfo: {},
      memberList: [],
      loading: true,
      activeName: 'info',
      backgroundColor: '',
      backgroundColor2: '',
      memberName: '',
    }
  },
  mounted() {
    this.code = this.$route.query.code
    this.getInfo()
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },
    goBack() {
      this.$router.go(-1)
    },
    getInfo() {
      getGroupInfo({ code: this.code }).then((res) => {
        this.groupInfo = res.data.result
        this.groupInfo.groupAvatar = this.groupInfo.groupAvatar.replace('https://p.qlogo.cn', 'http://localhost:8090/headimage')
        this.getBase64(this.groupInfo.groupAvatar)
        this.loading = false
      });
      getMemberList({ code: this.code }).then((res) => {
        console.log(res.data);
        this.memberList = res.data.result
      })
    },
    searchMember() {
      getMemberList({ code: this.code, search: this.memberName }).then((res) => {
        console.log(res.data);
        this.memberList = res.data.result
      })
    },
    formatDate(row, column, value) {
      return new Date(value).format('yyyy-MM-dd')
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
          //====为了在页面显示图片，可以删除====
          var img = document.createElement("img");
          img.onload = function (e) {
            window.URL.revokeObjectURL(img.src); // 清除释放
          };
          let src = window.URL.createObjectURL(blob);
          img.src = src
          //document.getElementById("container1").appendChild(img);
          //====为了在页面显示图片，可以删除====

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