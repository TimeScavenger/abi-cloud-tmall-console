<template>
  <div>
    <el-dialog :close-on-click-modal="false" :visible.sync="visible" @closed="dialogClose">

      <el-dialog width="40%" title="选择属性" :visible.sync="innerVisible" append-to-body>
        <div>
          <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
            <el-form-item>
              <el-input v-model="dataForm.key" placeholder="参数名" clearable></el-input>
            </el-form-item>
            <el-form-item>
              <el-button @click="getDataList()">查询</el-button>
            </el-form-item>
          </el-form>

          <el-table
            :data="dataList"
            border
            v-loading="dataListLoading"
            @selection-change="innerSelectionChangeHandle"
            style="width: 100%;">
            <el-table-column type="selection" header-align="center" align="center"></el-table-column>
            <el-table-column prop="attributeId" header-align="center" align="center" label="属性id"></el-table-column>
            <el-table-column prop="attributeName" header-align="center" align="center" label="属性名"></el-table-column>
            <el-table-column prop="icon" header-align="center" align="center" label="属性图标"></el-table-column>
            <el-table-column prop="valueList" header-align="center" align="center" label="可选值列表"></el-table-column>
          </el-table>

          <el-pagination
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
            :current-page="pageIndex"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            :total="totalPage"
            layout="total, sizes, prev, pager, next, jumper">
          </el-pagination>
        </div>

        <div slot="footer" class="dialog-footer">
          <el-button @click="innerVisible = false">取 消</el-button>
          <el-button type="primary" @click="dataAddFormSubmit">确认新增</el-button>
        </div>
      </el-dialog>

      <el-row>
        <el-col :span="24">
          <el-button type="primary" @click="dataAddInit">新建关联</el-button>
          <el-button
            type="danger"
            @click="batchDeleteHandle"
            :disabled="dataListSelections.length <= 0">批量删除
          </el-button>

          <!--  -->
          <el-table
            :data="relationAttrs"
            style="width: 100%"
            @selection-change="selectionChangeHandle"
            border>
            <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
            <el-table-column prop="attributeId" label="#"></el-table-column>
            <el-table-column prop="attributeName" label="属性名"></el-table-column>
            <el-table-column prop="valueList" label="可选值">
              <template slot-scope="scope">
                <el-tooltip placement="top">
                  <div slot="content">
                    <span v-for="(i,index) in scope.row.valueList.split(';')" :key="index">
                      {{ i }}
                      <br/>
                    </span>
                  </div>
                  <el-tag>{{ scope.row.valueList.split(';')[0] + ' ...' }}</el-tag>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" label="操作">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="deleteHandle(scope.row.attributeId)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>

        </el-col>
      </el-row>

    </el-dialog>
  </div>
</template>

<script>
export default {
  // import引入的组件需要注入到对象中才能使用
  components: {},
  props: {},
  data () {
    // 这里存放数据
    return {
      groupId: 0,
      visible: false,
      innerVisible: false,
      relationAttrs: [],
      dataListSelections: [],
      dataForm: {
        key: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      innerdataListSelections: []
    }
  },
  // 计算属性类似于data概念
  computed: {},
  // 监控data中的数据变化
  watch: {},
  // 方法集合
  methods: {
    // 多选
    selectionChangeHandle (val) {
      this.dataListSelections = val
    },
    // 多选改变
    innerSelectionChangeHandle (val) {
      this.innerdataListSelections = val
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
    // 查询 分组属性关联关系分页列表
    dataInit (id) {
      this.groupId = id || 0
      this.visible = true
      this.$http({
        url: this.$http.adornUrl('/product/relation/group-attribute/list/attributes/by/groupId'),
        method: 'post',
        data: this.$http.adornData({
          page: this.pageIndex,
          size: this.pageSize,
          groupId: this.groupId,
          attributeName: this.dataForm.key
        })
      }).then(({data}) => {
        console.log('查询 -----> 分组属性关联关系分页列表 -----> 提交路径: /product/relation/group-attribute/list/attributes/by/groupId')
        console.log('查询 -----> 分组属性关联关系分页列表 -----> 返回数据:', JSON.stringify(data))
        if (data && data.code === 200000) {
          this.relationAttrs = data.data.records
        } else {
          this.dataList = []
          this.totalPage = 0
        }
      })
    },
    // 查询 分组未关联属性分页列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/product/relation/group-attribute/page/no-attributes/by/groupId'),
        method: 'post',
        data: this.$http.adornData({
          page: this.pageIndex,
          size: this.pageSize,
          groupId: this.groupId,
          attributeName: this.dataForm.key
        })
      }).then(({data}) => {
        console.log('查询 -----> 分组未给关联属性分页列表 -----> 提交路径: /product/relation/group-attribute/page/no-attributes/by/groupId')
        console.log('查询 -----> 分组未给关联属性分页列表 -----> 返回数据:', JSON.stringify(data))
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
    // 显示 添加分组属性关联关系界面
    dataAddInit () {
      this.getDataList()
      this.innerVisible = true
    },
    // 提交 分组属性关联关系
    dataAddFormSubmit () {
      this.innerVisible = false
      // 准备数据
      if (this.innerdataListSelections.length > 0) {
        let postData = []
        this.innerdataListSelections.forEach(item => {
          postData.push({attributeId: item.attributeId, groupId: this.groupId})
        })
        this.$http({
          url: this.$http.adornUrl('/product/relation/group-attribute/save/batch'),
          method: 'post',
          data: this.$http.adornData(postData, false)
        }).then(({data}) => {
          console.log('提交 -----> 分组属性关联关系 -----> 提交路径: /product/relation/group-attribute/save/batch')
          console.log('提交 -----> 分组属性关联关系 -----> 返回数据:', JSON.stringify(data))
          if (data.code === 220) {
            this.$message({type: 'success', message: '新增关联成功'})
          }
          this.$emit('refreshData')
          this.dataInit(this.groupId)
        })
      } else {
      }
    },
    // 移除 分组属性关联关系
    deleteHandle (attributeId) {
      let data = []
      data.push({attributeId: attributeId, groupId: this.groupId})
      this.$http({
        url: this.$http.adornUrl('/product/relation/group-attribute/remove'),
        method: 'post',
        data: this.$http.adornData(data, false)
      }).then(({data}) => {
        console.log('移除 -----> 分组属性关联关系 -----> 提交路径: /product/relation/group-attribute/remove')
        console.log('移除 -----> 分组属性关联关系 -----> 返回数据:', JSON.stringify(data))
        if (data.code === 200000) {
          this.$message({type: 'success', message: '删除成功'})
          this.dataInit(this.groupId)
        } else {
          this.$message({type: 'error', message: data.msg})
        }
      })
    },
    // 批量移除 分组属性关联关系
    batchDeleteHandle (val) {
      let postData = []
      this.dataListSelections.forEach(item => {
        postData.push({attributeId: item.attributeId, groupId: this.groupId})
      })
      this.$http({
        url: this.$http.adornUrl('/product/relation/group-attribute/remove'),
        method: 'post',
        data: this.$http.adornData(postData, false)
      }).then(({data}) => {
        console.log('移除 -----> 分组属性关联关系 -----> 提交路径: /product/relation/group-attribute/remove')
        console.log('移除 -----> 分组属性关联关系 -----> 返回数据:', JSON.stringify(data))
        if (data.code === 200000) {
          this.$message({type: 'success', message: '删除成功'})
          this.dataInit(this.groupId)
        } else {
          this.$message({type: 'error', message: data.msg})
        }
      })
    },
    dialogClose () {
    }
  }
}
</script>

<style scoped>

</style>
