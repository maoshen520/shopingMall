
// 导入sequelize
let Sequelize = require('sequelize');

// 定义模型，类似创建表结构
let Model = Sequelize.Model;

// 定义一个商家business数据表结构
class Order extends Model{}

//定义business表结构
Order.init({

    // 定义id字段
    id: {
        // 字段类型
        // INTEGET:整形，  UNSIGNED:无符号
        type:Sequelize.INTEGER.UNSIGNED,

        // 是否为空
        allowNull:false,

        // 自动递增
        autoIncrement:true,

        // 主键
        primaryKey:true,

        // 注释
        commit:'表的主键id'
    },

    // 订单id字段
    orderId:{
        // STRING:字符类型，40个字符
        type:Sequelize.STRING(30),
        allowNull:false,
        // 默认值
        defaultValue:'',
        comment:'订单id'
    },

    // 定义商品id字段
    productId:{
        // STRING:字符类型，40个字符
        type:Sequelize.STRING(30),
        allowNull:false,
        // 默认值
        defaultValue:'',
        comment:'商品id'
    },

    // 定义商品名称
    productName:{
        // STRING:字符类型，40个字符
        type:Sequelize.STRING(20),
        allowNull:false,
        // 默认值
        defaultValue:'',
        comment:'商品名称'
    },
    // 定义商品描述
    productDetail:{
        // STRING:字符类型，40个字符
        type:Sequelize.STRING(300),
        allowNull:false,
        // 默认值
        defaultValue:'',
        comment:'商品描述'
    },

    // 定义商品价格
    productPrice:{
        // STRING:字符类型，40个字符
        type:Sequelize.DECIMAL(10,2),
        allowNull:false,
        // 默认值
        defaultValue:'0',
        comment:'商品价格'
    },

    // 商品图片
    productImg:{
        type:Sequelize.STRING(40),
        allowNull:false,
        defaultValue:'',
        comment:'商品图片'
    },

    // 商品数量
    productCount:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue: 0,
        comment:'商品数量'
    },

    // 商品状态 0:未付款  1：代发货 2已发货 3已收货
    status:{
        type:Sequelize.STRING(30),
        allowNull:false,
        // 默认值
        defaultValue:'',
        comment:'商品状态 :未付款 代发货 已发货 已收货'
    },

    // 收货人地址
    address:{
        type:Sequelize.STRING(200),
        allowNull:false,
        defaultValue:'',
        comment:'收货人地址'
    },

    // 商家id
    businessId:{
        type:Sequelize.STRING(18),
        allowNull:false,
        defaultValue:1,
        comment:'商家id'
    },

    // 用户唯一id
    userId:{
        type:Sequelize.STRING(18),
        allowNull:false,
        defaultValue:'',
        comment:'用户唯一Id'
    },


},{

    // 模型名称
    modelName:'order',

    // 多个单词组合字段以_分割命名
    underscored:true,

    // 表的名称，如果没有定义表名称，则使用模型名称命名为表名称
    tableName:'order',
    
    // 创建updateAt,createAt字段
    timestamps:true,

    // 连接实例
    sequelize

})

// 创建shopcart表结构
// force:true,如果数据表存在，则先删除，在创建
// force:false, 如果数据表不存在，则创建
// Order.sync(): 创建表结构，该方法始终返回一个promise
Order.sync({force:false});

// 导出模型
module.exports = Order;
