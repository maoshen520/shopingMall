
// 导入sequelize
let Sequelize = require('sequelize');

// 定义模型，类似创建表结构
let Model = Sequelize.Model;

// 定义一个商家business数据表结构
class Business extends Model{}

//定义business表结构
Business.init({

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

    // 定义用户名
    username:{
        // STRING:字符类型，40个字符
        type:Sequelize.STRING(30),
        allowNull:false,
        // 默认值
        defaultValue:'',
        comment:'用户名称'
    },

    // 用户邮箱
    userEmail:{
        type:Sequelize.STRING(40),
        allowNull:false,
        defaultValue:'',
        comment:'用户邮箱'
    },

    // 密码
    password:{
        type:Sequelize.STRING(32),
        allowNull:false,
        defaultValue:'',
        comment:'用户密码'
    },

    // 用户唯一id
    userId:{
        type:Sequelize.STRING(18),
        allowNull:false,
        defaultValue:'',
        comment:'用户唯一Id'
    },

    // 用户手机号
    phone:{
        type:Sequelize.STRING(11),
        allowNull:true,
        commit:'用户手机号'
    },

    // 用户身份证号
    idcard:{
        type:Sequelize.STRING(18),
        allowNull:true,
        commit:'用户身份证号'
    },

},{

    // 模型名称
    modelName:'business',

    // 多个单词组合字段以_分割命名
    underscored:true,

    // 表的名称，如果没有定义表名称，则使用模型名称命名为表名称
    tableName:'business',
    
    // 创建updateAt,createAt字段
    timestamps:true,

    // 连接实例
    sequelize

})

// 创建business表结构
// force:true,如果数据表存在，则先删除，在创建
// force:false, 如果数据表不存在，则创建
// Business.sync(): 创建表结构，该方法始终返回一个promise
Business.sync({force:false});

// 导出模型
module.exports = Business;
