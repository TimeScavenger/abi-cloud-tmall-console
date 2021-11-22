<template>
  <el-dialog :title="!dataForm.purchaseCode ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
             label-width="120px">
      <el-form-item label="采购单名" prop="purchaseName">
        <el-input v-model="dataForm.purchaseName" placeholder="采购单名"></el-input>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-input v-model="dataForm.priority" placeholder="优先级"></el-input>
      </el-form-item>
      <el-form-item label="仓库" prop="wareCode">
        <el-select v-model="dataForm.wareCode" placeholder="请选择仓库" clearable>
          <el-option :label="w.wareName" :value="w.wareCode" v-for="w in wareList" :key="w.wareCode"></el-option>
        </el-select>
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
      wareList: [],
      dataForm: {
        purchaseCode: 0,
        purchaseName: '',
        assigneeCode: '',
        assigneeName: '',
        assigneePhone: '',
        priority: '',
        status: 0,
        wareCode: '',
        allAmount: '',
        createTime: '',
        updateTime: ''
      },
      dataRule: {
        purchaseName: [{required: true, message: '采购单名不能为空', trigger: 'blur'}],
        assigneeCode: [{required: true, message: '采购人Code不能为空', trigger: 'blur'}],
        assigneeName: [{required: true, message: '采购人名不能为空', trigger: 'blur'}],
        assigneePhone: [{required: true, message: '采购人联系方式不能为空', trigger: 'blur'}],
        priority: [{required: true, message: '优先级不能为空', trigger: 'blur'}],
        status: [{required: true, message: '状态不能为空', trigger: 'blur'}],
        wareCode: [{required: true, message: '仓库Code不能为空', trigger: 'blur'}],
        allAmount: [{required: true, message: '总金额不能为空', trigger: 'blur'}]
      }
    }
  },
  created () {
    this.getWares()
  },
  methods: {
    getWares () {
      this.$http({
        url: this.$http.adornUrl('/ware/console/ware/list'),
        method: 'post',
        data: this.$http.adornData({}, false)
      }).then(({data}) => {
        console.log('删除 -----> 品牌信息 -----> 请求路径: /ware/console/ware/list')
        console.log('删除 -----> 品牌信息 -----> 返回结果:', data)
        if (data && data.code === 200000) {
          this.wareList = data.data
        } else {
          this.wareList = []
        }
      })
    },
    init (purchaseCode) {
      this.dataForm.purchaseCode = purchaseCode || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.purchaseCode) {
          this.$http({
            url: this.$http.adornUrl(`/ware/console/purchase/info`),
            method: 'post',
            data: this.$http.adornData({
              'purchaseCode': this.dataForm.purchaseCode
            })
          }).then(({data}) => {
            console.log('查看 -----> 采购单信息 -----> 请求路径: /ware/console/purchase/info')
            console.log('查看 -----> 采购单信息 -----> 返回结果:', data)
            if (data && data.code === 200000) {
              this.dataForm.purchaseName = data.data.purchaseName
              this.dataForm.assigneeCode = data.data.assigneeCode
              this.dataForm.assigneeName = data.data.assigneeName
              this.dataForm.assigneePhone = data.data.assigneePhone
              this.dataForm.priority = data.data.priority
              this.dataForm.status = data.data.status
              this.dataForm.wareCode = data.data.wareCode
              this.dataForm.allAmount = data.data.allAmount
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
            url: this.$http.adornUrl(`/ware/console/purchase/${!this.dataForm.purchaseCode ? 'save' : 'modify'}`),
            method: 'post',
            data: this.$http.adornData({
              'purchaseCode': this.dataForm.purchaseCode || undefined,
              'purchaseName': this.dataForm.purchaseName,
              'assigneeCode': this.dataForm.assigneeCode,
              'assigneeName': this.dataForm.assigneeName,
              'assigneePhone': this.dataForm.assigneePhone,
              'priority': this.dataForm.priority,
              'status': this.dataForm.status,
              'wareCode': this.dataForm.wareCode,
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
