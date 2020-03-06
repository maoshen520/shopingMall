

// 导入路由控制器层
let routeController = require(__basename + '/route_controller/route_controller.js');

module.exports = app =>{

    //token拦截
    app.use(routeController.vliadToken);   

    //路由 ---在route_controller.js里注册
    app.post('/register',routeController.register)

    // 发邮件
    app.post('/sendEmail',routeController.sendEmail)

    // 登录
    app.post('/login',routeController.login)

    // 商家进入后台
    app.post('/business',routeController.business)

    //修改密码获取邮箱验证
    app.post('/changePwdGetEmail',routeController.changePwdGetEmail)

    //修改密码
    app.post('/changePwd',routeController.changePwd)

    //商家上传商品数据
    app.post('/uploadProductData',routeController.uploadProductData)

    //查询商品类型
    app.get('/productsType',routeController.getProductsType)

    // 查询商家的商品数据
    app.get('/findProjectData', routeController.findProjectData);

    // 禁用商品 isUser=0
    app.post('/disabledProductData', routeController.disabledProductData);

    
    // client-app
    // 获取短信验证码
    app.get('/getMessageCode',routeController.getMessageCode)

    // 客户端注册的下一步
    app.post('/registerNext',routeController.registerNext)

    // 客户端注册
    app.post('/appRegister',routeController.appRegister)

    // 获取app首页数据
    app.get('/appProduct',routeController.appProduct)

    // 获取商品详情数据
    app.get('/productDetail',routeController.productDetail)

    // 获取商品类型数据
    app.get('/getTypeData',routeController.getTypeData)

    // app登录
    app.post('/appLogin',routeController.appLogin)
    
    // 查询用户购物车数据
    app.get('/findShopcartData',routeController.findShopcartData)

    // 查询用户购物车数据
    app.post('/addShopcart',routeController.addShopcart)

    // 修改购物车中的商品数量
    app.post('/modifyShopcartCount',routeController.modifyShopcartCount)
    
    // 删除购物车商品
    app.post('/delectShopcartProduct',routeController.delectShopcartProduct)





}