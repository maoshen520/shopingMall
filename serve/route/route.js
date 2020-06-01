

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

    // 查询商家已被购买的商品数据
    app.get('/findSoldProjectData', routeController.findSoldProjectData);

    // 禁用商品 isUser=0
    app.post('/disabledProductData', routeController.disabledProductData);

    // 启用商品 isUser=0
    app.post('/enableProductData', routeController.enableProductData);

    // 发货商品 
    app.post('/soldProductData', routeController.soldProductData);

    // 删除商品 
    app.post('/delectProduct', routeController.delectProduct);

    // 查看商品 
    app.post('/seeProduct', routeController.seeProduct);

    
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

    // 查询用户信息
    app.post('/findUserData',routeController.findUserData)

    // 添加地址
    app.post('/address',routeController.address)

    // 查询地址
    app.get('/findAddress',routeController.findAddress)

    // 修改默认地址
    app.post('/defaultAddress',routeController.defaultAddress)

    // 修改为普通地址
    app.post('/nodefaultAddress',routeController.nodefaultAddress)

    // 确认支付创建订单链接
    app.post('/createOrderURL',routeController.createOrderURL)

    // 确认支付创建订单
    app.get('/createOrder',routeController.createOrder)

    // 订单查询
    app.get('/verifyData',routeController.verifyData)

    // 支付成功
    app.post('/successPay',routeController.successPay)

    // 待付款
    app.get('/waitPayData',routeController.waitPayData)

    // 全部订单
    app.get('/allOrder',routeController.allOrder)
    
    // 其他类型订单
    app.get('/typeOrder',routeController.typeOrder)

    // 立即付款
    app.get('/againCreateOrder',routeController.againCreateOrder)

    // 删除订单表中重新付款的商品
    app.post('/delectOrder',routeController.delectOrder)

    // 确认收货
    app.post('/received',routeController.received)

    // 我的页面的用户数据
    app.post('/mineUser',routeController.mineUser)







}