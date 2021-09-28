<template>
  <div class="mod-config">

    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.key" placeholder="参数名" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button
          v-if="isAuth('product:brand:save')"
          type="primary"
          @click="addOrUpdateHandle()">新增
        </el-button>
        <el-button
          v-if="isAuth('product:brand:delete')"
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
      <el-table-column prop="brandId" header-align="center" align="center" label="品牌id"></el-table-column>
      <el-table-column prop="brandName" header-align="center" align="center" label="品牌名"></el-table-column>
      <el-table-column prop="logo" header-align="center" align="center" label="品牌logo">
        <template slot-scope="scope">
          <el-popover placement="right" trigger="hover">
            <img :src="scope.row.logo" style="width: 100%" alt="logo图标"/>
            <img :src="scope.row.logo" :alt="scope.row.logo" slot="reference"
                 style="width: 50%;cursor: pointer">
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="description" header-align="center" align="center" label="介绍"></el-table-column>
      <el-table-column prop="showed" header-align="center" align="center" label="显示状态">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.showed"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
            @change="updateBrandStatusHandle(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="firstLetter" header-align="center" align="center" label="检索首字母"></el-table-column>
      <el-table-column prop="sort" header-align="center" align="center" label="排序"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="250" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="updateCategoryHandle(scope.row.brandId)">关联分类</el-button>
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.brandId)">修改</el-button>
          <el-button type="text" size="small" @click="deleteHandle(scope.row.brandId)">删除</el-button>
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

    <el-dialog title="关联分类" :visible.sync="cateRelationDialogVisible" width="30%">
      <el-popover placement="right-end" v-model="popCategorySelectVisible">
        <category-cascader :categoryPath.sync="categoryPath"></category-cascader>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="popCategorySelectVisible = false">取消</el-button>
          <el-button type="primary" size="mini" @click="addRelationSelectHandle">确定</el-button>
        </div>
        <el-button slot="reference">新增关联</el-button>
      </el-popover>

      <el-table :data="cateRelationTableData" style="width: 100%">
        <el-table-column prop="id" label="#"></el-table-column>
        <el-table-column prop="brandName" label="品牌名"></el-table-column>
        <el-table-column prop="categoryName" label="分类名"></el-table-column>
        <el-table-column fixed="right" header-align="center" align="center" label="操作">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="deleteRelationHandle(scope.row.id,scope.row.brandId)">移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <span slot="footer" class="dialog-footer">
        <el-button @click="cateRelationDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="cateRelationDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
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
import AddOrUpdate from './brand-add-or-update'
import CategoryCascader from '../common/category-cascader'

export default {
  // import引入的组件需要注入到对象中才能使用
  components: {
    AddOrUpdate,
    CategoryCascader
  },
  data () {
    return {
      dataForm: {
        key: ''
      },
      brandSub: {
        brandIds: []
      },
      brandId: 0,
      categoryPath: [],
      dataList: [],
      cateRelationTableData: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      cateRelationDialogVisible: false,
      popCategorySelectVisible: false
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
    // 查询 品牌分页列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/product/brand/page'),
        method: 'post',
        data: this.$http.adornData({
          page: this.pageIndex,
          size: this.pageSize,
          brandName: this.dataForm.key
        })
      }).then(({data}) => {
        console.log('查询 -----> 品牌分页列表 -----> 请求路径: /product/brand/page')
        console.log('查询 -----> 品牌分页列表 -----> 返回结果:', data)
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
    // 新增/修改 品牌信息
    addOrUpdateHandle (id) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.dataInit(id)
      })
    },
    // 删除 品牌信息
    deleteHandle (id) {
      this.brandSub.brandIds = id ? [id] : this.dataListSelections.map(item => {
        return item.brandId
      })
      this.$confirm(`确定对[id=${this.brandSub.brandIds.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
      ).then(() => {
        this.$http({
          url: this.$http.adornUrl('/product/brand/remove'),
          method: 'delete',
          data: this.$http.adornData(this.brandSub.brandIds, false)
        }).then(({data}) => {
          console.log('删除 -----> 品牌信息 -----> 请求路径: /product/brand/remove')
          console.log('删除 -----> 品牌信息 -----> 返回结果:', data)
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
    // 更新 品牌状态信息
    updateBrandStatusHandle (data) {
      let {brandId, showed} = data
      // 发送请求修改状态
      this.$http({
        url: this.$http.adornUrl('/product/brand/modify/showed'),
        method: 'post',
        data: this.$http.adornData({brandId, showed}, false)
      }).then(({data}) => {
        console.log('更新 -----> 品牌的状态信息 -----> 请求路径: /product/brand/modify/showed')
        console.log('更新 -----> 品牌的状态信息 -----> 返回数据:', data)
        this.$message({
          type: 'success',
          message: '状态更新成功'
        })
      })
    },
    // 查询 品牌分类关联关系列表
    getRelationHandle () {
      this.$http({
        url: this.$http.adornUrl('/product/relation/brand-category/list/categorys/by/brandId'),
        method: 'post',
        data: this.$http.adornData({
          brandId: this.brandId
        }, false)
      }).then(({data}) => {
        console.log('查询 -----> 品牌关联的分类 -----> 请求路径: /product/relation/brand-category/list/categorys/by/brandId')
        console.log('查询 -----> 品牌关联的分类 -----> 返回数据:', data)
        this.cateRelationTableData = data.data
      })
    },
    // 添加 品牌分类关联关系
    addRelationSelectHandle () {
      // {"brandId":1,"categoryId":2}
      this.popCategorySelectVisible = false
      this.$http({
        url: this.$http.adornUrl('/product/relation/brand-category/save'),
        method: 'post',
        data: this.$http.adornData({
          brandId: this.brandId,
          categoryId: this.categoryPath[this.categoryPath.length - 1]
        }, false)
      }).then(({data}) => {
        console.log('添加 -----> 品牌关联的分类 -----> 请求路径: /product/relation/brand-category/save')
        console.log('添加 -----> 品牌关联的分类 -----> 返回数据:', data)
        this.getRelationHandle()
      })
    },
    // 删除 品牌分类关联关系
    deleteRelationHandle (id, brandId) {
      this.$http({
        url: this.$http.adornUrl('/product/relation/brand-category/remove'),
        method: 'delete',
        data: this.$http.adornData([id], false)
      }).then(({data}) => {
        console.log('删除 -----> 品牌关联的分类 -----> 请求路径: /product/relation/brand-category/remove')
        console.log('删除 -----> 品牌关联的分类 -----> 返回数据:', data)
        this.getRelationHandle()
      })
    },
    // 更新 关联分类级联关系
    updateCategoryHandle (brandId) {
      this.cateRelationDialogVisible = true
      this.brandId = brandId
      this.getRelationHandle()
    }
  },
  activated () {
    this.getDataList()
  }
}
</script>
