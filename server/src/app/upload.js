
// 导入公共方法
import {
    delay,
    writeFile,
    multipartry_load,
    merge,
    exists
} from '../util/uploadTool'
var express = require('express');
var router = express.Router();
const fs = require('fs');
const bodyParser = require('body-parser');
import SparkMD5 from 'spark-md5';
// const SparkMD5 = require('spark-md5');
const path = require('path');
const HOST = 'http://127.0.0.1';
const FONTHOSTNAME = `${HOST}:${8888}`; // 前端起的服务
const uploadDir = path.resolve(__dirname, '../../upload');
const baseDir = path.resolve(__dirname, '../../../');
// const uploadDir = `${__dirname}/upload`;
// const baseDir = path.resolve(__dirname, '../../../');
console.log(uploadDir,baseDir)
// 该路由使用的中间件

// router.use(
//     bodyParser.urlencoded({
//         extended: false,
//         limit: '1024mb',
//     })
// );

router.use(function timeLog(req, res, next) { 
    // bodyParser.urlencoded({
    //   extended: false,
    //   limit: '1024mb',
    // })
    // console.log(`req.url:${req.body}`);
    next();
});

// router.use(
//     bodyParser.urlencoded({
//     extended: false,
//     limit: '1024mb',
//   }));

router.post('/upload_single', async (req, res) => {
    console.log('-------------------upload_single')
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
    // console.log("-----------------------",req.body.filename)
    let file = req.body.file;
    let filename = req.body.filename;
    // console.log({file,filename});
    let spark = new SparkMD5.ArrayBuffer(); // 根据文件内容,生成一个hash名字
    let suffix = /\.([0-9a-zA-Z]+)$/.exec(filename)[1];
    let isExists = false;
    let path;
    file = decodeURIComponent(file);
    file = file.replace(/^data:image\/\w+;base64,/, '');
    file = Buffer.from(file, 'base64'); // 将base64转成正常的文件格式
    console.log({file});
    spark.append(file);
    path = `${uploadDir}/${spark.end()}.${suffix}`;
    console.log({path})
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
        console.log({fields,files,file,filename,path})
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


/**
 * 上传切片
 */
 router.post('/upload_chunk', async (req, res) => {
    console.log("/upload_chunk");
    try {
        const { fields, files } = await multipartry_load(req);
        const file = (files.file && files.file[0]) || {};
        const filename = (fields.filename && fields.filename[0]) || '';
        let path = ''
        let isExists = false;
        // 创建存放切片的临时目录
        const [, HASH] = /^([^_]+)_(\d+)/.exec(filename);
        path = `${uploadDir}/${HASH}`; // 用hash生成一个临时文件夹
        !fs.existsSync(path) ? fs.mkdirSync(path) : null; // 判断该文件夹是否存在，不存在的话，新建一个文件夹
        path = `${uploadDir}/${HASH}/${filename}`; // 将切片存到临时目录中
        console.log("chunkpath",path)
        isExists = await exists(path);
        if (isExists) {
            res.send({
                code: 0,
                codeText: 'file is already exists',
                url: path.replace(__dirname, FONTHOSTNAME),
            });
            return;
        }
        console.log("writeFile");
        writeFile(res, path, file, filename, true);
    } catch (e) {
        res.send({
            code: 1,
            codeText: e,
        });
    }
});

/**
 * 合并切片
 */
 router.post('/upload_merge', async (req, res) => {
    const { HASH, count } = req.body;
    try {
        const { filname, path } = await merge(HASH, count);
        res.send({
            code: 0,
            codeText: 'merge sucessfully',
            url: path.replace(baseDir, FONTHOSTNAME),
        });
    } catch (e) {
        res.send({
            code: 1,
            codeText: e,
        });
    }
});


router.post('/upload_already', async (req, res) => {
    let { HASH } = req.body;
    let path = `${uploadDir}/${HASH}`;
    let fileList = [];
    // 如果没有文件夹创建文件夹
    !fs.existsSync(path) ? fs.mkdirSync(path) : null;
    console.log({HASH,path,fileList})
    try {
        console.log("try")
        fileList = fs.readdirSync(path);
        console.log(233333333333)
        fileList = fileList.sort((a, b) => {
            let reg = /_(\d+)/;
            return reg.exec(a)[1] - reg.exec(b)[1]
        })
        res.send({
            code: 0,
            codeText: '',
            fileList
        })
    } catch (e) {
        console.log({e})
        res.send({
            code: 1,
            codeText: e,
            fileList
        })
    }
})

export default router;