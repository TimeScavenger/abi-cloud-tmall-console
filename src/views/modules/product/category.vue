<template>
  <div>
    <!-- 顶部按钮 -->
    <el-switch v-model="draggable" active-text="开启拖拽" inactive-text="关闭拖拽"></el-switch>
    <el-button v-if="draggable" @click="batchModifySort">批量保存</el-button>
    <el-button type="danger" @click="deleteBatchHandle">批量删除</el-button>

    <!-- 中间树形结构 -->
    <el-tree
      :data="menus"
      :props="defaultProps"
      :expand-on-click-node="false"
      show-checkbox
      node-key="categoryId"
      :default-expanded-keys="expandedKey"
      :draggable="draggable"
      :allow-drop="allowDrop"
      @node-drop="handleNodeDrop"
      ref="menuTree">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
          <el-button
            v-if="node.level <=2"
            type="text"
            size="mini"
            @click="() => dataAddInit(data)">Append</el-button>
          <el-button
            type="text"
            size="mini"
            @click="dataUpdateInit(data)">Modify</el-button>
          <el-button
            v-if="node.childNodes.length===0"
            type="text"
            size="mini"
            @click="() => deleteHandle(node, data)">Delete</el-button>
        </span>
      </span>
    </el-tree>

    <!-- 中间树形结构 -->
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      width="30%"
      :close-on-click-modal="false">
      <el-form :model="category">
        <el-form-item label="分类名称">
          <el-input v-model="category.categoryName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="category.icon" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="计量单位">
          <el-input v-model="category.productUnit" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dataFormSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  // import引入的组件需要注入到对象中才能使用
  components: {},
  props: {},
  data () {
    return {
      categoryTree: {
        level: 4
      },
      title: '',
      dialogVisible: false,
      dialogType: '', // save,update
      category: {
        categoryId: null,
        categoryName: '',
        parentId: 0,
        level: 0,
        sort: 0,
        icon: '',
        productUnit: '',
        productCount: 0
      },
      categorySub: {
        categoryIds: []
      },

      pCid: [],
      draggable: false,
      updateNodes: [],
      maxLevel: 0,
      menus: [],
      expandedKey: [],
      defaultProps: {
        children: 'children',
        label: 'categoryName'
      }
    }
  },
  // 计算属性 类似于data概念
  computed: {},
  // 监控data中的参数变化
  watch: {},
  // 方法集合
  methods: {
    // 查询 分类树形列表
    getDataList () {
      this.$http({
        url: this.$http.adornUrl('/product/console/category/list/tree'),
        method: 'post',
        data: this.$http.adornData(this.categoryTree, false)
      }).then(({data}) => {
        console.log('查询 -----> 分类树形列表 -----> 请求路径: /product/console/category/list/tree')
        console.log('查询 -----> 分类树形列表 -----> 返回结果:', data)
        this.menus = data.data
      })
    },
    // 初始化 添加分类信息
    dataAddInit (data) {
      this.dialogType = 'save'
      this.title = '添加分类信息'
      this.dialogVisible = true
      this.category.categoryId = null
      this.category.categoryName = ''
      this.category.parentId = data.categoryId
      this.category.level = data.level * 1 + 1
      this.category.sort = 0
      this.category.icon = ''
      this.category.productUnit = ''
      this.category.productCount = ''
      console.log('初始化 -----> 添加分类信息 -----> 返回结果:', this.category)
    },
    // 表单提交 添加分类信息
    dataAddFormSubmit () {
      this.$http({
        url: this.$http.adornUrl('/product/console/category/save'),
        method: 'post',
        data: this.$http.adornData(this.category, false)
      }).then(({data}) => {
        console.log('添加 -----> 分类信息 -----> 请求路径: /product/console/category/save')
        console.log('添加 -----> 分类信息 -----> 返回结果:', data)
        this.$message({
          message: '添加分类信息成功',
          type: 'success'
        })
        // 关闭对话框
        this.dialogVisible = false
        // 刷新出新的分类
        this.getDataList()
        // 设置需要默认展开的分类
        this.expandedKey = [this.category.parentId]
      })
    },
    // 初始化 修改分类信息
    dataUpdateInit (data) {
      this.dialogType = 'update'
      this.title = '修改分类信息'
      this.dialogVisible = true
      // 发送请求获取当前节点最新的参数
      this.$http({
        url: this.$http.adornUrl(`/product/console/category/find/${data.categoryId}`),
        method: 'get'
      }).then(({data}) => {
        console.log(`初始化 -----> 修改分类信息 -----> 请求路径: /product/console/category/find/${data.categoryId}`)
        console.log('初始化 -----> 修改分类信息 -----> 返回结果:', data)
        this.category.categoryId = data.data.categoryId
        this.category.categoryName = data.data.categoryName
        this.category.parentId = data.data.parentId
        this.category.level = data.data.level
        this.category.icon = data.data.icon
        this.category.sort = data.data.sort
        this.category.productUnit = data.data.productUnit
        this.category.productCount = data.data.productCount
      })
    },
    // 表单提交 修改分类信息
    dataUpdateFormSubmit () {
      this.$http({
        url: this.$http.adornUrl('/product/console/category/modify'),
        method: 'post',
        data: this.$http.adornData(this.category, false)
      }).then(({data}) => {
        console.log('修改 -----> 分类信息 -----> 请求路径: /product/console/category/modify')
        console.log('修改 -----> 分类信息 -----> 返回结果:', data)
        this.$message({
          message: '修改分类信息成功',
          type: 'success'
        })
        // 关闭对话框
        this.dialogVisible = false
        // 刷新出新的分类
        this.getDataList()
        // 设置需要默认展开的分类
        this.expandedKey = [this.category.parentId]
      })
    },
    // 表单提交 添加/修改分类信息
    dataFormSubmit () {
      if (this.dialogType === 'save') {
        this.dataAddFormSubmit()
      }
      if (this.dialogType === 'update') {
        this.dataUpdateFormSubmit()
      }
    },
    // 删除 分类信息
    deleteHandle (node, data) {
      this.categorySub.categoryIds = [data.categoryId]
      this.$confirm(`是否删除【${data.categoryName}】分类?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/product/console/category/remove'),
          method: 'post',
          data: this.$http.adornData(this.categorySub, false)
        }).then(({data}) => {
          console.log('删除 -----> 分类信息 -----> 请求路径: /product/console/category/remove')
          console.log('删除 -----> 分类信息 -----> 返回结果:', data)
          this.$message({
            message: '分类删除成功',
            type: 'success'
          })
          // 刷新出新的分类
          this.getDataList()
          // 设置需要默认展开的分类
          this.expandedKey = [node.parent.data.categoryId]
        })
      }).catch(() => {
      })
    },
    // 批量删除 分类信息
    deleteBatchHandle () {
      let checkedNodes = this.$refs.menuTree.getCheckedNodes()
      for (let i = 0; i < checkedNodes.length; i++) {
        this.categorySub.categoryIds.push(checkedNodes[i].categoryId)
      }
      this.$confirm(`是否批量删除【${this.categorySub.categoryIds}】分类?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/product/console/category/remove'),
          method: 'post',
          data: this.$http.adornData(this.categorySub, false)
        }).then(({data}) => {
          console.log('批量删除 -----> 分类信息 -----> 请求路径: /product/console/category/remove')
          console.log('批量删除 -----> 分类信息 -----> 返回结果:', data)
          this.$message({
            message: '分类批量删除成功',
            type: 'success'
          })
          this.getDataList()
        })
      }).catch(() => {
      })
    },
    // ========================================== 以下命名未统一 ====================
    // 批量修改 分类信息排序
    batchModifySort () {
      this.$http({
        url: this.$http.adornUrl('/product/console/category/modify/sort'),
        method: 'post',
        data: this.$http.adornData(this.updateNodes, false)
      }).then(({data}) => {
        console.log('批量修改 -----> 分类信息排序 -----> 请求路径: /product/console/category/modify/sort')
        console.log('批量修改 -----> 分类信息排序 -----> 返回结果:', data)
        this.$message({
          message: '分类顺序修改成功',
          type: 'success'
        })
        // 刷新出新的分类
        this.getDataList()
        // 设置需要默认展开的分类
        this.expandedKey = this.pCid
        this.updateNodes = []
        this.maxLevel = 0
        // this.pCid = 0;
      })
    },
    // 节点更新
    handleNodeDrop (draggingNode, dropNode, dropType, ev) {
      console.log('handleNodeDrop: ', draggingNode, dropNode, dropType)
      // 1、当前节点最新的父节点id
      let pCid = 0
      let siblings = null
      if (dropType === 'before' || dropType === 'after') {
        pCid = dropNode.parent.data.categoryId === undefined ? 0 : dropNode.parent.data.categoryId
        siblings = dropNode.parent.childNodes
      } else {
        pCid = dropNode.data.categoryId
        siblings = dropNode.childNodes
      }
      this.pCid.push(pCid)
      // 2、当前拖拽节点的最新顺序，
      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].data.categoryId === draggingNode.data.categoryId) {
          // 如果遍历的是当前正在拖拽的节点
          let level = draggingNode.level
          if (siblings[i].level !== draggingNode.level) {
            // 当前节点的层级发生变化
            level = siblings[i].level
            // 修改他子节点的层级
            this.updateChildNodeLevel(siblings[i])
          }
          this.updateNodes.push({
            categoryId: siblings[i].data.categoryId,
            sort: i,
            parentId: pCid,
            level: level
          })
        } else {
          this.updateNodes.push({categoryId: siblings[i].data.categoryId, sort: i})
        }
      }
      // 3、当前拖拽节点的最新层级
      console.log('updateNodes', this.updateNodes)
    },
    // 递归更新子节点的层级
    updateChildNodeLevel (node) {
      if (node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          var cNode = node.childNodes[i].data
          this.updateNodes.push({
            categoryId: cNode.categoryId,
            level: node.childNodes[i].level
          })
          this.updateChildNodeLevel(node.childNodes[i])
        }
      }
    },
    // 允许被拖动的节点的最大层级
    allowDrop (draggingNode, dropNode, type) {
      // 1、被拖动的当前节点以及所在的父节点总层数不能大于3
      // 1）、被拖动的当前节点总层数
      console.log('allowDrop:', draggingNode, dropNode, type)
      //
      this.countNodeLevel(draggingNode)
      // 当前正在拖动的节点+父节点所在的深度不大于3即可
      let deep = Math.abs(this.maxLevel - draggingNode.level) + 1
      console.log('深度：', deep)
      // this.maxLevel
      if (type === 'inner') {
        //  console.log(
        //    `this.maxLevel：${this.maxLevel}；draggingNode.data.level：${draggingNode.data.level}；dropNode.level：${dropNode.level}`
        //  );
        return deep + dropNode.level <= 3
      } else {
        return deep + dropNode.parent.level <= 3
      }
    },
    // 计算子节点的层级
    countNodeLevel (node) {
      // 找到所有子节点，求出最大深度
      if (node.childNodes !== null && node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (node.childNodes[i].level > this.maxLevel) {
            this.maxLevel = node.childNodes[i].level
          }
          this.countNodeLevel(node.childNodes[i])
        }
      }
    }
  },
  beforeCreate () {
  }, // 生命周期-创建之前
  created () {
    this.getDataList()
  }, // 生命周期-创建完成（可以访问当前this实例）
  beforeMount () {
  }, // 生命周期-挂载之前
  mounted () {
  }, // 生命周期-挂载完成（可以访问DOM元素）
  beforeUpdate () {
  }, // 生命周期-更新之前
  updated () {
  }, // 生命周期-更新之后
  beforeDestroy () {
  }, // 生命周期-销毁之前
  destroyed () {
  }, // 生命周期-销毁完成
  activated () {
  } // 如果页面有keep-alive缓存功能，这个函数会触发
}
</script>

<style scoped>

</style>
