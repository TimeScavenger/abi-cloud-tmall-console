<template>
  <div>
    <el-upload
      action="https://tmall-master.oss-cn-shanghai.aliyuncs.com"
      :data="dataObj"
      list-type="picture"
      :multiple="false"
      :show-file-list="showFileList"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-preview="handlePreview">
      <el-button size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="fileList[0].url" alt="" class="showPic">
    </el-dialog>
  </div>
</template>
<script>
import {policy} from './policy'
import {getUUID} from '@/utils'

export default {
  name: 'singleUpload',
  props: {
    value: String
  },
  computed: {
    imageUrl () {
      return this.value
    },
    imageName () {
      if (this.value != null && this.value !== '') {
        return this.value.substr(this.value.lastIndexOf('/') + 1)
      } else {
        return null
      }
    },
    fileList () {
      return [{
        name: this.imageName,
        url: this.imageUrl
      }]
    },
    showFileList: {
      get: function () {
        return this.value !== null && this.value !== '' && this.value !== undefined
      },
      set: function (newValue) {
      }
    }
  },
  data () {
    return {
      dataObj: {
        policy: '',
        signature: '',
        name: '',
        dirAndName: '',
        key: '',
        ossaccessKeyId: '',
        dir: '',
        host: ''
        // callback:'',
      },
      dialogVisible: false
    }
  },
  methods: {
    emitInput (val) {
      this.$emit('input', val)
    },
    handleRemove (file, fileList) {
      this.emitInput('')
    },
    handlePreview (file) {
      this.dialogVisible = true
    },
    beforeUpload (file) {
      // 对上传的图片类型进行判断
      const isImage = file.type.includes('image')
      if (!isImage) {
        return this.$message.error('上传文件类型必须是图片!')
      }
      // 对上传的图片大小进行判断
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        return this.$message.error('上传图片大小不能超过 2MB!')
      }
      // 获取到图片的扩展名信息
      const flieArr = file.type.split('/')
      const suffix = flieArr[flieArr.length - 1]

      // 向服务端发送请求，拿到上传图片的秘钥以及目录信息
      let _self = this
      return new Promise((resolve, reject) => {
        policy().then(response => {
          console.log('响应的数据111', response)
          _self.dataObj.policy = response.data.policy
          _self.dataObj.signature = response.data.signature
          _self.dataObj.ossaccessKeyId = response.data.accessid
          // _self.dataObj.key = response.data.dir + getUUID() + '_${filename}'
          _self.dataObj.dir = response.data.dir
          _self.dataObj.name = getUUID() + '.' + suffix
          _self.dataObj.key = response.data.dir + _self.dataObj.name
          _self.dataObj.host = response.data.host
          console.log('响应的数据222。。。', _self.dataObj)
          resolve(true)
          // eslint-disable-next-line handle-callback-err
        }).catch(err => {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(false)
        })
      })
    },
    handleUploadSuccess (res, file) {
      // TODO 此处添加方法，将图片名称文件传输给后端服务器，存储到数据库，同时添加定时任务，定时清理oss中的垃圾图片
      this.showFileList = true
      this.fileList.pop()
      this.fileList.push({
        name: this.dataObj.name,
        // url: this.dataObj.host + '/' + this.dataObj.key.replace('${filename}', file.name)
        url: this.dataObj.host + '/' + this.dataObj.key
      })
      this.emitInput(this.fileList[0].url)
      console.log('上传成功...', this.fileList)
    }
  }
}
</script>
<style>
.el-upload-list--picture .el-upload-list__item-thumbnail {
  width: 102px;
  height: 36px;
}

.el-upload-list--picture .el-upload-list__item {
  padding: 10px 10px 10px 90px;
  height: 58px;
}

.el-upload-list--picture .el-upload-list__item.is-success .el-upload-list__item-name {
  line-height: 36px;
}
</style>


