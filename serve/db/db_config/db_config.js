
// 导入sequelize模块
let Sequelize = require('sequelize');

module.exports = new Sequelize(config.mysqlOptions.database,config.mysqlOptions.user,config.mysqlOptions.password, {

    // 数据库地址
    host: config.mysqlOptions.host,

    // 连接数据库类型
    dialect: config.mysqlOptions.dialect
})