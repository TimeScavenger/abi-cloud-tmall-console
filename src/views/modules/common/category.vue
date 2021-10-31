<template>
  <div>
    <el-input placeholder="输入关键字进行筛选" v-model="filterText" clearable></el-input>

    <!--
      @node-click="nodeclick" 节点被点击时的回调
    -->
    <el-tree :data="menus" :props="defaultProps" node-key="catId" ref="menuTree" @node-click="nodeclick"
             :filter-node-method="filterNode" :highlight-current="true"></el-tree>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import《组件名称》from'《组件路径》';

export default {
  // import引入的组件需要注入到对象中才能使用
  components: {},
  props: {},
  data () {
    // 这里存放数据
    return {
      filterText: '',
      menus: [],
      expandedKey: [],
      categoryTree: {
        level: 4
      },
      defaultProps: {
        children: 'children',
        label: 'categoryName'
      }
    }
  },
  // 计算属性类似于data概念
  computed: {},
  // 监控data中的数据变化
  watch: {
    filterText (val) {
      this.$refs.menuTree.filter(val)
    }
  },
  // 方法集合
  methods: {
    // 树节点过滤
    filterNode (value, data) {
      if (!value) return true
      return data.categoryName.indexOf(value) !== -1
    },
    getCategorys () {
      this.$http({
        url: this.$http.adornUrl('/product/console/category/list/tree'),
        method: 'post',
        data: this.$http.adornData(this.categoryTree, false)
      }).then(({data}) => {
        console.log('查询 -----> 分类列表 -----> 请求路径: /product/console/category/list/tree')
        console.log('查询 -----> 分类列表 -----> 返回数据:', data)
        this.menus = data.data
      })
    },
    nodeclick (data, node, component) {
      console.log('子组件category的节点被点击', data, node, component)
      // 向父组件发送事件；并携带3个数据
      this.$emit('tree-node-click', data, node, component)
    }
  },
  beforeCreate () {
  }, // 生命周期-创建之前
  created () {
    this.getCategorys()
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
