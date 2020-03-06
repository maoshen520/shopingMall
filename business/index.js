
//导入express
let express = require('express');

//导入处理路径模块
let path = require('path')

//实例化
let app = express();

//设置静态文件目录
app.use(express.static('assets'));

//设置视图目录
app.set('views',path.resolve(__dirname,'views'));

// 设置视图引擎
app.set('view engine','ejs');

//路由
app.get('/', (req,res) => {
    //req:请求对象
    // res：响应对象

    // 智能返回任何数据类型
    // 响应数据
    // res.send({status:200,msg:'成功'})

    res.render('index')
})

app.get('/register', (req,res) => {
    res.render('register')
})
app.get('/login', (req,res) => {
    res.render('login')
})
app.get('/changePassword', (req,res) => {
    res.render('changePassword')
})

// 监听端口
app.listen(10001, () => {

    console.log('the server running on http://127.0.0.1:10001');

})