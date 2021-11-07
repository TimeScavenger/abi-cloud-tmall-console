<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <category @tree-node-click="treenodeclick"></category>
    </el-col>
    <el-col :span="18">
      <div class="mod-config">

        <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
          <el-form-item>
            <el-input v-model="dataForm.key" placeholder="参数名" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="getDataList()">查询</el-button>
            <el-button type="success" @click="getAllDataList()">查询全部</el-button>
            <el-button v-if="isAuth('product:attribute:save')" type="primary" @click="addOrUpdateHandle()">新增
            </el-button>
            <el-button v-if="isAuth('product:attribute:delete')" type="danger" @click="deleteHandle()"
                       :disabled="dataListSelections.length <= 0">批量删除
            </el-button>
          </el-form-item>
        </el-form>

        <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle"
                  style="width: 100%;">
          <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
          <el-table-column prop="attributeId" header-align="center" align="center" label="id"></el-table-column>
          <el-table-column prop="attributeName" header-align="center" align="center" label="属性名"></el-table-column>
          <el-table-column prop="categoryName" header-align="center" align="center" label="所属分类"></el-table-column>
          <el-table-column v-if="attrtype === 0" prop="groupName" header-align="center" align="center"
                           label="所属分组"></el-table-column>
          <el-table-column prop="valueType" header-align="center" align="center" label="值类型">
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.valueType===0">单选</el-tag>
              <el-tag v-else>多选</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="valueList" header-align="center" align="center" label="可选值">
            <template slot-scope="scope">
              <el-tooltip placement="top">
                <div slot="content">
                  <span v-for="(i,index) in scope.row.valueList.split(';')" :key="index">{{ i }}<br/></span>
                </div>
                <el-tag>{{ scope.row.valueList.split(';')[0] + ' ...' }}</el-tag>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column v-if="attrtype === 1" prop="searchType" header-align="center" align="center" label="可检索">
            <template slot-scope="scope">
              <i class="el-icon-success" v-if="scope.row.searchType === 1"></i>
              <i class="el-icon-error" v-else></i>
            </template>
          </el-table-column>
          <el-table-column v-if="attrtype === 0" prop="quickShow" header-align="center" align="center" label="快速展示">
            <template slot-scope="scope">
              <i class="el-icon-success" v-if="scope.row.quickShow === 1"></i>
              <i class="el-icon-error" v-else></i>
            </template>
          </el-table-column>
          <el-table-column prop="icon" header-align="center" align="center" label="图标"></el-table-column>
          <el-table-column v-if="attrtype === 0" prop="enabled" header-align="center" align="center" label="启用">
            <template slot-scope="scope">
              <i class="el-icon-success" v-if="scope.row.enabled === 1"></i>
              <i class="el-icon-error" v-else></i>
            </template>
          </el-table-column>

          <el-table-column
            fixed="right"
            header-align="center"
            align="center"
            width="150"
            label="操作">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.attributeId)">修改</el-button>
              <el-button type="text" size="small" @click="deleteHandle(scope.row.attributeId)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          @size-change="sizeChangeHandle"
          @current-change="currentChangeHandle"
          :current-page="pageIndex"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :total="totalPage"
          layout="total, sizes, prev, pager, next, jumper"></el-pagination>

        <!-- 弹窗, 新增 / 修改 -->
        <add-or-update
          :type="attrtype"
          v-if="addOrUpdateVisible"
          ref="addOrUpdate"
          @refreshDataList="getDataList"></add-or-update>
      </div>
    </el-col>
  </el-row>
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
import Category from '../common/category'
import AddOrUpdate from './attribute-add-or-update'

export default {
  // import引入的组件需要注入到对象中才能使用
  components: {Category, AddOrUpdate},
  props: {
    attrtype: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      categoryId: 0,
      type: 0,
      dataForm: {
        key: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false
    }
  },
  methods: {
    // 多选
    selectionChangeHandle (val) {
      this.dataListSelections = val
    },
    // 每页数
    sizeChangeHandle (val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },
    // 当前页
    currentChangeHandle (val) {
      this.pageIndex = val
      this.getDataList()
    },
    // 查询 规格参数分页列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl(`/product/console/attribute/page`),
        method: 'post',
        data: this.$http.adornData({
          page: this.pageIndex,
          size: this.pageSize,
          type: this.attrtype,
          categoryId: this.categoryId,
          attributeName: this.dataForm.key
        })
      }).then(({data}) => {
        console.log('查询 -----> 规格参数分页列表 -----> 请求路径: /product/console/attribute/page')
        console.log('查询 -----> 规格参数分页列表 -----> 返回结果:', data)
        if (data && data.code === 200000) {
          this.dataList = data.data.records
          this.totalPage = data.data.total
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      })
    },
    // 新增/修改规格参数
    addOrUpdateHandle (id) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.dataInit(id)
      })
    },
    // 删除 规格参数
    deleteHandle (id) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.attributeId
      })
      this.$confirm(
        `确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.$http({
          url: this.$http.adornUrl('/product/console/attribute/remove'),
          method: 'post',
          data: this.$http.adornData({
            attributeIds: ids
          })
        }).then(({data}) => {
          console.log('删除 -----> 规格参数 -----> 请求路径: /product/console/attribute/remove')
          console.log('删除 -----> 规格参数 -----> 返回结果:', data)
          if (data && data.code === 200000) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList()
              }
            })
          } else {
            this.$message.error(data.msg)
          }
        })
      })
    },
    // ========================================== 以下命名未统一 ====================
    // 感知树节点被点击
    treenodeclick (data, node, component) {
      if (node.level === 3) {
        this.categoryId = data.categoryId
        this.getDataList() //  重新查询
      }
    },
    getAllDataList () {
      this.categoryId = 0
      this.getDataList()
    }
  },
  // 如果页面有keep-alive缓存功能，这个函数会触发
  activated () {
    this.getDataList()
  }
}
</script>

<style scoped>

</style>
