<template>
  <el-dialog :title="!dataForm.wareCode ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
             label-width="120px">
      <el-form-item label="仓库名" prop="wareName">
        <el-input v-model="dataForm.wareName" placeholder="仓库名"></el-input>
      </el-form-item>
      <el-form-item label="仓库地址" prop="wareAddress">
        <el-input v-model="dataForm.wareAddress" placeholder="仓库地址"></el-input>
      </el-form-item>
      <el-form-item label="区域编码" prop="areaCode">
        <el-input v-model="dataForm.areaCode" placeholder="区域编码"></el-input>
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
        wareCode: 0,
        wareName: '',
        wareAddress: '',
        areaCode: ''
      },
      dataRule: {
        wareName: [
          {required: true, message: '仓库名不能为空', trigger: 'blur'}
        ],
        wareAddress: [
          {required: true, message: '仓库地址不能为空', trigger: 'blur'}
        ],
        areaCode: [
          {required: true, message: '区域编码不能为空', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    init (wareCode) {
      this.dataForm.wareCode = wareCode || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.wareCode) {
          this.$http({
            url: this.$http.adornUrl(`/ware/console/ware/info`),
            method: 'post',
            data: this.$http.adornData({
              'wareCode': this.dataForm.wareCode
            })
          }).then(({data}) => {
            console.log('查看 -----> 仓库信息 -----> 请求路径: /ware/console/ware/info')
            console.log('查看 -----> 仓库信息 -----> 返回结果:', data)
            if (data && data.code === 200000) {
              this.dataForm.wareName = data.data.wareName
              this.dataForm.wareAddress = data.data.wareAddress
              this.dataForm.areaCode = data.data.areaCode
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
            url: this.$http.adornUrl(`/ware/console/ware/${!this.dataForm.wareCode ? 'save' : 'modify'}`),
            method: 'post',
            data: this.$http.adornData({
              'wareCode': this.dataForm.wareCode || undefined,
              'wareName': this.dataForm.wareName,
              'wareAddress': this.dataForm.wareAddress,
              'areaCode': this.dataForm.areaCode
            })
          }).then(({data}) => {
            console.log('新增或修改 -----> 仓库信息 -----> 请求路径: /ware/console/ware/save or modify')
            console.log('新增或修改 -----> 仓库信息 -----> 返回结果:', data)
            if (data && data.code === 200000) {
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
