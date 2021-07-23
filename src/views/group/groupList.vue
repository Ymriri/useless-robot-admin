<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.name" placeholder="群名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getGroup">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table height="400" border :data="groups" v-loading="listLoading" style="width: 100%;">
      <el-table-column type="index" width="60">
      </el-table-column>
      <el-table-column label="头像" width="80">
        <template width="80" slot-scope="scope">
          <div style="width:40px;height:50px;display:flex;align-items:center;">
            <img style="width:40px;height:40px;" :src="scope.row.groupAvatar">
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="groupCode" label="群号" width="120" sortable>
      </el-table-column>
      <el-table-column prop="groupName" label="群名称" min-width="200" sortable>
      </el-table-column>
      <el-table-column prop="permission" label="权限" min-width="100" :formatter="getPermission">
      </el-table-column>
      <el-table-column prop="groupCount" label="人数" min-width="60">
      </el-table-column>
      <el-table-column label="操作" min-width="160">
        <template slot-scope="scope">
          <el-switch style="margin:20px" @change="power" v-model="scope.row.powerSwitch" active-text="开启" inactive-text="关闭">
          </el-switch>
          <el-button size="small" @click="toManager(scope.row.groupCode)">管理群</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">退群</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script>
import util from '../../common/js/util'
//import NProgress from 'nprogress'
import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser, getGroupList } from '../../api/api';

export default {
  data() {
    return {
      filters: {
        name: ''
      },
      groups: [],
      total: 0,
      page: 1,
      listLoading: false,
      sels: [],//列表选中列

      editFormVisible: false,//编辑界面是否显示
      editLoading: false,
      editFormRules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ]
      },
      //编辑界面数据
      editForm: {
        id: 0,
        name: '',
        sex: -1,
        age: 0,
        birth: '',
        addr: ''
      },

      addFormVisible: false,//新增界面是否显示
      addLoading: false,
      addFormRules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ]
      },
      //新增界面数据
      addForm: {
        name: '',
        sex: -1,
        age: 0,
        birth: '',
        addr: ''
      }

    }
  },
  methods: {
    toManager(code) {
      this.$router.push('groupManager/1?code=' + code)
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
    getGroup() {
      this.listLoading = true;
      getGroupList(this.filters).then((res) => {
        console.log(res);
        this.groups = res.data.result
        this.listLoading = false;
      }).catch(e => {
        console.log(e);
      });
    },
    //删除
    handleDel: function (index, row) {
      this.$confirm('确认删除该记录吗?', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        //NProgress.start();
        let para = { id: row.id };
        removeUser(para).then((res) => {
          this.listLoading = false;
          //NProgress.done();
          this.$message({
            message: '删除成功',
            type: 'success'
          });
          this.getGroup();
        });
      }).catch(() => {

      });
    },
    //显示编辑界面
    handleEdit: function (index, row) {
      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    //显示新增界面
    handleAdd: function () {
      this.addFormVisible = true;
      this.addForm = {
        name: '',
        sex: -1,
        age: 0,
        birth: '',
        addr: ''
      };
    },
    //编辑
    editSubmit: function () {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm);
            para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
            editUser(para).then((res) => {
              this.editLoading = false;
              //NProgress.done();
              this.$message({
                message: '提交成功',
                type: 'success'
              });
              this.$refs['editForm'].resetFields();
              this.editFormVisible = false;
              this.getGroup();
            });
          });
        }
      });
    },
    //新增
    addSubmit: function () {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.addLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.addForm);
            para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
            addUser(para).then((res) => {
              this.addLoading = false;
              //NProgress.done();
              this.$message({
                message: '提交成功',
                type: 'success'
              });
              this.$refs['addForm'].resetFields();
              this.addFormVisible = false;
              this.getGroup();
            });
          });
        }
      });
    },
    selsChange: function (sels) {
      this.sels = sels;
    },
    //批量删除
    batchRemove: function () {
      var ids = this.sels.map(item => item.id).toString();
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        //NProgress.start();
        let para = { ids: ids };
        batchRemoveUser(para).then((res) => {
          this.listLoading = false;
          //NProgress.done();
          this.$message({
            message: '删除成功',
            type: 'success'
          });
          this.getGroup();
        });
      }).catch(() => {

      });
    }
  },
  mounted() {
    this.getGroup();
  }
}

</script>

<style scoped>
</style>