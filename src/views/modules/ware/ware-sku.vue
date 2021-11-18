<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="仓库">
        <el-select style="width:160px;" v-model="dataForm.wareCode" placeholder="请选择仓库" clearable>
          <el-option :label="w.wareName" :value="w.wareCode" v-for="w in wareList" :key="w.wareName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品名称">
        <el-input v-model="dataForm.skuName" placeholder="请输入商品名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <!--        <el-button v-if="isAuth('ware:waresku:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>-->
        <!--        <el-button-->
        <!--          v-if="isAuth('ware:waresku:delete')"-->
        <!--          type="danger"-->
        <!--          @click="deleteHandle()"-->
        <!--          :disabled="dataListSelections.length <= 0"-->
        <!--        >批量删除-->
        <!--        </el-button>-->
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle">
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <el-table-column prop="id" header-align="center" align="center" label="自增ID"></el-table-column>
      <el-table-column prop="wareCode" header-align="center" align="center" label="仓库ID"></el-table-column>
      <el-table-column prop="wareName" header-align="center" align="center" label="仓库名称"></el-table-column>
      <el-table-column prop="skuCode" header-align="center" align="center" label="商品ID"></el-table-column>
      <el-table-column prop="skuName" header-align="center" align="center" label="商品名称"></el-table-column>
      <el-table-column prop="stock" header-align="center" align="center" label="库存数"></el-table-column>
      <el-table-column prop="stockLocked" header-align="center" align="center" label="锁定库存"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">按钮一</el-button>
          <el-button type="text" size="small" @click="deleteHandle(scope.row.id)">按钮二</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex"
                   :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="totalPage"
                   layout="total, sizes, prev, pager, next, jumper"></el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from './ware-sku-add-or-update'

export default {
  data () {
    return {
      wareList: [],
      dataForm: {
        wareCode: '',
        skuName: ''
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
  components: {
    AddOrUpdate
  },
  activated () {
    console.log('接收到', this.$route.query.skuCode)
    if (this.$route.query.skuCode) {
      this.dataForm.skuCode = this.$route.query.skuCode
    }
    this.getWares()
    this.getDataList()
  },
  methods: {
    getWares () {
      this.$http({
        url: this.$http.adornUrl('/ware/console/ware/list'),
        method: 'post',
        data: this.$http.adornData({})
      }).then(({data}) => {
        console.log('查询 -----> 仓库列表 -----> 请求路径: /ware/console/ware/list')
        console.log('查询 -----> 仓库列表 -----> 返回结果:', data)
        if (data && data.code === 200000) {
          this.wareList = data.data
        }
      })
    },
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/ware/console/ware-sku-relation/page'),
        method: 'post',
        data: this.$http.adornData({
          page: this.pageIndex,
          size: this.pageSize,
          wareCode: this.dataForm.wareCode,
          skuName: this.dataForm.skuName
        })
      }).then(({data}) => {
        if (data && data.code === 200000) {
          console.log('查询 -----> 仓库列表 -----> 请求路径: /ware/console/ware-sku-relation/page')
          console.log('查询 -----> 仓库列表 -----> 返回结果:', data)
          this.dataList = data.data.records
          this.totalPage = data.data.total
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      })
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
    // 多选
    selectionChangeHandle (val) {
      this.dataListSelections = val
    },
    // 新增 / 修改
    addOrUpdateHandle (id) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id)
      })
    },
    // 删除
    deleteHandle (id) {
      var ids = id
        ? [id]
        : this.dataListSelections.map(item => {
          return item.id
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
          url: this.$http.adornUrl('/ware/waresku/delete'),
          method: 'post',
          data: this.$http.adornData(ids, false)
        }).then(({data}) => {
          if (data && data.code === 0) {
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
    }
  }
}
</script>
