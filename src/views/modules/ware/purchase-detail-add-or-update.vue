<template>
  <el-dialog :title="!dataForm.purchaseDetailCode ? '新增' : '修改'" :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()"
             label-width="120px">
      <el-form-item label="商品Code" prop="skuCode">
        <el-input v-model="dataForm.skuCode" placeholder="采购商品Code"></el-input>
      </el-form-item>
      <el-form-item label="采购数量" prop="skuNum">
        <el-input v-model="dataForm.skuNum" placeholder="采购数量"></el-input>
      </el-form-item>
      <el-form-item label="仓库" prop="wareCode">
        <el-select v-model="dataForm.wareCode" placeholder="请选择仓库" clearable>
          <el-option :label="w.wareName" :value="w.wareCode" v-for="w in wareList" :key="w.wareCode"></el-option>
        </el-select>
      </el-form-item>
      <!-- [0新建，1已分配，2正在采购，3已完成，4采购失败] -->
      <!-- <el-form-item label="状态" prop="status">
        <el-select v-model="dataForm.status" placeholder="请选择状态" clearable>
          <el-option label="新建" :value="0"></el-option>
          <el-option label="已分配" :value="1"></el-option>
          <el-option label="正在采购" :value="2"></el-option>
          <el-option label="已完成" :value="3"></el-option>
          <el-option label="采购失败" :value="4"></el-option>
        </el-select>
      </el-form-item>-->
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
        purchaseDetailCode: 0,
        purchaseCode: '',
        skuCode: '',
        skuNum: '',
        skuPrice: '',
        wareCode: '',
        status: 0
      },
      dataRule: {
        skuCode: [{required: true, message: '采购商品Code不能为空', trigger: 'blur'}],
        skuNum: [{required: true, message: '采购数量不能为空', trigger: 'blur'}],
        wareCode: [{required: true, message: '仓库Code不能为空', trigger: 'blur'}]
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
    init (purchaseDetailCode) {
      this.dataForm.purchaseDetailCode = purchaseDetailCode || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.purchaseDetailCode) {
          this.$http({
            url: this.$http.adornUrl(`/ware/console/purchase-detail/info`),
            method: 'post',
            data: this.$http.adornData({
              purchaseDetailCode: this.dataForm.purchaseDetailCode
            })
          }).then(({data}) => {
            console.log('查询 -----> 采购单 -----> 请求路径: /ware/console/purchase-detail/info')
            console.log('查询 -----> 采购单 -----> 返回结果:', data)
            if (data && data.code === 200000) {
              this.dataForm.purchaseCode = data.data.purchaseCode
              this.dataForm.skuCode = data.data.skuCode
              this.dataForm.skuNum = data.data.skuNum
              this.dataForm.skuPrice = data.data.skuPrice
              this.dataForm.wareCode = data.data.wareCode
              this.dataForm.status = data.data.status
            }
          })
        }
      })
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(
              `/ware/console/purchase-detail/${!this.dataForm.purchaseDetailCode ? 'save' : 'modify'}`
            ),
            method: 'post',
            data: this.$http.adornData({
              purchaseDetailCode: this.dataForm.purchaseDetailCode || undefined,
              purchaseCode: this.dataForm.purchaseCode,
              skuCode: this.dataForm.skuCode,
              skuNum: this.dataForm.skuNum,
              skuPrice: this.dataForm.skuPrice,
              wareCode: this.dataForm.wareCode,
              status: this.dataForm.status
            })
          }).then(({data}) => {
            console.log('新增/修改 -----> 采购项 -----> 请求路径: /ware/console/purchase-detail/save or modify')
            console.log('新增/修改 -----> 采购项 -----> 返回结果:', data)
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
