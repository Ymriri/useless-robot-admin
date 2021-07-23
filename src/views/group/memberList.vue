<template>
  <div>
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
  </div>
</template>
<script>
import { getMemberList, getAts } from '../../api/api';
export default {
  props: {
    groupInfo: {
      type: Object,
      default: {}
    },
  },
  mounted() {
    console.log(this.groupInfo);
    this.getMember()
  },
  data() {
    return {
      memberList: [],
      memberName: '',
    }
  },
  methods: {

    getMember() {
      getMemberList({ groupCode: this.groupInfo.groupCode }).then((res) => {
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
        this.$emit('updateMember', this.memberList)
      })
    },
    searchMember() {
      getMemberList({ groupCode: this.groupInfo.groupCode, search: this.memberName }).then((res) => {
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
  }
}
</script>