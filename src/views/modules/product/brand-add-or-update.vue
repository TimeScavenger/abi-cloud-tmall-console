<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">

    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="140px">
      <el-form-item label="品牌名" prop="brandName">
        <el-input v-model="dataForm.brandName" placeholder="品牌名"></el-input>
      </el-form-item>
      <el-form-item label="品牌logo" prop="logo">
        <!-- <el-input v-model="dataForm.logo" placeholder="品牌logo地址"></el-input> -->
        <single-upload v-model="dataForm.logo"></single-upload>
      </el-form-item>
      <!-- switch修改激活和不激活的标志，用 0 和 1 表示，默认为 true 和 false -->
      <el-form-item label="显示状态" prop="showed">
        <el-switch
          v-model="dataForm.showed"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0"></el-switch>
      </el-form-item>
      <el-form-item label="检索首字母" prop="firstLetter">
        <el-input v-model="dataForm.firstLetter" placeholder="检索首字母"></el-input>
      </el-form-item>
      <!-- v-model.number只可以接收数字 -->
      <el-form-item label="排序" prop="sort">
        <el-input v-model.number="dataForm.sort" placeholder="排序"></el-input>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>

  </el-dialog>
</template>

<script>
/**
 * 父子组件传递数据
 * 1、子组件给父组件传递数据,事件机制
 * 2、子组件给父组件发送一个事件,携带上数据
 * this.$emit("事件名",携带的数据...)
 */
// 这里可以导入其他文件（比如:组件,工具js,第三方插件js,json文件，图片文件等等）
// 例如: import《组件名称》from'《组件路径》';
import SingleUpload from '@/components/upload/singleUpload'

export default {
  components: {SingleUpload},
  data () {
    return {
      visible: false,
      dataForm: {
        brandCode: 0,
        brandName: '',
        logo: '',
        desc: '',
        showed: 1,
        firstLetter: '',
        sort: 0
      },
      dataRule: {
        brandName: [{required: true, message: '品牌名不能为空', trigger: 'blur'}],
        logo: [{required: true, message: '品牌logo地址不能为空', trigger: 'blur'}],
        showed: [{required: true, message: '显示状态不能为空', trigger: 'blur'}],
        firstLetter: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('首字母必须填写'))
              } else if (!/^[a-zA-Z]$/.test(value)) {
                callback(new Error('首字母必须a-z或者A-Z之间'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        sort: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('排序字段必须填写'))
              } else if (!Number.isInteger(value) || value < 0) {
                callback(new Error('排序必须是一个大于等于0的整数'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 初始化 添加/修改品牌信息
    dataInit (id) {
      this.dataForm.brandCode = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.brandCode) {
          this.$http({
            url: this.$http.adornUrl(`/product/console/brand/info/${this.dataForm.brandCode}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            console.log(`初始化 -----> 添加/修改品牌信息 -----> 请求路径: /product/console/brand/info/${this.dataForm.brandCode}`)
            console.log('初始化 -----> 添加/修改品牌信息 -----> 返回结果:', data)
            if (data && data.code === 200000) {
              this.dataForm.brandName = data.data.brandName
              this.dataForm.logo = data.data.logo
              this.dataForm.desc = data.data.desc
              this.dataForm.showed = data.data.showed
              this.dataForm.firstLetter = data.data.firstLetter
              this.dataForm.sort = data.data.sort
            }
          })
        }
      })
    },
    // 表单提交 添加/修改品牌信息
    dataFormSubmit () {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(`/product/console/brand/${!this.dataForm.brandCode ? 'save' : 'modify'}`),
            method: 'post',
            data: this.$http.adornData({
              brandCode: this.dataForm.brandCode || undefined,
              brandName: this.dataForm.brandName,
              logo: this.dataForm.logo,
              desc: this.dataForm.desc,
              showed: this.dataForm.showed,
              firstLetter: this.dataForm.firstLetter,
              sort: this.dataForm.sort
            })
          }).then(({data}) => {
            console.log('表单提交 -----> 添加/修改品牌信息 -----> 请求路径: /product/console/brand/save /product/console/brand/modify')
            console.log('表单提交 -----> 添加/修改品牌信息 -----> 返回结果:', data)
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
