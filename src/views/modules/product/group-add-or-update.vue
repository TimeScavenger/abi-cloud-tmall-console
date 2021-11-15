<template>

  <el-dialog
    :title="!dataForm.groupCode ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @closed="dialogClose">

    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmit()"
      label-width="120px">

      <el-form-item label="组名" prop="groupName">
        <el-input v-model="dataForm.groupName" placeholder="组名"></el-input>
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input v-model.number="dataForm.sort" placeholder="排序"></el-input>
      </el-form-item>

      <el-form-item label="描述" prop="desc">
        <el-input v-model="dataForm.desc" placeholder="描述"></el-input>
      </el-form-item>

      <el-form-item label="组图标" prop="icon">
        <el-input v-model="dataForm.icon" placeholder="组图标"></el-input>
      </el-form-item>

      <el-form-item label="所属分类" prop="categoryCode">
        <!-- <el-input v-model="dataForm.categoryCode" placeholder="所属分类id"></el-input> @change="handleChange" -->
        <!-- <el-cascader filterable placeholder="试试搜索：手机" v-model="categoryPath" :options="categorys"  :props="props"></el-cascader> -->
        <!-- :categoryPath="categoryPath"自定义绑定的属性，可以给子组件传值 -->
        <category-cascader :categoryPath.sync="categoryPath"></category-cascader>
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
  components: {CategoryCascader},
  data () {
    return {
      props: {
        value: 'catId',
        label: 'name',
        children: 'children'
      },
      visible: false,
      categorys: [],
      categoryTree: {
        level: 4
      },
      categoryPath: [],
      dataForm: {
        groupCode: 0,
        groupName: '',
        sort: '',
        desc: '',
        icon: '',
        categoryCode: 0
      },
      dataRule: {
        groupName: [{required: true, message: '组名不能为空', trigger: 'blur'}],
        desc: [{required: true, message: '描述不能为空', trigger: 'blur'}],
        icon: [{required: true, message: '组图标不能为空', trigger: 'blur'}],
        categoryCode: [{required: true, message: '所属分类id不能为空', trigger: 'blur'}],
        sort: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('排序字段必须填写'))
              } else if (!Number.isInteger(value) || value < 0) {
                callback(new Error('排序必须是一个大于等于0的整数'))
              } else if (value > 1000) {
                callback(new Error('排序必须是一个大于等于0小于1000的整数'))
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
    dialogClose () {
      this.categoryPath = []
    },
    // 查询分类级联关系
    getCategorys () {
      this.$http({
        url: this.$http.adornUrl('/product/console/category/list/tree'),
        method: 'post',
        data: this.$http.adornData(this.categoryTree, false)
      }).then(({data}) => {
        console.log('查询 -----> 分类列表 -----> 返回数据:', data)
        this.categorys = data.data
      })
    },
    // 初始化 添加/修改分组信息
    dataInit (id) {
      this.dataForm.groupCode = id || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.groupCode) {
          this.$http({
            url: this.$http.adornUrl(`/product/console/group/find/${this.dataForm.groupCode}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then(({data}) => {
            console.log(`初始化 -----> 添加/修改分组信息 -----> 请求路径: /product/console/group/find/${this.dataForm.groupCode}`)
            console.log('初始化 -----> 添加/修改分组信息 -----> 返回结果:', data)
            if (data && data.code === 200000) {
              this.dataForm.groupName = data.data.groupName
              this.dataForm.sort = data.data.sort
              this.dataForm.desc = data.data.desc
              this.dataForm.icon = data.data.icon
              this.dataForm.categoryCode = data.data.categoryCode
              // 查出categoryCode的完整路径
              this.categoryPath = data.data.categoryPath
            }
            console.log(this.dataForm)
          })
        }
      })
    },
    // 表单提交 添加/修改分组信息
    dataFormSubmit () {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(`/product/console/group/${!this.dataForm.groupCode ? 'save' : 'modify'}`),
            method: 'post',
            data: this.$http.adornData({
              groupCode: this.dataForm.groupCode || undefined,
              groupName: this.dataForm.groupName,
              sort: this.dataForm.sort,
              desc: this.dataForm.desc,
              icon: this.dataForm.icon,
              categoryCode: this.categoryPath[this.categoryPath.length - 1]
            })
          }).then(({data}) => {
            console.log('表单提交 -----> 添加/修改分组信息 -----> 请求路径: /product/console/group/save /product/console/group/modify')
            console.log('表单提交 -----> 添加/修改分组信息 -----> 返回数据:', data)
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
  },
  // 生命周期-创建之前
  beforeCreate () {
  },
  // 生命周期-创建完成（可以访问当前this实例）
  created () {
    this.getCategorys()
  },
  // 生命周期-挂载之前
  beforeMount () {
  },
  // 生命周期-挂载完成（可以访问DOM元素）
  mounted () {
  },
  // 生命周期-更新之前
  beforeUpdate () {
  },
  // 生命周期-更新之后
  updated () {
  },
  // 生命周期-销毁之前
  beforeDestroy () {
  },
  // 生命周期-销毁完成
  destroyed () {
  },
  // 如果页面有keep-alive缓存功能，这个函数会触发
  activated () {
  }
}
</script>
