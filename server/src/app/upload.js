
// 导入公共方法
import {
    delay,
    writeFile,
    multipartry_load,
    merge,exists
} from '../util/uploadTool'
var express = require('express');
var router = express.Router();
const fs = require('fs');
const bodyParser = require('body-parser');

const SparkMD5 = require('spark-md5');
const path = require('path');
const HOST = 'http://127.0.0.1';
const FONTHOSTNAME = `${HOST}:${8888}`; // 前端起的服务
const uploadDir = path.resolve(__dirname, '../../upload');
const baseDir = path.resolve(__dirname, '../../../');
// const uploadDir = `${__dirname}/upload`;
// const baseDir = path.resolve(__dirname, '../../../');
console.log(uploadDir,baseDir)

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
        let { files, fields } = await multipartry_load(req, true);
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

router.post('/upload_single_base64', async (req, res) => {
    let file = req.body.file;
    let filename = req.body.filename;
    let spark = new SparkMD5.ArrayBuffer(); // 根据文件内容,生成一个hash名字
    let suffix = /\.([0-9a-zA-Z]+)$/.exec(filename)[1];
    let isExists = false;
    let path;
    file = decodeURIComponent(file);
    file = file.replace(/^data:image\/\w+;base64,/, '');
    file = Buffer.from(file, 'base64'); // 将base64转成正常的文件格式
    spark.append(file);
    path = `${uploadDir}/${spark.end()}.${suffix}`;
    await delay();
    // 检测是否存在
    isExists = await exists(path);
    if (isExists) {
        res.send({
            code: 0,
            codeText: 'file is exists',
            urlname: filename,
            url: path.replace(baseDir, FONTHOSTNAME),
        });
        return;
    }
    // fs.writeFile(res)
    writeFile(res, path, file, filename, false);
});


router.post('/upload_single_name', async (req, res) => {
    try {
        const { fields, files } = await multipartry_load(req);
        const file = (files.file && files.file[0]) || {};
        const filename = (fields.filename && fields.filename[0]) || '';
        const path = `${uploadDir}/${filename}`;
        let isExists = false;
        isExists = await exists(path);
        if (isExists) {
            res.send({
                code: 0,
                codeText: 'file is exists',
                url: path.replace(baseDir, FONTHOSTNAME),
            });
            return;
        }
        writeFile(res, path, file, filename, true);
    } catch (e) {
        res.send({
            code: 1,
            codeText: e,
        });
    }
});

export default router;