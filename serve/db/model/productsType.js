
// 导入sequelize
let Sequelize = require('sequelize');

// 定义模型，类似创建表结构
let Model = Sequelize.Model;

// 定义一个商家ProductsType数据表结构
class ProductsType extends Model{}

//定义business表结构
ProductsType.init({

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

    // 商品类型名称
    typeName:{
        // STRING:字符类型，40个字符
        type:Sequelize.STRING(20),
        allowNull:false,
        // 默认值
        defaultValue:'',
        comment:'商品类型名称'
    },
    // 商品类型标题
    typeTitle:{
        // STRING:字符类型，40个字符
        type:Sequelize.STRING(20),
        allowNull:false,
        // 默认值
        defaultValue:'',
        comment:'商品类型标题'
    },

    // 商品类型id
    typeId:{
        type:Sequelize.STRING(18),
        allowNull:false,
        defaultValue:'',
        comment:'商品类型id'
    }
},{

    // 模型名称
    modelName:'productsType',

    // 多个单词组合字段以_分割命名
    underscored:true,

    // 表的名称，如果没有定义表名称，则使用模型名称命名为表名称
    tableName:'productsType',
    
    // 创建updateAt,createAt字段
    timestamps:true,

    // 连接实例
    sequelize

})

// 创建productsType表结构
// force:true,如果数据表存在，则先删除，在创建
// force:false, 如果数据表不存在，则创建
// ProductsType.sync(): 创建表结构，该方法始终返回一个promise
ProductsType.sync({force:true}).then(a => {

    config.productsTypeOptions.forEach( v => {
        // console.log('v==>',v)
        ProductsType.create({
            typeName:v.typeName,
            typeTitle:v.typeTitle,
            typeId:v.typeId
        })
    })

});


// 导出模型
module.exports = ProductsType;
