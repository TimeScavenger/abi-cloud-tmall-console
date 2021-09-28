<template>
  <!--
  使用说明：
  1）、引入category-cascader.vue
  2）、语法：<category-cascader :categoryPath.sync="categoryPath"></category-cascader>
      解释：
        categoryPath：指定的值是cascader初始化需要显示的值，应该和父组件的categoryPath绑定;
            由于有sync修饰符，所以cascader路径变化以后自动会修改父的categoryPath，这是结合子组件this.$emit("update:categoryPath",v);做的
        -->
  <div>
    <el-cascader
      filterable
      clearable
      placeholder="试试搜索：手机"
      v-model="paths"
      :options="categorys"
      :props="setting"></el-cascader>
  </div>

</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
// 例如：import《组件名称》from'《组件路径》';
// import PubSub from 'pubsub-js'

export default {
  // import引入的组件需要注入到对象中才能使用
  components: {},
  // 接受父组件传来的值
  props: {
    categoryPath: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    // 这里存放数据
    return {
      setting: {
        value: 'categoryId',
        label: 'categoryName',
        children: 'children'
      },
      categorys: [],
      categoryTree: {
        level: 4
      },
      paths: this.categoryPath
    }
  },
  watch: {
    categoryPath (v) {
      this.paths = this.categoryPath
    },
    paths (v) {
      this.$emit('update:categoryPath', v)
      // 此处先注销，会引起品牌关联分类的bug
      this.PubSub.publish('catPath', v)
    }
  },
  // 方法集合
  methods: {
    getCategorys () {
      this.$http({
        url: this.$http.adornUrl('/product/category/list/tree'),
        method: 'post',
        data: this.$http.adornData(this.categoryTree, false)
      }).then(({data}) => {
        console.log('查询 -----> 分类列表 -----> 请求路径: /product/category/list/tree')
        console.log('查询 -----> 分类列表 -----> 返回数据:', data)
        this.categorys = data.data
      })
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
