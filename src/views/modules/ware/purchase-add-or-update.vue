<template>
  <el-dialog
    :title="!dataForm.purchaseId ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
             label-width="120px">
      <el-form-item label="优先级" prop="priority">
        <el-input v-model="dataForm.priority" placeholder="优先级"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data () {
    return {
      visible: false,
      dataForm: {
        purchaseId: 0,
        assigneeId: '',
        assigneeName: '',
        assigneePhone: '',
        priority: '',
        status: 0,
        wareId: '',
        allAmount: '',
        createTime: '',
        updateTime: ''
      },
      dataRule: {
        assigneeId: [
          {required: true, message: '采购人id不能为空', trigger: 'blur'}
        ],
        assigneeName: [
          {required: true, message: '采购人名不能为空', trigger: 'blur'}
        ],
        assigneePhone: [
          {required: true, message: '采购人联系方式不能为空', trigger: 'blur'}
        ],
        priority: [
          {required: true, message: '优先级不能为空', trigger: 'blur'}
        ],
        status: [
          {required: true, message: '状态不能为空', trigger: 'blur'}
        ],
        wareId: [
          {required: true, message: '仓库id不能为空', trigger: 'blur'}
        ],
        allAmount: [
          {required: true, message: '总金额不能为空', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    init (id) {
      this.dataForm.purchaseId = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.purchaseId) {
          this.$http({
            url: this.$http.adornUrl(`/ware/console/purchase/info`),
            method: 'post',
            params: this.$http.adornParams()
          }).then(({data}) => {
            console.log('查看 -----> 采购单信息 -----> 请求路径: /ware/console/purchase/info')
            console.log('查看 -----> 采购单信息 -----> 返回结果:', data)
            if (data && data.code === 200000) {
              this.dataForm.assigneeId = data.purchase.assigneeId
              this.dataForm.assigneeName = data.purchase.assigneeName
              this.dataForm.assigneePhone = data.purchase.assigneePhone
              this.dataForm.priority = data.purchase.priority
              this.dataForm.status = data.purchase.status
              this.dataForm.wareId = data.purchase.wareId
              this.dataForm.allAmount = data.purchase.allAmount
            }
          })
        }
      })
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(`/ware/console/purchase/${!this.dataForm.purchaseId ? 'save' : 'modify'}`),
            method: 'post',
            data: this.$http.adornData({
              'purchaseId': this.dataForm.purchaseId || undefined,
              'assigneeId': this.dataForm.assigneeId,
              'assigneeName': this.dataForm.assigneeName,
              'assigneePhone': this.dataForm.assigneePhone,
              'priority': this.dataForm.priority,
              'status': this.dataForm.status,
              'wareId': this.dataForm.wareId,
              'allAmount': this.dataForm.allAmount
            })
          }).then(({data}) => {
            if (data && data.code === 200000) {
              console.log('新增或修改 -----> 采购单信息 -----> 请求路径: /ware/console/ware/save or modify')
              console.log('新增或修改 -----> 采购单信息 -----> 返回结果:', data)
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.visible = false
                  this.$emit('refreshDataList')
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        }
      })
    }
  }
}
</script>
