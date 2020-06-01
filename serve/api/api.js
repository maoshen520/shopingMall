
// 操作数据api
class API {

    // 添加记录
    createData(modelName,o){
        // modelName:模型
        // o:写入数据
        return Model[modelName].create(o);
    }

    // 查询数据
    findData(modelName, condition, attributes){
        // modelName:模型
        // condition：查询条件
        // attributes:查询字段
        return Model[modelName].findAll({
           
            // condition：查询条件
            where: condition,

            // attributes:查询字段
            attributes

        })
    }

    // 更新数据
    updateData(modelName,attributeValues, condition) {
        // modelName:模型名称
        // attributeValues：修改属性值，类型object
        // condition : 条件，类型object
        return Model[modelName].update(attributeValues, {
            where: condition
        });

    }

    //删除数据
    destroyData(modelName, condition) {
        //modelName: 模型名称, 类型string
        //condition: 条件， 类型object
        return Model[modelName].destroy({
            where: condition
        });
    }

    // 分页查询，查询符合条件的所有记录数和记录数据
    findPaginationData(modelName, condition, offset, limit){
        // modelName:模型名称
        // condition:查询条件
        // offset:从哪里开始查询，默认0,偏移到第几条开始查询,必须是数字
        // limit:查询记录数量
        return Model[modelName].findAndCountAll({
            where:condition,
            offset,
            limit,
        })
    }

    // 查询满足条件的所有记录数量
    countData(modelName, condition){
        return Model[modelName].count({
            where: condition
        })
    }

    // 原始查询(预处理查询数据)
    queryData(sql,o){
        return sequelize.query(sql,{
            bind: o,
            type:sequelize.QueryTypes.SELECT
        })
    }


}
module.exports = new API();