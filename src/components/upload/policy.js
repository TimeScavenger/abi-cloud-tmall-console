import http from '@/utils/httpRequest.js'

export function policy () {
  return new Promise((resolve, reject) => {
    http({
      url: http.adornUrl('/basic/aliyunoss/policy'),
      method: 'get',
      params: http.adornParams({})
    }).then(({data}) => {
      resolve(data)
    })
  })
}
