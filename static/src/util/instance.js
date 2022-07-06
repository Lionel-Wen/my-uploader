import axios from 'axios';
import qs from 'qs'
axios.defaults.baseURL = 'http://127.0.0.1:8888';
axios.defaults.headers['Content-Type'] = 'multipart/form-data'
let instance = axios.create();
instance.interceptors.request.use(config => {
    // 给请求头加上Authorization,authJWT的字段,值为token
    config.headers['Content-Type'] = 'multipart/form-data'
    return config
})

instance.defaults.transformRequest = (data, headers) => {
    const contentType = headers['Content-Type']
    if (contentType === 'application/x-www-form-urlencoded') {
        return qs.stringify(data) // 传递参数格式
    }
    return data    
}

instance.interceptors.response.use(response => {
    return response.data
},err => {
    // 请求失败统一返回
    return Promise.reject(err)
})


export default instance;