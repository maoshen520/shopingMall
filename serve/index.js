// 基于index.js设置基础路径
global.__basename = __dirname;

// 导入配置（全局）
global.config = require(__basename + '/config/config.js')

// 导入express
let express = require('express');

// 导入解析post请求体模块
let bodyParser = require('body-parser');

// // 导入sequelize模块
// let Sequeline = require('sequelize');

// 导入路由文件
let route = require(__basename + '/route/route.js');

// 连接数据库
global.sequelize = require(__basename + '/db/db_config/db_config.js')

// 初始化所有数据表结构
global.Model = require(__basename + '/db/model/model.js')

// 实例化
let app = express();

// 设置静态目录，并且添加路径前缀,图片的
app.use('/assets', express.static('upload'))


//解析post请求体
// extended:false 表示可以接受任何数据类型的请求体
app.use(bodyParser.urlencoded({
    extended:false,

    // 允许post请求体最大大小为5M
    limit:1024 * 5 + 'kb'

}));

// //创建数据库连接
// // server：数据库名称    root：连接数据库名称   连接的数据库的密码
// let sequelize = new Sequeline('server', 'root', '1580134843',{
//     // 数据库地址
//     host:'localhost',

//     // 连接数据库类型
//     dialect:'mysql'
// });

// // 定义模型，类似创建表结构
// let Model = Sequeline.Model;

// // 定义一个商家的business数据表结构
// class Business extends Model {}


// 跨域请求配置
// *：任何路径，任何请求路径都必须经过app.all 中间件
app.all('*',(req, res, next) => {
    // next主要控制是否允许通过

    // console.log('req.headers ==>',req.headers)
    // console.log('req.headers.origin ==>',req.headers.origin);
    // console.log('config.originListOptions.indexOf(req.headers.origin ==>',config.originListOptions.indexOf(req.headers.origin));

    if(config.originListOptions.indexOf(req.headers.origin) === -1){
        console.log('不允许跨域请求')
        return res.send({msg:config.sceneValues.origin.fail.msg,status:config.sceneValues.origin.fail.code})
    }

    // *：任何域都可以访问
    // res.header("Access-Control-Allow-Origin","*")
    // res.header("Access-Control-Allow-Origin","http://127.0.0.1:10001");
    res.header("Access-Control-Allow-Origin",req.headers.origin);

    //如果浏览器请求包括Access-Control-Request-Headers字段，则Access-Control-Allow-Headers字段是必需的。它也是一个逗号分隔的字符串，表明服务器支持的所有头信息字段，不限于浏览器在"预检"中请求的字段。
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    //该字段必需，它的值是逗号分隔的一个字符串，表明服务器支持的所有跨域请求的方法。注意，返回的是所有支持的方法，而不单是浏览器请求的那个方法。这是为了避免多次"预检"请求。
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");

    //该字段可选。它的值是一个布尔值，表示是否允许发送Cookie。默认情况下，Cookie不包括在CORS请求之中。设为true，即表示服务器明确许可，Cookie可以包含在请求中，一起发给服务器。这个值也只能设为true，如果服务器不要浏览器发送Cookie，删除该字段即可
    res.header('Access-Control-Allow-Credentials', true);

    console.log('允许通过');

    //允许通过
    next()
})

// 执行路由
route(app);

//404处理
app.use((req,res) => {
    res.status = 404;
    res.send('找不到资源');
})

// 500处理
app.use((err, req, res) => {
    res.status = 500;
    res.send({msg:'后台服务器程序出错', statusCode:500})
})


// // 路由
// app.post('/register',(req, res) => {
//     // 截取GET请求查询参数
//     // console.log('req.query ==>',req.query);

//     // 截取POST请求体
//     console.log('req.body ==>',req.body);
//     res.send({msg:'请求成功', type:'post'});

// })


// 监听端口
// app.listen(10002, () => {
//     console.log('the server running on http://127.0.0.1:10002');
// })
app.listen(config.serverOptions.port, () => {
    console.log(`the server running on ${config.serverOptions.host}:${config.serverOptions.port}`);
})