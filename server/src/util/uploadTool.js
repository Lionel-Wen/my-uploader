const path = require('path');
const multipartry = require('multiparty');
const fs = require('fs');
const HOST = 'http://127.0.0.1';
const FONTHOSTNAME = `${HOST}:${8888}`; // 前端起的服务
// 延迟函数
const delay = function (interval) {
    typeof interval !== 'number' ? interval === 1000 : interval;
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, interval);
    });
};

// 基于multiparty插件实现文件上传处理 & form-data解析
const uploadDir = path.resolve(__dirname, '../../upload');
const baseDir = path.resolve(__dirname, '../../../');
const multipartry_load = function (req, auto) {
    console.log({uploadDir,baseDir});
    typeof auto !== 'boolean' ? (auto = false) : null;
    let config = {
        maxFieldsSize: 200 * 1024 * 1024,
    };
    if (auto) config.uploadDir = uploadDir;
    return new Promise(async (resolve, reject) => {
        await delay(); //
        // 用来将客户端formData 结果解析
        new multipartry.Form(config).parse(req, (err, fields, files) => {
            if (err) {
                console.log({err})
                reject(err);
                return;
            }
            resolve({
                fields,
                files,
            });
        });
    });
};

// 检测文件是否已经存在
const exists = function (path) {
    return new Promise((resolve) => {
        fs.access(path, fs.constants.F_OK, (err) => {
            if (err) resolve(false);
            return resolve(true);
        });
    });
};

// 创建文件并写入到指定的目录 & 返回客户端结果
const writeFile = function (res, path, file, filename, stream) {
    return new Promise((resolve, reject) => {
        if (stream) {
        }
        console.log("fs.writeFile");
        console.log({
            path,
            file
        })
        fs.writeFile(path, file, (err) => {
            if (err) {
                reject(err);
                res.send({
                    code: 1,
                    codeText: err,
                });
                return;
            }
            resolve();
            res.send({
                code: 0,
                codeText: '上传成功',
                filename: filename,
                url: path.replace(baseDir, FONTHOSTNAME),
            });
        });
    });
};

// 大文件上传 & 合并切片
const merge = (HASH, count) => {
    return new Promise( async (resolve, reject) => {
        let path = `${uploadDir}/${HASH}`
        let fileList = []
        let suffix
        let isExists = await exists(path); // 判断文件是否存在
        if(!isExists) {
            reject('HASH path  is not found!')
            return
        }
        fileList = fs.readdirSync(path);
        if (fileList.length < count) {
            reject('the slice has not been uploaded!')
            return
        }
        fileList.sort((a, b) => {
            let reg = /_(\d+)/;
            return reg.exec(a)[1] - reg.exec(b)[1];
        }).forEach(item => {
            !suffix ? suffix = /\.([0-9a-zA-Z]+)$/.exec(item)[1] : null // 处理文件后缀
            fs.appendFileSync(`${uploadDir}/${HASH}.${suffix}`, fs.readFileSync(`${path}/${item}`));
            fs.unlinkSync(`${path}/${item}`);
        })
        fs.rmdirSync(path) // 删除临时文件夹
        resolve({
            path: `${uploadDir}/${HASH}.${suffix}`,
            filename: `${HASH}.${suffix}`
        })
    })
}


export {
    delay,
    multipartry_load,
    exists,
    merge,
    writeFile
}