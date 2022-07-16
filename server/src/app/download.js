var express = require('express');
var router = express.Router();

// 该路由使用的中间件
router.use(function timeLog(req, res, next) {
    console.log(`req.url:${req.url}`);
    // bodyParser.urlencoded({
    //   extended: false,
    //   limit: '1024mb',
    // })
    next();
});
router.post('/file', async (req, res) => {
    console.log('-------------------file')
    res.send({
        code: 0,
        codeText: '上传成功',
    });
});

export default router;