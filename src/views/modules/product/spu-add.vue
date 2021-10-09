<template>
  <div>
    <el-row>

      <el-col :span="24">
        <el-steps :active="step" finish-status="success">
          <el-step title="基本信息"></el-step>
          <el-step title="规格参数"></el-step>
          <el-step title="销售属性"></el-step>
          <el-step title="SKU信息"></el-step>
          <el-step title="保存完成"></el-step>
        </el-steps>
      </el-col>

      <el-col :span="24" v-show="step===0">
        <el-card class="box-card" style="width:80%;margin:20px auto">
          <el-card class="box-card">
            <el-form ref="spuBaseForm" :model="spu" label-width="120px" :rules="spuBaseInfoRules">
              <el-form-item label="商品名称" prop="spuName">
                <el-input v-model="spu.spuName"></el-input>
              </el-form-item>
              <el-form-item label="商品描述" prop="spuDesc">
                <el-input v-model="spu.spuDesc"></el-input>
              </el-form-item>
              <el-form-item label="选择分类" prop="categoryId">
                <category-cascader></category-cascader>
              </el-form-item>
              <el-form-item label="选择品牌" prop="brandId">
                <brand-select></brand-select>
              </el-form-item>
              <el-form-item label="商品重量(Kg)" prop="weight">
                <el-input-number v-model.number="spu.weight" :min="0" :precision="3" :step="0.1"></el-input-number>
              </el-form-item>
              <el-form-item label="设置积分" prop="bounds">
                <label>金币</label>
                <el-input-number style="width:130px" placeholder="金币" v-model="spu.bounds.buyBounds" :min="0"
                                 controls-position="right"></el-input-number>
                <label style="margin-left:15px">成长值</label>
                <el-input-number style="width:130px" placeholder="成长值" v-model="spu.bounds.growBounds" :min="0"
                                 controls-position="right">
                  <template slot="prepend">成长值</template>
                </el-input-number>
              </el-form-item>
              <el-form-item label="商品介绍" prop="descImgs">
                <multi-upload v-model="spu.descImgs"></multi-upload>
              </el-form-item>

              <el-form-item label="商品图集" prop="detailImgs">
                <multi-upload v-model="spu.detailImgs"></multi-upload>
              </el-form-item>
              <el-form-item>
                <el-button type="success" @click="collectSpuBaseInfo">下一步：设置基本参数</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-card>
      </el-col>

      <el-col :span="24" v-show="step===1">
        <el-card class="box-card" style="width:80%;margin:20px auto">
          <el-card class="box-card">

            <el-tabs tab-position="left" style="width:98%">
              <el-tab-pane :label="group.groupName" v-for="(group, gidx) in dataResp.attrGroups"
                           :key="group.groupId">
                <!-- 遍历属性,每个tab-pane对应一个表单，每个属性是一个表单项  spu.baseAttributes[0] = [{attributeId:xx,val:}]-->
                <el-form ref="form" :model="spu">
                  <el-form-item :label="attr.attributeName" v-for="(attr, aidx) in group.attributeList"
                                :key="attr.attributeId">
                    <el-input v-model="dataResp.baseAttributes[gidx][aidx].attributeId" type="hidden"
                              v-show="false"></el-input>
                    <el-select v-model="dataResp.baseAttributes[gidx][aidx].valueList" :multiple="attr.valueType === 1"
                               filterable allow-create default-first-option placeholder="请选择或输入值">
                      <el-option v-for="(val,vidx) in attr.valueList.split(';')" :key="vidx" :label="val"
                                 :value="val"></el-option>
                    </el-select>
                    <el-checkbox v-model="dataResp.baseAttributes[gidx][aidx].quickShow" :true-label="1"
                                 :false-label="0">
                      快速展示
                    </el-checkbox>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
            <div style="margin:auto">
              <el-button type="primary" @click="step = 0">上一步</el-button>
              <el-button type="success" @click="generateSaleAttrs">下一步：设置销售属性</el-button>
            </div>
          </el-card>
        </el-card>
      </el-col>

      <el-col :span="24" v-show="step===2">
        <el-card class="box-card" style="width:80%;margin:20px auto">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>选择销售属性</span>
              <el-form ref="saleform" :model="spu">
                <el-form-item :label="attr.attributeName" v-for="(attr, aidx) in dataResp.saleAttrs"
                              :key="attr.attributeId">
                  <el-input v-model="dataResp.tempSaleAttrs[aidx].attributeId" type="hidden" v-show="false"></el-input>
                  <el-checkbox-group v-model="dataResp.tempSaleAttrs[aidx].valueList">
                    <el-checkbox v-if="dataResp.saleAttrs[aidx].valueList !== ''" :label="val"
                                 v-for="val in dataResp.saleAttrs[aidx].valueList.split(';')" :key="val"></el-checkbox>
                    <div style="margin-left:20px;display:inline">
                      <el-button v-show="!inputVisible[aidx].view" class="button-new-tag" size="mini"
                                 @click="showInput(aidx)">+自定义
                      </el-button>
                      <el-input v-show="inputVisible[aidx].view" v-model="inputValue[aidx].val"
                                :ref="'saveTagInput'+aidx" size="mini" style="width:150px"
                                @keyup.enter.native="handleInputConfirm(aidx)"
                                @blur="handleInputConfirm(aidx)"></el-input>
                    </div>
                  </el-checkbox-group>
                </el-form-item>
              </el-form>
            </div>
            <el-button type="primary" @click="step = 1">上一步</el-button>
            <el-button type="success" @click="generateSkuList">下一步：设置SKU信息</el-button>
          </el-card>
        </el-card>
      </el-col>

      <el-col :span="24" v-show="step===3">
        <el-card class="box-card" style="width:80%;margin:20px auto">
          <el-card class="box-card">

            <el-table :data="spu.skuInfos" style="width: 100%">
              <el-table-column label="属性组合">
                <el-table-column :label="item.attributeName" v-for="(item,index) in dataResp.tableAttrColumn"
                                 :key="item.attributeId">
                  <template slot-scope="scope">
                    <span style="margin-left: 10px">{{ scope.row.attr[index].attrValue }}</span>
                  </template>
                </el-table-column>
              </el-table-column>
              <el-table-column label="商品名称" prop="skuName">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.skuName"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="标题" prop="skuTitle">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.skuTitle"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="副标题" prop="skuSubTitle">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.skuSubTitle"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="价格" prop="price">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.price"></el-input>
                </template>
              </el-table-column>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!--                <el-row>-->
                  <!--                  <el-col :span="24">-->
                  <!--                    <label style="display:block;float:left">选择图集 或</label>-->
                  <!--                    <multi-upload style="float:left;margin-left:10px;" :showFile="false" :listType="'text'" v-model="uploadImages"></multi-upload>-->
                  <!--                  </el-col>-->
                  <!--                  <el-col :span="24">-->
                  <!--                    <el-divider></el-divider>-->
                  <!--                  </el-col>-->
                  <!--                  <el-col :span="24">-->
                  <!--                    <el-card style="width:170px;float:left;margin-left:15px;margin-top:15px;" :body-style="{ padding: '0px' }" v-for="(img,index) in spu.detailImgs" :key="index">-->
                  <!--                      <img :src="img" style="width:160px;height:120px" alt="商品图集"/>-->
                  <!--                      <div style="padding: 14px;">-->
                  <!--                        <el-row>-->
                  <!--                          <el-col :span="12">-->
                  <!--                            <el-checkbox v-model="scope.row.images[index].imgUrl" :true-label="img" false-label></el-checkbox>-->
                  <!--                          </el-col>-->
                  <!--                          <el-col :span="12">-->
                  <!--                            <el-tag v-if="scope.row.images[index].defaultImg === 1">-->
                  <!--                              <input type="radio" checked :name="scope.row.skuName" @change="checkDefaultImg(scope.row,index,img)"/>设为默认-->
                  <!--                            </el-tag>-->
                  <!--                            <el-tag v-else>-->
                  <!--                              <input type="radio" :name="scope.row.skuName" @change="checkDefaultImg(scope.row,index,img)"/>设为默认-->
                  <!--                            </el-tag>-->
                  <!--                          </el-col>-->
                  <!--                        </el-row>-->
                  <!--                      </div>-->
                  <!--                    </el-card>-->
                  <!--                  </el-col>-->
                  <!--                </el-row>-->
                  <!-- 折扣，满减，会员价 -->
                  <el-form :model="scope.row">
                    <el-row>
                      <el-col :span="24">
                        <el-form-item label="设置折扣">
                          <label>满</label>
                          <el-input-number style="width:160px" :min="0" controls-position="right"
                                           v-model="scope.row.fullCount"></el-input-number>
                          <label>件</label>
                          <label style="margin-left:15px;">打</label>
                          <el-input-number style="width:160px" v-model="scope.row.discount" :precision="2" :max="1"
                                           :min="0" :step="0.01" controls-position="right"></el-input-number>
                          <label>折</label>
                          <el-checkbox v-model="scope.row.countStatus" :true-label="1" :false-label="0">可叠加优惠
                          </el-checkbox>
                        </el-form-item>
                      </el-col>
                      <el-col :span="24">
                        <el-form-item label="设置满减">
                          <label>满</label>
                          <el-input-number style="width:160px" v-model="scope.row.fullPrice" :step="100" :min="0"
                                           controls-position="right"></el-input-number>
                          <label>元</label>
                          <label style="margin-left:15px;">减</label>
                          <el-input-number style="width:160px" v-model="scope.row.reducePrice" :step="10" :min="0"
                                           controls-position="right"></el-input-number>
                          <label>元</label>
                          <el-checkbox v-model="scope.row.priceStatus" :true-label="1" :false-label="0">可叠加优惠
                          </el-checkbox>
                        </el-form-item>
                      </el-col>
                      <el-col :span="24">
                        <el-form-item label="设置会员价" v-if="scope.row.memberPrice.length>0">
                          <br/>
                          <!--   @change="handlePriceChange(scope,mpidx,$event)" -->
                          <el-form-item v-for="(mp,mpidx) in scope.row.memberPrice" :key="mp.id">
                            {{ mp.name }}
                            <el-input-number style="width:160px" v-model="scope.row.memberPrice[mpidx].price"
                                             :precision="2" :min="0" controls-position="right"></el-input-number>
                          </el-form-item>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-form>
                </template>
              </el-table-column>
            </el-table>
            <div style="margin:auto;margin-top: 2%;">
              <el-button type="primary" @click="step = 2">上一步</el-button>
              <el-button type="success" @click="submitSkus">下一步：保存商品信息</el-button>
            </div>
          </el-card>
        </el-card>
      </el-col>

      <el-col :span="24" v-show="step===4">
        <el-card class="box-card" style="width:80%;margin:20px auto">
          <h1>保存成功</h1>
          <el-button type="primary" @click="addAgian">继续添加</el-button>
        </el-card>
      </el-col>

    </el-row>
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
import CategoryCascader from '../common/category-cascader'
import BrandSelect from '../common/brand-select'
import MultiUpload from '@/components/upload/multiUpload'

export default {
  // import引入的组件需要注入到对象中才能使用
  // TODO 此处级联在只有在刷新页面时才会重新加载
  components: {CategoryCascader, BrandSelect, MultiUpload},
  props: {},
  data () {
    return {
      pageIndex: 1,
      pageSize: 10,
      catPathSub: null,
      brandIdSub: null,
      uploadDialogVisible: false,
      uploadImages: [],
      step: 0,
      // spu_name  spu_description  catalog_id  brand_id  weight  publish_status
      spu: {
        // 要提交的数据
        spuName: '', // SPU名字
        spuDesc: '', // SPU描述
        categoryId: 0, // 分类
        brandId: '', // 品牌
        weight: '', // 重量
        publishStatus: 0, // 商家状态
        descImgs: [], // 商品介绍图集
        detailImgs: [], // 商品详情图集，最后sku也可以新增
        bounds: { // 积分
          buyBounds: 0, // 购物积分
          growBounds: 0 // 成长积分
        },
        baseAttributes: [], // 基本属性
        skuInfos: [] // 所有sku信息
      },
      spuBaseInfoRules: {
        spuName: [
          {required: true, message: '请输入商品名字', trigger: 'blur'}
        ],
        spuDesc: [
          {required: true, message: '请编写一个简单描述', trigger: 'blur'}
        ],
        categoryId: [
          {required: true, message: '请选择一个分类', trigger: 'blur'}
        ],
        brandId: [
          {required: true, message: '请选择一个品牌', trigger: 'blur'}
        ]
        // descImgs: [
        //   {required: true, message: '请上传商品详情图集', trigger: 'blur'}
        // ],
        // detailImgs: [
        //   {required: true, message: '请上传商品图片集', trigger: 'blur'}
        // ],
        // weight: [{type: 'number', required: true, message: '请填写正确的重量值', trigger: 'blur'}
        // ]
      },
      dataResp: {
        // 后台返回的所有数据
        attrGroups: [],
        baseAttributes: [],
        saleAttrs: [],
        tempSaleAttrs: [],
        tableAttrColumn: [],
        memberLevels: [],
        steped: [false, false, false, false, false]
      },
      inputVisible: [],
      inputValue: []
    }
  },
  // 计算属性 类似于data概念
  computed: {},
  // 监控data中的数据变化
  watch: {
    uploadImages (val) {
      // 扩展每个skuInfos里面的imgs选项
      let imgArr = Array.from(new Set(this.spu.detailImgs.concat(val)))

      // {imgUrl:"",defaultImg:0} 由于concat每次迭代上次，有很多重复。所以我们必须得到上次+这次的总长
      this.spu.skuInfos.forEach((item, index) => {
        let len = imgArr.length - this.spu.skuInfos[index].detailImgs.length // 还差这么多
        if (len > 0) {
          let imgs = new Array(len)
          imgs = imgs.fill({imgUrl: '', defaultImg: 0})
          this.spu.skuInfos[index].detailImgs = item.detailImgs.concat(imgs)
        }
      })

      this.spu.detailImgs = imgArr // 去重
      console.log('this.spu.skuInfos', this.spu.skuInfos)
    }
  },
  methods: {
    // 查询 会员等级分页列表
    getMemberLevels () {
      this.$http({
        url: this.$http.adornUrl('/member/memberlevel/page'),
        method: 'post',
        data: this.$http.adornData({
          page: this.pageIndex,
          size: this.pageSize
        })
      }).then(({data}) => {
        console.log('查询 -----> 会员等级分页列表 -----> 请求路径: /member/memberlevel/page')
        console.log('查询 -----> 会员等级分页列表 -----> 返回结果:', data)
        this.dataResp.memberLevels = data.data.records
      }).catch(e => {
        console.log(e)
      })
    },
    // 查询 当前分类可以使用的规格参数
    getBaseAttributes () {
      if (!this.dataResp.steped[0]) {
        this.$http({
          url: this.$http.adornUrl(`/product/attribute/list/basic`),
          method: 'post',
          data: this.$http.adornData({
            type: 0,
            categoryId: this.spu.categoryId
          })
        }).then(({data}) => {
          console.log('查询 -----> 当前分类可以使用的规格参数 -----> 请求路径: /product/attribute/list/basic')
          console.log('查询 -----> 当前分类可以使用的规格参数 -----> 返回结果:', data)
          // 先对表单的baseAttributes进行初始化
          data.data.forEach(item => {
            let attrArray = []
            item.attributeList.forEach(attr => {
              attrArray.push({
                attributeId: attr.attributeId,
                valueList: '',
                quickShow: attr.quickShow
              })
            })
            this.dataResp.baseAttributes.push(attrArray)
          })
          this.dataResp.steped[0] = 0
          this.dataResp.attrGroups = data.data
        })
      }
    },
    // 查询 当前分类可以使用的销售属性
    getSalesAttributes () {
      if (!this.dataResp.steped[1]) {
        this.$http({
          url: this.$http.adornUrl(`/product/attribute/list/sales`),
          method: 'post',
          data: this.$http.adornData({
            type: 1,
            categoryId: this.spu.categoryId
          })
        }).then(({data}) => {
          console.log('查询 -----> 当前分类可以使用的销售属性 -----> 请求路径: /product/attribute/list/sales')
          console.log('查询 -----> 当前分类可以使用的销售属性 -----> 返回结果:', data)
          this.dataResp.saleAttrs = data.data
          data.data.forEach(item => {
            this.dataResp.tempSaleAttrs.push({
              attributeId: item.attributeId,
              valueList: [],
              attributeName: item.attributeName
            })
            this.inputVisible.push({view: false})
            this.inputValue.push({val: ''})
          })
          this.dataResp.steped[1] = true
        })
      }
    },
    generateSkuList () {
      this.step = 3

      // 根据笛卡尔积运算进行生成sku
      let selectValues = []
      this.dataResp.tableAttrColumn = []
      this.dataResp.tempSaleAttrs.forEach(item => {
        if (item.valueList.length > 0) {
          selectValues.push(item.valueList)
          this.dataResp.tableAttrColumn.push(item)
        }
      })
      console.log('选中的SKU参数列表：', JSON.stringify(selectValues))

      // [
      //    ["黑色","6GB","移动"],["黑色","6GB","联通"],["黑色","8GB","移动"],["黑色","8GB","联通"],
      //    ["白色","6GB","移动"],["白色","6GB","联通"],["白色","8GB","移动"],["白色","8GB","联通"],
      //    ["蓝色","6GB","移动"],["蓝色","6GB","联通"],["蓝色","8GB","移动"],["蓝色","8GB","联通"]
      // ]
      let descartes = this.descartes(selectValues)
      console.log('生成的SKU组合列表：', JSON.stringify(descartes))
      // 有多少descartes就有多少sku
      let skuInfos = []

      descartes.forEach((descar, descaridx) => {
        let attrArray = [] // sku属性组
        descar.forEach((de, index) => {
          // 构造saleAttr信息
          let saleAttrItem = {
            attributeId: this.dataResp.tableAttrColumn[index].attributeId,
            attributeName: this.dataResp.tableAttrColumn[index].attributeName,
            attrValue: de
          }
          attrArray.push(saleAttrItem)
        })
        // 先初始化几个images，后面的上传还要加
        let imgs = []
        this.spu.detailImgs.forEach((img, idx) => {
          imgs.push({imgUrl: '', defaultImg: 0})
        })
        // 会员价，也必须在循环里面生成，否则会导致数据绑定问题
        let memberPrices = []
        if (this.dataResp.memberLevels.length > 0) {
          for (let i = 0; i < this.dataResp.memberLevels.length; i++) {
            if (this.dataResp.memberLevels[i].priviledgeMemberPrice === 1) {
              memberPrices.push({
                id: this.dataResp.memberLevels[i].id,
                name: this.dataResp.memberLevels[i].name,
                price: 0
              })
            }
          }
        }
        // descaridx，判断如果之前有就用之前的值;
        let res = this.hasAndReturnSku(this.spu.skuInfos, descar)
        if (res === null) {
          skuInfos.push({
            skuName: this.spu.spuName + ' ' + descar.join(' '), // sku名称
            skuTitle: this.spu.spuName + ' ' + descar.join(' '), // 标题
            skuSubTitle: '', // 副标题
            price: 0, // 价格
            fullPrice: 0.0, // 满多少
            reducePrice: 0.0, // 减多少
            priceStatus: 0, // 是否参与其他优惠
            fullCount: 0, // 满几件
            discount: 0, // 打几折
            countStatus: 0, // 是否参与其他优惠
            attr: attrArray, // sku属性
            images: imgs,
            descar: descar,
            memberPrice: [].concat(memberPrices)
          })
        } else {
          skuInfos.push(res)
        }
      })
      this.spu.skuInfos = skuInfos
      console.log('SKU列表：', this.spu.skuInfos, this.dataResp.tableAttrColumn)
    },
    // 笛卡尔积运算 TODO 此处有BUG 生成的SKU组合会少
    descartes (list) {
      // parent上一级索引;count指针计数
      var point = {}
      var result = []
      var pIndex = null
      var tempCount = 0
      var temp = []

      // 根据参数列生成指针对象
      for (var index in list) {
        if (typeof list[index] === 'object') {
          point[index] = {parent: pIndex, count: 0}
          pIndex = index
        }
      }

      // 单维度数据结构直接返回
      if (pIndex == null) {
        return list
      }

      // 动态生成笛卡尔积
      while (true) {
        for (var item in list) {
          tempCount = point[item]['count']
          temp.push(list[item][tempCount])
        }

        // 压入结果数组
        result.push(temp)
        temp = []

        // 检查指针最大值问题
        while (true) {
          if (point[index]['count'] + 1 >= list[index].length) {
            point[index]['count'] = 0
            pIndex = point[index]['parent']
            if (pIndex == null) {
              return result
            }

            // 赋值parent进行再次检查
            index = pIndex
          } else {
            point[index]['count']++
            break
          }
        }
      }
    },
    submitSkus () {
      console.log('~~~~~', JSON.stringify(this.spu))
      this.$confirm('将要提交商品数据，需要一小段时间，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/product/spuinfo/save'),
          method: 'post',
          data: this.$http.adornData(this.spu, false)
        }).then(({data}) => {
          console.log('新增 -----> Spu信息 -----> 请求路径: /product/spuinfo/save')
          console.log('新增 -----> Spu信息 -----> 返回结果:', data)
          if (data.code === 200000) {
            this.$message({
              type: 'success',
              message: '新增商品成功!'
            })
            this.step = 4
          } else {
            this.$message({
              type: 'error',
              message: '保存失败，原因【' + data.msg + '】'
            })
          }
        })
      })
        .catch(e => {
          console.log(e)
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    },
    addAgian () {
      this.step = 0
      this.resetSpuData()
    },
    resetSpuData () {
      this.spu = {
        spuName: '',
        spuDesc: '',
        categoryId: 0,
        brandId: '',
        weight: '',
        publishStatus: 0,
        descImgs: [],
        detailImgs: [],
        bounds: {
          buyBounds: 0,
          growBounds: 0
        },
        baseAttributes: [],
        skuInfos: []
      }
    },
    // ========================================== 以下命名未统一 ====================

    handlePriceChange (scope, mpidx, e) {
      this.spu.skuInfos[scope.$index].memberPrice[mpidx].price = e
    },

    showInput (idx) {
      console.log('``````', this.view)
      this.inputVisible[idx].view = true
      // this.$refs['saveTagInput'+idx].$refs.input.focus();
    },
    checkDefaultImg (row, index, img) {
      console.log('默认图片', row, index)
      // 这个图片被选中了，
      row.images[index].imgUrl = img // 默认选中
      row.images[index].defaultImg = 1 // 修改标志位;
      // 修改其他人的标志位
      row.images.forEach((item, idx) => {
        if (idx !== index) {
          row.images[idx].defaultImg = 0
        }
      })
    },
    handleInputConfirm (idx) {
      let inputValue = this.inputValue[idx].val
      if (inputValue) {
        // this.dynamicTags.push(inputValue);
        if (this.dataResp.saleAttrs[idx].valueList === '') {
          this.dataResp.saleAttrs[idx].valueList = inputValue
        } else {
          this.dataResp.saleAttrs[idx].valueList += ';' + inputValue
        }
      }
      this.inputVisible[idx].view = false
      this.inputValue[idx].val = ''
    },
    collectSpuBaseInfo () {
      // spuBaseForm
      this.$refs.spuBaseForm.validate(valid => {
        if (valid) {
          this.step = 1
          this.getBaseAttributes()
        } else {
          return false
        }
      })
    },
    generateSaleAttrs () {
      // 把页面绑定的所有attr处理到spu里面,这一步都要做
      this.spu.baseAttributes = []
      this.dataResp.baseAttributes.forEach(item => {
        item.forEach(attr => {
          let {attributeId, valueList, quickShow} = attr
          // 跳过没有录入值的属性
          if (valueList !== '') {
            if (valueList instanceof Array) {
              // 多个值用;隔开
              valueList = valueList.join(';')
            }
            this.spu.baseAttributes.push({attributeId, valueList, quickShow})
          }
        })
      })
      console.log('baseAttributes', this.spu.baseAttributes)
      this.step = 2
      this.getSalesAttributes()
    },
    // 判断如果包含之前的sku的descar组合，就返回这个sku的详细信息；
    hasAndReturnSku (skus, descar) {
      let res = null
      if (skus.length > 0) {
        for (let i = 0; i < skus.length; i++) {
          if (skus[i].descar.join(' ') === descar.join(' ')) {
            res = skus[i]
          }
        }
      }
      return res
    }

  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created () {
  },
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted () {
    this.catPathSub = this.PubSub.subscribe('catPath', (msg, val) => {
      this.spu.categoryId = val[val.length - 1]
    })
    this.brandIdSub = this.PubSub.subscribe('brandId', (msg, val) => {
      this.spu.brandId = val
    })
    this.getMemberLevels()
  },
  beforeCreate () {
  }, // 生命周期 - 创建之前
  beforeMount () {
  }, // 生命周期 - 挂载之前
  beforeUpdate () {
  }, // 生命周期 - 更新之前
  updated () {
  }, // 生命周期 - 更新之后
  beforeDestroy () {
    this.PubSub.unsubscribe(this.catPathSub)
    this.PubSub.unsubscribe(this.brandIdSub)
  }, // 生命周期 - 销毁之前
  destroyed () {
  }, // 生命周期 - 销毁完成
  activated () {
  } // 如果页面有keep-alive缓存功能，这个函数会触发
}
</script>

<style scoped>

</style>
