
// 导入商家用户表模型
let Business = require(__basename + '/db/model/business.js');

// 导入商品类型模型
let ProductsType = require(__basename + '/db/model/productsType.js');

// 导入商品数据
let Product = require(__basename + '/db/model/products.js');

// 用户模型
let User = require(__basename + '/db/model/user.js');

// 购物车模型
let Shopcart = require(__basename + '/db/model/shopcart.js');

// 订单模型
let Order = require(__basename + '/db/model/order.js');


// 导出所有模型
module.exports = {
    Business,
    ProductsType,
    Product,
    User,
    Shopcart,
    Order

}