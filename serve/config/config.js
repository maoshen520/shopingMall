// 配置层

// 导入sequelize
let Sequelize = require('sequelize');

// Sequelize 条件操作
exports.Op = Sequelize.Op;


// 服务器配置
exports.serverOptions = {
    // 域名
    host:'http://127.0.0.1',

    // 端口
    port: 10002

}

// exports.serverOptions = serverOptions;

//数据库的配置
exports.mysqlOptions = {

    // 数据库名称
    database:'server',

    //数据库登录用户名
    user:'root',

    //数据库登录密码
    password:'1580134843',

    // 数据库连接地址
    host:'localhost',

    // 连接数据库类型
    dialect:'mysql'
}

//加盐配置
exports.saltOptions = {

    // 用户id加盐
    userIdSalt :'n_n',

    // 密码加盐
    pwdSalt:'kk_aa',

    // 验证码加盐
    codeSalt:'kk_code',

    // 用户登录加盐凭证
    userLoginSalt:'kk_login'


}

//发邮件配置
exports.emailOptions = {
    // 主机
    host:'smtp.126.com',

    // 端口
    port:25,

    // 发邮件地址
    user:'nyunmao@126.com',

    // 授权码
    pass:'sunshine0607'

}

// 商品类型配置
exports.productsTypeOptions = [
    {
        typeName:'remaiguoshu',
        typeTitle:'热卖果蔬',
        typeId:'remaiguoshu'
    },
    {
        typeName:'jingxuanshuiguo',
        typeTitle:'精选水果',
        typeId:'jingxuanshuiguo'
    },

    {
        typeName:'tianyuanshishu',
        typeTitle:'田园时蔬',
        typeId:'tianyuanshishu'
    },
    {
        typeName:'jingpinroulei',
        typeTitle:'精品肉类',
        typeId:'jingpinroulei'
    },
    {
        typeName:'liangyouzahuo',
        typeTitle:'粮油杂货',
        typeId:'liangyouzahuo'
    },
];

// 场景值配置
exports.sceneValues = {

    // 注册场景值
    register:{

        // 注册成功
        success:{
            code:1000,
            msg:'注册成功'
        },

        // 注册失败
        fail:{
            code:1001,
            msg:'注册失败'
        },

        // 邮箱已经被注册
        info:{
            code:1002,
            msg:'邮箱已被注册'
        }
    },


    // 登录场景值
    login:{

        // 登录成功
        success:{
            code:2000,
            msg:'登录成功'
        },

        // 登录失败
        fail:{
            code:2001,
            msg:'登录失败'
        },

        // 用户不存在
        info:{
            code:2002,
            msg:'用户不存在'
        },

        // 邮箱或密码不正确
        warn:{
            code:2003,
            msg:'邮箱或密码不正确'
        },

        // 用户未登陆
        noLogin:{
            code:2004,
            msg:'用户未登陆'
        },
        againLogin:{
            code:2005,
            msg:'请重新登陆'
        },
    },

    // 验证码场景值
    validCode:{

        // 发送验证码成功
        success:{
            code:3000,
            msg:'验证码验证成功'
        },

        // 发送验证码失败
        fail:{
            code:3001,
            msg:'验证码验证失败'
        },

    },

    // 发送验证码场景值
    sendEmail:{

        // 发送验证码成功
        success:{
            code:4000,
            msg:'邮箱验证码已发至您的邮箱'
        },

        // 发送验证码失败
        fail:{
            code:4001,
            msg:'获取邮箱验证码失败'
        },

    },

    // 修改密码
    changePwd:{
        // 修改密码成功
        success:{
            code:5000,
            msg:'修改密码成功'
        },

        // 修改密码失败
        fail:{
            code:5001,
            msg:'修改密码失败'
        },
    },

    // 商家上传商品
    uploadProductData:{
        // 商家上传商品成功
        success:{
            code:6000,
            msg:'商家添加商品成功'
        },

        // 商家上传图片失败
        imgfail:{
            code:6001,
            msg:'上传图片失败'
        },

        // 商家上传商品失败
        datafail:{
            code:6002,
            msg:'商家添加商品失败'
        },
    },


    // 查询商品类型数据
    getProductsType:{
        // 查询商品类型数据成功
        success:{
            code:7000,
            msg:'查询商品类型数据成功'
        },

        // 查询商品类型数据失败
        fail:{
            code:7001,
            msg:'查询商品类型数据失败'
        },
    },

    // 查询商品数据
    findData:{
        // 查询商品数据成功
        success:{
            code:8000,
            msg:'查询商品数据成功'
        },

        // 查询商品数据失败
        fail:{
            code:8001,
            msg:'查询商品数据失败'
        },
    },

    // 禁用商品
    disabledProduct:{
        success:{
            msg:'禁用商品成功',
            code:9000
        },
        fail:{
            msg:'禁用商品失败',
            code:9001
        }
    },

    // 跨域场景值
    origin:{
        fail:{
            msg:'请求不合法',
            code:10001
        }
    },

    // 发送短信场景
    sendMessage:{
        success:{
            msg:'短信验证码已发至您的手机，请查收',
            code:20000
        },
        fail:{
            msg:'获取短信验证码失败',
            code:20001
        }
    },

    // 购物车场景
    shopcart:{
        success:{
            msg:'添加购物车成功',
            code:21000
        },
        fail:{
            msg:'添加购物车失败',
            code:21001
        },
        info:{
            msg:'更新购物车商品数量成功',
            code:21002
        },
        warn:{
            msg:'更新购物车商品数量失败',
            code:21003
        },
        deleteSuccess:{
            msg:'删除购物车商品成功',
            code:21004
        },
        deleteFail:{
            msg:'删除购物车商品失败',
            code:21005
        },
    }


}

// 分页配置
exports.paginationOptions = {

    // 每次查询的数字，一页展示的数据
    count:2
}

// 阿里云发短信配置
exports.messageOption = {
    // 秘钥id
    accessKeyId:'LTAI4FgPPjBKykMnGNepJhvd',

    // 加密秘钥
    AccessKeySecret:'J5wHBFnwbU3WgMYidjQzgcTBRyIiO8',

    // 模板号
    templateCode:'SMS_181550533',

    // 签名
    signName:'果蔬商城'
   
}

// 允许请求跨域的白名单
exports.originListOptions = [
    'http://127.0.0.1:10001',
    'http://localhost:8080'
    
]




