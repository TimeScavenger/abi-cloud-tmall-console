<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'"
             :close-on-click-modal="false"
             :visible.sync="visible"
             @closed="dialogClose">

    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="120px">
      <!-- @keyup.enter.native="dataFormSubmit()" -->
      <el-form-item label="属性名" prop="attributeName">
        <el-input v-model="dataForm.attributeName" placeholder="属性名"></el-input>
      </el-form-item>
      <el-form-item label="属性类型" prop="type">
        <el-select v-model="dataForm.type" placeholder="请选择">
          <el-option label="规格参数" :value="0"></el-option>
          <el-option label="销售属性" :value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="值类型" prop="valueType">
        <el-switch v-model="dataForm.valueType" active-text="允许多个值" inactive-text="只能单个值" active-color="#13ce66"
                   inactive-color="#ff4949" :inactive-value="0" :active-value="1"></el-switch>
      </el-form-item>
      <el-form-item label="可选值" prop="valueList">
        <!-- <el-input v-model="dataForm.valueList"></el-input> -->
        <el-select v-model="dataForm.valueList" multiple filterable allow-create placeholder="请输入内容"></el-select>
      </el-form-item>
      <el-form-item label="属性图标" prop="icon">
        <el-input v-model="dataForm.icon" placeholder="属性图标"></el-input>
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryId">
        <category-cascader :categoryPath.sync="categoryPath"></category-cascader>
      </el-form-item>
      <el-form-item label="所属分组" prop="groupId" v-if="type === 0">
        <el-select ref="groupSelect" v-model="dataForm.groupId" placeholder="请选择">
          <el-option v-for="item in attrGroups" :key="item.groupId" :label="item.groupName"
                     :value="item.groupId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="可检索" prop="searchType" v-if="type === 0">
        <el-switch
          v-model="dataForm.searchType"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0"></el-switch>
      </el-form-item>
      <el-form-item label="快速展示" prop="quickShow" v-if="type === 0">
        <el-switch
          v-model="dataForm.quickShow"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0"></el-switch>
      </el-form-item>
      <el-form-item label="启用状态" prop="enabled">
        <el-switch
          v-model="dataForm.enabled"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0"></el-switch>
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
import CategoryCascader from '../common/category-cascader'

export default {
  data () {
    return {
      visible: false,
      dataForm: {
        attributeId: 0,
        attributeName: '',
        searchType: 0,
        valueType: 1,
        icon: '',
        valueList: '',
        type: 0,
        enabled: 0,
        categoryId: 0,
        groupId: '',
        quickShow: 0
      },
      categoryPath: [],
      attrGroups: [],
      dataRule: {
        attributeName: [{required: true, message: '属性名不能为空', trigger: 'blur'}],
        searchType: [{required: true, message: '是否需要检索不能为空', trigger: 'blur'}],
        valueType: [{required: true, message: '值类型不能为空', trigger: 'blur'}],
        icon: [{required: true, message: '属性图标不能为空', trigger: 'blur'}],
        type: [{required: true, message: '属性类型不能为空', trigger: 'blur'}],
        enabled: [{required: true, message: '启用状态不能为空', trigger: 'blur'}],
        categoryId: [{required: true, message: '需要选择正确的三级分类数据', trigger: 'blur'}],
        quickShow: [{required: true, message: '快速展示不能为空', trigger: 'blur'}]
      }
    }
  },
  props: {
    type: {
      type: Number,
      default: 0
    }
  },
  watch: {
    categoryPath (path) {
      // 监听到路径变化需要查出这个三级分类的分组信息
      this.attrGroups = []
      this.dataForm.groupId = ''
      this.dataForm.categoryId = path[path.length - 1]
      if (path && path.length === 3) {
        this.$http({
          url: this.$http.adornUrl(`/product/console/group/page/`),
          method: 'post',
          data: this.$http.adornData({
            page: 1,
            size: 10000000,
            categoryId: this.dataForm.categoryId
          })
        }).then(({data}) => {
          console.log('监听查询 -----> 三级分类路径 -----> 提交路径: /product/console/group/page/')
          console.log('监听查询 -----> 三级分类路径 -----> 返回数据:', data)
          if (data && data.code === 200000) {
            this.attrGroups = data.data.records
          } else {
            this.$message.error(data.msg)
          }
        })
      } else if (path.length === 0) {
        this.dataForm.categoryId = ''
      } else {
        this.$message.error('请选择正确的分类')
        this.dataForm.categoryId = ''
      }
    }
  },
  components: {CategoryCascader},
  methods: {
    // 初始化 添加/修改属性信息
    dataInit (id) {
      this.dataForm.attributeId = id || 0
      this.dataForm.type = this.type
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.attributeId) {
          this.$http({
            url: this.$http.adornUrl(`/product/console/attribute/find/${this.dataForm.attributeId}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            console.log(`初始化 -----> 添加/修改属性信息 -----> 请求路径: /product/console/attribute/find/${this.dataForm.attributeId}`)
            console.log('初始化 -----> 添加/修改属性信息 -----> 返回结果:', data)
            if (data && data.code === 200000) {
              this.dataForm.attributeName = data.data.attributeName
              this.dataForm.searchType = data.data.searchType
              this.dataForm.valueType = data.data.valueType
              this.dataForm.icon = data.data.icon
              this.dataForm.valueList = data.data.valueList.split(';')
              this.dataForm.type = data.data.type
              this.dataForm.enabled = data.data.enabled
              this.dataForm.categoryId = data.data.categoryId
              this.dataForm.quickShow = data.data.quickShow
              this.categoryPath = data.data.categoryPath
              this.$nextTick(() => {
                this.dataForm.groupId = data.data.groupId
              })
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
            url: this.$http.adornUrl(`/product/console/attribute/${!this.dataForm.attributeId ? 'save' : 'modify'}`),
            method: 'post',
            data: this.$http.adornData({
              attributeId: this.dataForm.attributeId || undefined,
              attributeName: this.dataForm.attributeName,
              searchType: this.dataForm.searchType,
              valueType: this.dataForm.valueType,
              icon: this.dataForm.icon,
              valueList: this.dataForm.valueList.join(';'),
              type: this.dataForm.type,
              enabled: this.dataForm.enabled,
              categoryId: this.dataForm.categoryId,
              groupId: this.dataForm.groupId,
              quickShow: this.dataForm.quickShow
            })
          }).then(({data}) => {
            console.log('表单提交 -----> 添加/修改属性信息 -----> 请求路径: /product/console/attribute/save /product/console/attribute/modify')
            console.log('表单提交 -----> 添加/修改属性信息 -----> 返回结果:', data)
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
    },
    // 关闭 弹出层
    dialogClose () {
      this.categoryPath = []
    }
  }
}
</script>
