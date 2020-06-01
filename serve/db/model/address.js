
// 导入sequelize
let Sequelize = require('sequelize');

// 定义模型，类似创建表结构
let Model = Sequelize.Model;

// 定义一个商家user数据表结构
class Address extends Model{}

//定义user表结构
Address.init({

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
    // 用户
    user:{
        type:Sequelize.STRING(11),
        allowNull:false,
        commit:'用户'
    },

    // 收货人姓名
    name:{
        // STRING:字符类型，40个字符
        type:Sequelize.STRING(30),
        allowNull:false,
        // 默认值
        defaultValue:'',
        comment:'收货人姓名'
    },

    // 收货人地址
    address:{
        type:Sequelize.STRING(200),
        allowNull:false,
        defaultValue:'',
        comment:'收货人地址'
    },

    // 邮政编码
    postal:{
        type:Sequelize.STRING(11),
        allowNull:false,
        commit:'邮政编码'
    },

    // 地址是否默认
    addressType:{
        type:Sequelize.INTEGER(1),
        allowNull:false,
        defaultValue:0,
        comment:'默认：1，0不默认'

    },

    // 收货人手机号
    phone:{
        type:Sequelize.STRING(11),
        allowNull:false,
        commit:'收货人手机号'
    },

},{

    // 模型名称
    modelName:'address',

    // 多个单词组合字段以_分割命名
    underscored:true,

    // 表的名称，如果没有定义表名称，则使用模型名称命名为表名称
    tableName:'address',
    
    // 创建updateAt,createAt字段
    timestamps:true,

    // 连接实例
    sequelize

})

// 创建user表结构
// force:true,如果数据表存在，则先删除，在创建
// force:false, 如果数据表不存在，则创建
// Address.sync(): 创建表结构，该方法始终返回一个promise
Address.sync({force:false});

// 导出模型
module.exports = Address;
