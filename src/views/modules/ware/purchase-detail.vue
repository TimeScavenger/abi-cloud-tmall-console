<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item label="仓库">
        <el-select style="width:120px;" v-model="dataForm.wareId" placeholder="请选择仓库" clearable>
          <el-option :label="w.wareName" :value="w.wareId" v-for="w in wareList" :key="w.wareId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select style="width:120px;" v-model="dataForm.status" placeholder="请选择状态" clearable>
          <el-option label="新建" :value="0"></el-option>
          <el-option label="已分配" :value="1"></el-option>
          <el-option label="正在采购" :value="2"></el-option>
          <el-option label="已完成" :value="3"></el-option>
          <el-option label="采购失败" :value="4"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关键字">
        <el-input style="width:120px;" v-model="dataForm.skuName" placeholder="参数名" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('ware:purchasedetail:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-dropdown @command="handleBatchCommand" :disabled="dataListSelections.length <= 0">
          <el-button type="danger">批量操作<i class="el-icon-arrow-down el-icon--right"></i></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="delete">批量删除</el-dropdown-item>
            <el-dropdown-item command="merge">合并整单</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle"
              style="width: 100%;">
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <el-table-column prop="purchaseDetailId" header-align="center" align="center" label="采购明细ID"></el-table-column>
      <el-table-column prop="purchaseId" header-align="center" align="center" label="采购单ID"></el-table-column>
      <el-table-column prop="skuId" header-align="center" align="center" label="采购商品ID"></el-table-column>
      <el-table-column prop="skuNum" header-align="center" align="center" label="采购数量"></el-table-column>
      <el-table-column prop="skuPrice" header-align="center" align="center" label="采购金额"></el-table-column>
      <el-table-column prop="wareId" header-align="center" align="center" label="仓库ID"></el-table-column>
      <el-table-column prop="status" header-align="center" align="center" label="状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status===0">新建</el-tag>
          <el-tag type="info" v-if="scope.row.status===1">已分配</el-tag>
          <el-tag type="wanring" v-if="scope.row.status===2">正在采购</el-tag>
          <el-tag type="success" v-if="scope.row.status===3">已完成</el-tag>
          <el-tag type="danger" v-if="scope.row.status===4">采购失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.purchaseDetailId)">修改</el-button>
          <el-button type="text" size="small" @click="deleteHandle(scope.row.purchaseDetailId)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex"
                   :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="totalPage"
                   layout="total, sizes, prev, pager, next, jumper"></el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
    <el-dialog title="合并到整单" :visible.sync="mergedialogVisible">
      <!-- id  assignee_id  assignee_name  phone   priority status -->
      <el-select v-model="purchaseId" placeholder="请选择" clearable filterable>
        <el-option v-for="item in purchasetableData" :key="item.purchaseId" :label="item.purchaseName"
                   :value="item.purchaseId">
          <span style="float: left">{{ item.purchaseName }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px; margin-left: 3px;">{{
              item.assigneeName
            }}:{{ item.assigneePhone }}</span>
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="mergedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="mergeItem">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AddOrUpdate from './purchase-detail-add-or-update'

export default {
  data () {
    return {
      dataForm: {
        wareId: '',
        status: '',
        skuName: ''
      },
      wareList: [],
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      mergedialogVisible: false,
      purchaseId: '',
      purchasetableData: []
    }
  },
  components: {
    AddOrUpdate
  },
  activated () {
    this.getDataList()
    this.getWares()
  },
  methods: {
    mergeItem () {
      let purchaseDetailIds = this.dataListSelections.map(item => {
        return item.purchaseDetailId
      })
      if (!this.purchaseId) {
        this.$confirm('没有选择任何【采购单】，将自动创建新单进行合并。确认吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/ware/console/purchase-detail/merge'),
            method: 'post',
            data: this.$http.adornData({
              purchaseDetailIds: purchaseDetailIds
            })
          }).then(({data}) => {
            this.getDataList()
          })
        }).catch(() => {
        })
      } else {
        this.$http({
          url: this.$http.adornUrl('/ware/console/purchase-detail/merge'),
          method: 'post',
          data: this.$http.adornData({
            purchaseId: this.purchaseId,
            purchaseDetailIds: purchaseDetailIds
          })
        }).then(({data}) => {
          this.getDataList()
        })
      }
      this.mergedialogVisible = false
    },
    getUnreceivedPurchase () {
      this.$http({
        url: this.$http.adornUrl('/ware/console/purchase/list'),
        method: 'post',
        data: this.$http.adornData({
          status: 1
        })
      }).then(({data}) => {
        console.log('查询 -----> 采购单列表 -----> 请求路径: /ware/console/purchase/list')
        console.log('查询 -----> 采购单列表 -----> 返回结果:', data)
        if (data && data.code === 200000) {
          this.purchasetableData = data.data
        }
      })
    },
    handleBatchCommand (cmd) {
      if (cmd === 'delete') {
        this.deleteHandle()
      }
      if (cmd === 'merge') {
        console.log('批量操作的ID集合', this.dataListSelections)
        if (this.dataListSelections.length !== 0) {
          this.getUnreceivedPurchase()
          this.mergedialogVisible = true
        } else {
          this.$alert('请先选择需要合并的采购项', '提示', {
            confirmButtonText: '确定',
            callback: action => {
            }
          })
        }
      }
    },
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
        url: this.$http.adornUrl('/ware/console/purchase-detail/page'),
        method: 'post',
        data: this.$http.adornData({
          page: this.pageIndex,
          limit: this.pageSize,
          wareId: this.dataForm.wareId,
          status: this.dataForm.status,
          skuName: this.dataForm.skuName
        })
      }).then(({data}) => {
        if (data && data.code === 200000) {
          this.dataList = data.data.records
          this.totalPage = data.data.totalCount
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
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.purchaseDetailId
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
          url: this.$http.adornUrl('/ware/purchasedetail/delete'),
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
