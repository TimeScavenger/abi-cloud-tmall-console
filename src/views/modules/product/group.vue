<template>
  <el-row :gutter="20">

    <el-col :span="6">
      <!-- 子组件往上散发事件,意思就是子组件点击了触发这个事件,绑定自己的事件 -->
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
            <el-button
              v-if="isAuth('product:attrgroup:save')"
              type="primary"
              @click="addOrUpdateHandle()">新增
            </el-button>
            <el-button
              v-if="isAuth('product:attrgroup:delete')"
              type="danger"
              @click="deleteHandle()"
              :disabled="dataListSelections.length <= 0">批量删除
            </el-button>
          </el-form-item>
        </el-form>

        <el-table
          :data="dataList"
          border
          v-loading="dataListLoading"
          @selection-change="selectionChangeHandle"
          style="width: 100%;">
          <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
          <el-table-column prop="groupId" header-align="center" align="center" label="分组id"></el-table-column>
          <el-table-column prop="groupName" header-align="center" align="center" label="组名"></el-table-column>
          <el-table-column prop="sort" header-align="center" align="center" label="排序"></el-table-column>
          <el-table-column prop="description" header-align="center" align="center" label="描述"></el-table-column>
          <el-table-column prop="icon" header-align="center" align="center" label="组图标"></el-table-column>
          <el-table-column prop="categoryId" header-align="center" align="center" label="所属分类id"></el-table-column>
          <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="getRelationHandle(scope.row.groupId)">关联</el-button>
              <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.groupId)">修改</el-button>
              <el-button type="text" size="small" @click="deleteHandle(scope.row.groupId)">删除</el-button>
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
        <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
        <!-- 修改关联关系 -->
        <relation-update v-if="relationVisible" ref="relationUpdate" @refreshData="getDataList"></relation-update>
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
import AddOrUpdate from './group-add-or-update'
import RelationUpdate from './group-attribute-relation'

export default {
  // import引入的组件需要注入到对象中才能使用
  components: {Category, AddOrUpdate, RelationUpdate},
  props: {},
  data () {
    return {
      categoryId: 0,
      dataForm: {
        key: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      relationVisible: false
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
    // 查询 分组分页列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/product/console/group/page'),
        method: 'post',
        data: this.$http.adornData({
          page: this.pageIndex,
          size: this.pageSize,
          groupName: this.dataForm.key,
          categoryId: this.categoryId
        })
      }).then(({data}) => {
        console.log('查询 -----> 分组分页列表 -----> 请求路径: /product/console/group/page')
        console.log('查询 -----> 分组分页列表 -----> 返回结果:', data)
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
    // 新增/修改分组信息
    addOrUpdateHandle (id) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.dataInit(id)
      })
    },
    // 删除 分组信息
    deleteHandle (id) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.groupId
      })
      this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
      ).then(() => {
        this.$http({
          url: this.$http.adornUrl('/product/console/group/remove'),
          method: 'delete',
          data: this.$http.adornData({
            groupIds: ids
          })
        }).then(({data}) => {
          console.log('删除 -----> 分组信息 -----> 请求路径: /product/console/group/remove')
          console.log('删除 -----> 分组信息 -----> 返回结果:', data)
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
    // 查询 分组属性关联关系列表
    getRelationHandle (groupId) {
      this.relationVisible = true
      this.$nextTick(() => {
        this.$refs.relationUpdate.dataInit(groupId)
      })
    },
    // ========================================== 以下命名未统一 ====================
    // 感知树节点被点击，接受子组件传过来的数据
    treenodeclick (data, node, component) {
      if (node.level === 3) {
        this.categoryId = data.categoryId
        this.getDataList() // 重新查询
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
