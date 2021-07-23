<template>
  <div>
    <el-col :span="24" style="margin:5px">
      <el-button icon="el-icon-circle-plus" type="primary" @click="messageDialogVisible = !messageDialogVisible" size="mini">添加</el-button>
      <el-popconfirm title="确定删除所选任务吗？" @confirm="deleteMessage">
        <el-button slot="reference" icon="el-icon-remove" type="danger" size="mini" :disabled="messageMultipleSelection.length==0">删除</el-button>
      </el-popconfirm>
    </el-col>
    <el-dialog title="添加定时任务" :visible.sync="messageDialogVisible">
      <el-form :model="form" :rules="rules" ref="messageForm">
        <el-form-item label="corn" prop="message" :label-width="formLabelWidth">
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
    <el-table ref="multipleTable" :data="groupInfo.timeTask" tooltip-effect="dark" style="width: 100%" @selection-change="handleMessageSelectionChange">
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
  </div>
</template>
<script>
import { addMessage, removeMessages } from '../../api/api';
export default {
  props: {
    groupInfo: {
      type: Object,
      default: {}
    },
    memberList: {
      type: Array,
      default: []
    }
  },
  mounted() {
    console.log(this.groupInfo);
    console.log(this.memberList);
  },
  data() {
    return {
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
      dynamicObj: {},
    }
  },
  methods: {

    deleteMessage() {
      console.log(this.messageMultipleSelection);
      removeMessages({
        groupCode: this.groupInfo.groupCode,
        messageList: this.messageMultipleSelection.map(i => i.bakMessage || i.message)
      }).then(res => {
        if (res.data.code == 0) {
          this.$message({
            message: '删除成功',
            type: 'success'
          });
          this.$emit('updateGroup')
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
            groupCode: this.groupInfo.groupCode
          }, this.form)).then(res => {
            if (res.data.code == 0) {
              this.$message({
                message: '添加成功',
                type: 'success'
              });
              this.$emit('updateGroup')
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
  }
}
</script>