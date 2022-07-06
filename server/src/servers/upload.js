
// 导入公共方法
import {delay,writeFile,multipartry_load,merge,exists} from '../util/uploadTool'
var express = require('express');
var router = express.Router();
const fs = require('fs');
const bodyParser = require('body-parser');

const SparkMD5 = require('spark-md5');
const path = require('path');
const HOST = 'http://127.0.0.1';
const FONTHOSTNAME = `${HOST}:${8000}`; // 前端起的服务



// 该路由使用的中间件
router.use(function timeLog(req, res, next) {
  console.log(`req.url:${req.url}`);
  bodyParser.urlencoded({
    extended: false,
    limit: '1024mb',
  })
  next();
});

router.post('/upload_single', async (req, res) => {
    try {
        console.log('Time22: ', Date.now());
        let { files, fields } = await multipartry_load(req, true);
        console.log('Time33: ', Date.now());
        let file = (files.file && files.file[0]) || {};
        res.send({
            code: 0,
            codeText: '上传成功',
            originFilename: file.originFilename,
            url: file.path.replace(baseDir, FONTHOSTNAME),
        });
    } catch (err) {
        res.send({
            code: 1,
            codeText: err,
        });
    }
});

// module.exports =  router;
export default router;