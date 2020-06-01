// 导入工具库
let utils = require(__basename + '/utils/utils.js')

// 导入操作数据api
let api = require(__basename + '/api/api.js')

// // 导入发邮件模块
// let nodemailer = require('nodemailer')

// 导入白名单
let list = require(__basename + '/list/list.js');

// 导入文件系统
let fs = require('fs');

let appCode = '';

// let appLoginToken = {
//     phone:'',
//     utk:''
// }

// 路由控制器层
class RouteController {

    
    // token验证
    vliadToken(req, res, next){
        // console.log('req ==>',req)
        // 请求类型
        // console.log('req.method ==>',req.method);
        let requestType = req.method == 'GET' ? 'query' : 'body';

        let params = req[requestType];
        console.log('params  token ==>',params)

        // if(req.method == 'POST'){
        //     console.log('req.body ==>',req.body)
        // } else if (req.method == 'GET') {
        //     console.log('req.query ==>', req.query)
        // }

        // console.log('list[params.key]==>',list[params.key])
        // 如果不需要验证
        if(!params.key) {
            return next();
        }

        // 处理请求路径，去除？后面的查询参数
        let url = req.url.split('?')[0]
        console.log('req.url ==>',url)

        // req.headers.cookie =req.headers.cookie + ';' + 'utk='+ params.autk
        // console.log('req.headers ==>',req.headers)

        // 如果请求路由在白名单里，则需要拦截进行token验证
        if(list[params.key].url.indexOf(url) > -1){
            console.log('req.headers.cookie   token验证==> ', req.headers.cookie);
            console.log('list[params.key].url ==>',list[params.key].url)

            // 获取cookie
            let cookieData = utils.transformCookieObject(req.headers.cookie)
            console.log('cookieData  token==>',cookieData)

            // 如果cookieData不存在
            if(!cookieData){
                
                if(list[params.key].key == 'code'){
                    return res.send({msg:config.sceneValues.validCode.fail.msg,status:config.sceneValues.validCode.fail.code}); 
                }else {
                    return res.send({msg:config.sceneValues.login.noLogin.msg,status:config.sceneValues.login.noLogin.code});
                }
            }

            // 获取token名称
            let tkName = list[params.key].key == 'code' ? 'ctk' : 'utk';

            console.log('list[params.key].key ==>',list[params.key].key)

            console.log('tkName ==>',tkName)
            console.log('cookieData[tkName]  token==>',cookieData[tkName])

            // token加盐
            let salt = list[params.key].key == 'code' ? config.saltOptions.codeSalt : config.saltOptions.userLoginSalt
            // console.log('salt ==>',salt)


            // 验证token
            utils.validToken(cookieData[tkName], salt, (err, decode) => {
                
                // token验证失败
                if(err){

                    if(list[params.key].key == 'code'){
                        // 验证码的token验证
                        res.send({msg:config.sceneValues.validCode.fail.msg,status:config.sceneValues.validCode.fail.code}); 
                    } else {
                        // 登录token验证
                        res.send({msg:config.sceneValues.login.noLogin.msg,status:config.sceneValues.login.noLogin.code});
                    }
                } else {
                    console.log('decode 111111111111111111111==>',decode);

                    // 验证码token验证
                    if(list[params.key].key == 'code'){

                        if(decode.data == params.code){

                            // 验证通过
                            // next允许匹配其他路由
                            console.log('验证码验证通过')
                            next();
                        } else {
                            res.send({msg:config.sceneValues.validCode.fail.msg,status:config.sceneValues.validCode.fail.code});
                        }
                    } else {
                        // 登录token验证
                        //  return res.send({msg:'登录验证拦截',status:2001}); 
                        console.log('登录验证通过')

                        // 为请求对象的query对象添加一个email属性
                        req.query.email = decode.data;
                        next();
                    }
                }
            })

        }else {
            //不需要验证，直接通过
            next();
        }
    }

    // 注册
    register(req, res){
        // 截取GET请求查询参数
        // console.log('req.query ==>',req.query);
        // 截取POST请求体
        // console.log('req.body.username ==>',req.body.username);
        // res.send({msg:'请求成功', type:'post'});

        //先查询该有是否被注册
        api.findData('Business', {

            userEmail: req.body.email

        }, ['userEmail']).then(result => {
            console.log('result==>',result)

            if(result[0]){
                //用户存在
                res.send({msg: config.sceneValues.register.info.msg, status: config.sceneValues.register.info.code});
            } else {
                // 用户不存在
                
                // 生成用户id
                let userId = config.saltOptions.userIdSalt + new Date().getTime();

                //加密密码
                let password = utils.encodeString(req.body.password1)
                // console.log('password ==>',password)


                let o = {
                    username:req.body.username,
                    userEmail:req.body.email,
                    password,
                    userId
                }
                // console.log('o ==>',o)

                // 在商家用户表business添加记录
                api.createData('Business', o)
                    .then(result => {
                        res.send({msg:config.sceneValues.register.success.msg,status:config.sceneValues.register.success.code});
                    })
                    .catch(err => {
                        console.log('err ==>',err);
                        res.send({msg:config.sceneValues.register.fail.msg,status:config.sceneValues.register.fail.code})
                    })
            }

        }).catch(err =>{
            res.send({msg:'查询出错'});
        })
    }

    // 发邮件
    sendEmail(req, res){

        // console.log('req.body ==>',req.body)

        // 随机生成6位验证码
        let validCode = utils.getValidCode();
        console.log('validCode 邮箱验证码==>',validCode)

        //token过期时间
        let time = 60 * 5;

        //对验证码进行签名
        //data: 生成token的数据
        //expiresIn: 过期时间
        //config.saltOptions.codeSalt: token加盐

        // 测试时不要发送邮件
        let codeToken = utils.getToken(validCode, config.saltOptions.codeSalt, time)

        return res.send({
            msg:'邮箱验证码以发至您的邮箱',
            status:4000,
            __ctk:{
                key:'ctk',
                ctk:codeToken
            },
            time});

        // 发送邮件
        utils.sendEmail([req.body.email], validCode, (err,info) => {
            console.log('req.body.email==>',req.body.email)

            // 如果发送失败
            if(err){

                res.send({msg:config.sceneValues.sendEmail.fail.msg,status:config.sceneValues.sendEmail.fail.code});
                
            } else {

                //对验证码进行签名
                let codeToken = utils.getToken(validCode,config.saltOptions.codeSalt,time)

                return res.send({msg:config.sceneValues.sendEmail.success.msg,status:config.sceneValues.sendEmail.success.code, __ctk:{key:'ctk',ctk:codeToken},time})
                // return res.send({
                //         msg:'邮箱验证码以发至您的邮箱',
                //         status:4000,
                //         __ctk:{
                //             key:'ctk',
                //             ctk:codeToken
                //         },
                //         time});        
            }
        })
    }

    //登录
    login(req,res){
        console.log(req.body)

        // 查询当前用户是否合法
        api.findData('Business',{
            userEmail: req.body.email
        },['userEmail','username','password','userId'])
            .then(result => {
                // console.log(' login result ==>', result)

                if(result.length == 0){
                    res.send({msg:config.sceneValues.login.info.msg,status:config.sceneValues.login.info.code})
                } else {
                    // 匹配密码
                    // 获取查询密码(数据库中的密码)
                    let password = result[0].dataValues.password;

                    // 验证密码是否一致(输入的密码)
                    let pwd1 = utils.encodeString(req.body.password1);

                    if(password == pwd1){

                        // 前端使用正确的邮箱和密码换区唯一凭证，用于其他验证用户登录

                        // 生成token凭证(有效期7天)
                        // let __utk = utils.getToken(req.body.email, result[0].dataValues.userId,'7d')
                        let __utk = utils.getToken(req.body.email, config.saltOptions.userLoginSalt,'7d')

                        res.send({msg:config.sceneValues.login.success.msg,status:config.sceneValues.login.success.code, __utk: {key:'utk', utk: __utk}, time: 7})
      
                    } else {
                        res.send({msg:config.sceneValues.login.warn.msg,status:config.sceneValues.login.warn.code})
                    }
                }     
            })
            .catch(err => {
                res.send({msg:config.sceneValues.login.fail.msg,status:config.sceneValues.login.fail.code})
            })     
    }

    // 如果登录验证通过，就会匹配该路径， 商家进入后台
    business(req,res){

        // 查询用户数据
        api.findData('Business',{
            userEmail: req.query.email
        },['username'])
        .then(result =>{
            res.send({msg: result[0].dataValues, status:5000})
        })
        .catch(err =>{
            res.send({msg:'查询用户数据失败', status:5001})
        }) 
    }

    // 修改密码获取邮箱验证
    changePwdGetEmail(req,res){

        // 查询修改密码的用户邮箱是否存在
        api.findData('Business', {
            userEmail:req.body.email
        }, ['userId'])
        .then(result => {
            // console.log('result ==>',result)

            // 如果用户邮箱不存在
            if(result.length == 0){
                res.send({msg:config.sceneValues.login.info.msg,status:config.sceneValues.login.info.code})
            } else {

                // 随机生成6位验证码
                let validCode = utils.getValidCode();
                // console.log('validCode ==>',validCode)

                //token过期时间
                let time = 60 * 10;

                // // 测试时不要发送邮件
                // let codeToken = utils.getToken(validCode, config.saltOptions.codeSalt, time)
                // return res.send({
                //     msg:'邮箱验证码以发至您的邮箱',
                //     status:4000,
                //     __ctk:{
                //         key:'ctk',
                //         ctk: codeToken
                //     },
                //     time});

                utils.sendEmail([req.body.email], validCode, (err,info) => {
                    console.log('req.body.email==>',req.body.email)
        
                    // 如果发送失败
                    if(err){
        
                        res.send({msg:config.sceneValues.sendEmail.fail.msg,status:config.sceneValues.sendEmail.fail.code});
                        
                    } else {
                        // 对验证码进行签名
                        let codeToken = utils.getToken(validCode,config.saltOptions.codeSalt,time)
        
                        // return res.send({msg:'邮箱验证码已发至您的邮箱',status:4000, __ctk:codeToken,time})
                        res.send({
                                msg:'邮箱验证码以发至您的邮箱',
                                status:4000,
                                __ctk:{
                                    key:'ctk',
                                    ctk: codeToken
                                },
                                time});        
                    }
                })
            }
        })
        .catch(err => {
            res.send({msg:config.sceneValues.changePwd.fail.msg,status:config.sceneValues.changePwd.fail.code})
        })

    }

    // 修改密码
    changePwd(req,res){
        // console.log('req.body ==>',req.body);

        //查询用户邮箱
        api.findData('Business', {
            userEmail: req.body.email
        }, ['userId'])
        .then(result => {
            if(result.length == 0 ){
                res.send({msg:config.sceneValues.changePwd.fail.msg,status:config.sceneValues.changePwd.fail.code})
            }else {
                let password = utils.encodeString(req.body.password1);

                // 更新密码
                api.updateData('Business', {
                    password
                }, {userEmail: req.body.email})
                .then( result => {
                    res.send({msg:config.sceneValues.changePwd.success.msg,status:config.sceneValues.changePwd.success.code})
                    // console.log('result ==>',result)
                })
                .catch( err => {
                    res.send({msg:config.sceneValues.changePwd.fail.msg,status:config.sceneValues.changePwd.fail.code})
                })
            }
        })
        .catch( err => {
            res.send({msg:config.sceneValues.changePwd.fail.msg,status:config.sceneValues.changePwd.fail.code})
        })
    }

    // 商家上传商品数据
    uploadProductData(req,res) {

        console.log(req.body);

        // 将图片base64转化为buffer
        let buffer = new Buffer(req.body.serverBase64Img, 'base64');

        // 使用时间戳修改文件名称
        let filename = new Date().getTime() + utils.getValidCode() + '.' + req.body.imgType
        console.log('filename ==>',filename);

        // fs.writeFile(写入文件路径，文件buffer，处理函数)
        fs.writeFile(__basename + '/upload/' + filename, buffer, err =>{
            // 如果写入失败
            if(err){
                res.send({msg:config.sceneValues.uploadProductData.imgfail.msg,status:config.sceneValues.uploadProductData.imgfail.code})
            } else {

                // 查询商家用户id
                api.findData('Business',{
                    userEmail:req.query.email
                },['userId']).then(result => {

                    let userId = result[0].dataValues.userId;
                    // 将商品录入数据库中
                     // 商城商品id

                    let data = {
                        productId: utils.getValidCode() + new Date().getTime(),
                        productName:req.body['product-name'],
                        productType:req.body['product-type'],
                        productPrice:req.body['product-price'],
                        vipPrice: Number(req.body['vip-price']),
                        isVip:Number(req.body['is-vip']) ,
                        productDetail: req.body['product-detail'],
                        productCount: Number(req.body['product-count']),
                        productImg: filename,
                        businessId:userId,
                        productIsUser:1
                    };
                    api.createData('Product', data).then(result => {
                        res.send({msg:config.sceneValues.uploadProductData.success.msg,status:config.sceneValues.uploadProductData.success.code})
                    }).catch(err => {
                        res.send({msg:config.sceneValues.uploadProductData.datafail.msg,status:config.sceneValues.uploadProductData.datafail.code})
                    })


                }).catch(err => {
                    res.send({msg:'查询错误',status:0})
                })

               
                // 将商品录入数据库中
                // // 商城商品id
                // let productId = utils.getValidCode() + new Date().getTime();

                // let productName = req.body['product-name'];

                // let productType = req.body['product-type'];

                // let productPrice = req.body['product-price'];

                // let vipPrice = Number(req.body['vip-price']);

                // let isVip =Number(req.body['is-vip']) ;

                // let productDetail = req.body['product-detail'];

                // let productCount = Number(req.body['product-count']);

                // let productImg = filename;

                // api.createData('Product', {
                //     productId,
                //     productType,
                //     productName,
                //     productPrice,
                //     vipPrice,
                //     isVip,
                //     productDetail,
                //     productCount,
                //     productImg

                // }).then(result => {
                //     res.send({msg:'添加商品成功', status:8000})
                // }).catch(err => {
                //     res.send({msg:'添加商品失败', status:8001})
                // })




                
                // res.send({msg:'上传图片成功', status:6000});
            }
        })
    }

    // 查询商品类型
    getProductsType(req,res){

        api.findData('ProductsType').then( result => {
            // console.log('result ==>',result)
            let data = [];

            result.forEach(v => {
                data.push(v.dataValues);
                
            })
        // console.log('data ==>',data)
            res.send({msg:config.sceneValues.getProductsType.success.msg,status:config.sceneValues.getProductsType.success.code,data});
        }).catch( err => {
            res.send({msg:config.sceneValues.getProductsType.fail.msg,status:config.sceneValues.getProductsType.fail.code})
        })
    }

    // 查询商家的商品数据
    findProjectData(req,res){

        // console.log('req.query.email 333 ==>',req.query.email)
        // sequelize.query('SELECT * FRON business WHERE user_email = $email',
        //     { bind: { email:req.query.email}, type:sequelize.QueryTypes.SELECT
        // }).then(data => {
        //     console.log('data ==>',data);
        //     res.send('aaaa');
        // }).catch(err =>{
        //     res.send('出错')
        // })
        // return

        // console.log('req.query.email ===>',req.query.email)
         // 查询商家的id
        api.findData('Business',{
            userEmail:req.query.email
        },['userId']).then(result => {
            // console.log('result23423423 ==>',result)
            if(result.length == 0){
                return res.send({msg:config.sceneValues.login.noLogin.msg,status:config.sceneValues.login.noLogin.code})
            }

            // 获取商家id
            let userId = result[0].dataValues.userId;
            // console.log('userId ==>',userId)

            // console.log('Number(req.query.offset) ==>',Number(req.query.offset))
            // console.log('config.paginationOptions.count ==>',config.paginationOptions.count)

            // 使用sql语句预处理查询数据
            let sql = 'SELECT `p`.`product_id`,`p`.`product_name`,`p`.`product_price`,`p`.`vip_price`,`p`.`is_vip`,`p`.`product_detail`,`p`.`product_count`,`p`.`product_img`,`p`.`product_is_user`,`p`.`created_at`,`pt`.`type_title`,`pt`.`type_id` FROM `product` AS `p` INNER JOIN `productsType` AS `pt` ON `p`.`product_type` = `pt`.`type_id` AND `p`.`business_id` =$uid LIMIT $offset, $limit';
            api.queryData(sql,{
                uid:userId, limit:config.paginationOptions.count, offset:Number(req.query.offset)
            }).then(result => {
                // console.log('result ==>',result)
                // 查询满足条件的所有记录数量
                api.countData('Product', {
                    // 商品表中的business_id
                    businessId:userId
                }).then(count => {   
                    // console.log('count ==>',count)
                    res.send({msg:config.sceneValues.findData.success.msg,status:config.sceneValues.findData.success.code,data: {count,result}})
                }).catch(err => {
                    res.send({msg:config.sceneValues.findData.fail.msg,status:config.sceneValues.findData.fail.code})
                })

            }).catch(err => {
                res.send({msg:config.sceneValues.findData.fail.msg,status:config.sceneValues.findData.fail.code})
            })

            // 分页查询，查询符合条件的所有记录数和记录数据
            // api.findPaginationData('Product',{
            //     businessId:userId
            // },Number(req.query.offset),
            //  config.paginationOptions.count).then(result =>{
            //     res.send({msg:config.sceneValues.findData.success.msg,status:config.sceneValues.findData.success.code, rows:result.rows, count:result.count});
            // }).catch(err => {
            //     res.send({msg:config.sceneValues.findData.fail.msg,status:config.sceneValues.findData.fail.code})
            // })

        }).catch(err => {
            res.send({msg:config.sceneValues.login.noLogin.msg,status:config.sceneValues.login.noLogin.code})
        })

    }


    // 查询商家已被购买的商品数据
    findSoldProjectData(req,res){

         // 查询商家的id
        api.findData('Business',{
            userEmail:req.query.email
        },['userId']).then(result => {
            // console.log('result23423423 ==>',result)
            if(result.length == 0){
                return res.send({msg:config.sceneValues.login.noLogin.msg,status:config.sceneValues.login.noLogin.code})
            }
            // 获取商家id
            let userId = result[0].dataValues.userId;
            // console.log('userId ==>',userId)

            // 使用sql语句预处理查询数据
            let sql = 'SELECT `p`.`product_id`,`p`.`product_img`,`p`.`product_name`,`p`.`product_price`,`p`.`product_price`,`p`.`product_count`,`p`.`order_id`,`p`.`user_id`,`p`.`status`,`p`.`created_at` FROM `order` AS `p` INNER JOIN `productsType` AS `pt` ON `p`.`status` =$status AND `p`.`business_id` =$uid LIMIT $offset, $limit';
            api.queryData(sql,{
                status:'已支付',uid:userId,limit:config.paginationOptions.count, offset:Number(req.query.offset)
            }).then(result => {
                console.log('result 1111111==>',result)
                // res.send({msg:config.sceneValues.findData.success.msg,status:config.sceneValues.findData.success.code,data: {count,result}})
                // 查询满足条件的所有记录数量
                api.countData('Order', {
                    // 商品表中的business_id
                    status:'已支付'
                }).then(count => {   
                    // console.log('count ==>',count)
                    res.send({msg:config.sceneValues.findData.success.msg,status:config.sceneValues.findData.success.code,data: {count,result}})
                }).catch(err => {
                    res.send({msg:config.sceneValues.findData.fail.msg,status:config.sceneValues.findData.fail.code})
                })

            }).catch(err => {
                res.send({msg:config.sceneValues.findData.fail.msg,status:config.sceneValues.findData.fail.code})
            })

        }).catch(err => {
            res.send({msg:config.sceneValues.login.noLogin.msg,status:config.sceneValues.login.noLogin.code})
        })

    }


    // 禁用商品 product_is_user=0
    disabledProductData(req,res){
        // console.log(req.body)
        api.updateData('Product',{
           productIsUser:0 
        },{
            productId:req.body.pid
        }).then(result => {
            // console.log('result ==>',result);

            // 更新成功
            if(result[0] == 1){
                res.send({msg:config.sceneValues.disabledProduct.success.msg,status:config.sceneValues.disabledProduct.success.code})
            }else {
                // 更新失败
                res.send({msg:config.sceneValues.disabledProduct.fail.msg,status:config.sceneValues.disabledProduct.fail.code})
            }
            
        }).catch(err => {
            // 更新失败
            res.send({msg:config.sceneValues.disabledProduct.fail.msg,status:config.sceneValues.disabledProduct.fail.code})
        })
    }

    // 启用商品 product_is_user=0
    enableProductData(req,res){
        // console.log(req.body)
        api.updateData('Product',{
           productIsUser:1
        },{
            productId:req.body.pid
        }).then(result => {
            // console.log('result ==>',result);
            // 更新成功
            if(result[0] == 1){
                res.send({msg:config.sceneValues.enabledProduct.success.msg,status:config.sceneValues.enabledProduct.success.code})
            }else {
                // 更新失败
                res.send({msg:config.sceneValues.enabledProduct.fail.msg,status:config.sceneValues.enabledProduct.fail.code})
            }  
        }).catch(err => {
            // 更新失败
            res.send({msg:config.sceneValues.enabledProduct.fail.msg,status:config.sceneValues.enabledProduct.fail.code})
        })
    }

    // 发货商品
    soldProductData(req,res){
        console.log('req.body ==>',req.body)
        api.updateData('Order',{
           status:'已发货'
        },{
            productId:req.body.pid,
            userId:req.body.user,
            orderId:req.body.order,
            createdAt:req.body.time,
        }).then(result => {
            // console.log('result ==>',result);
            // 更新成功
            if(result[0] == 1){
                res.send({msg:config.sceneValues.enabledProduct.success.msg,status:config.sceneValues.enabledProduct.success.code})
            }else {
                // 更新失败
                res.send({msg:config.sceneValues.enabledProduct.fail.msg,status:config.sceneValues.enabledProduct.fail.code})
            }  
        }).catch(err => {
            // 更新失败
            res.send({msg:config.sceneValues.enabledProduct.fail.msg,status:config.sceneValues.enabledProduct.fail.code})
        })
    }

    // 删除商品
    delectProduct(req,res){
        api.destroyData('Product', {
            productId:req.body.pid
        }).then(result => {
            // console.log('result ==>',result)
            if (result == 0) {
              //删除失败
              res.send({msg: config.sceneValues.delectProduct.fail.msg, status: config.sceneValues.delectProduct.fail.code});
            } else {
              res.send({msg: config.sceneValues.delectProduct.success.msg, status: config.sceneValues.delectProduct.success.code});
            }
            
        }).catch(err => {
            res.send({msg: config.sceneValues.delectProduct.fail.msg, status: config.sceneValues.delectProduct.fail.code});
        })   
    }

    // 查看商品
    seeProduct(req,res){
        api.findData('Product', {
            productId:req.body.pid
        }).then(result => {
            // console.log('result ==>',result)
            res.send({msg: config.sceneValues.findData.success.msg, status: config.sceneValues.findData.success.code, data: result});
        }).catch(err => {
            res.send({msg: config.sceneValues.findData.fail.msg, status: config.sceneValues.findData.fail.code});
        })   
    }
  
    // client-app
    // 发短信
    getMessageCode(req, res){
        // console.log('req.query ==>',req.query)
        // res.send('发送短信成功')

        // 随机生成6位验证码
        let validCode = utils.getValidCode();
        // console.log('validCode ==>',validCode)

        // 记录验证码
        appCode = validCode;
        console.log('appCode ==记录验证码>',appCode)

        //token过期时间
        let time = 60 * 50;

        let codeToken = utils.getToken(validCode, config.saltOptions.codeSalt, time)
        // console.log('codeToken  短信 ==>',codeToken)

        // 测试不发短信
        // return res.send({msg:config.sceneValues.sendMessage.success.msg,status:config.sceneValues.sendMessage.success.code, __ctk:{
        //     key:'ctk',
        //     ctk: codeToken
        // },time})

        // 发送短信
        utils.sendMessage([req.query.phone],validCode).then(data => {
            // console.log('data ==>',data)
            if(data.Code == 'OK') {
                res.send({msg:config.sceneValues.sendMessage.success.msg,status:config.sceneValues.sendMessage.success.code})
            }
        }).catch(err => {
            res.send({msg:config.sceneValues.sendMessage.fail.msg,status:config.sceneValues.sendMessage.fail.code})
        })
    }

    // 客户端注册的下一步
    registerNext(req, res){
        console.log('appCode ==1111>',appCode)
        console.log('req.body  1111111 ==>',req.body);
        // console.log('req.query ==>',req.query)
        // console.log('req.headers.cookie ==>',req.headers.cookie);

        api.findData('User',{
            phone:req.body.phone
        },['userId']).then(result => {
            if(result.length == 0) {
                
                if(req.body.code == appCode){
                    console.log('555555555')

                    //生成登录验证token
                    let __utk = utils.getToken(req.body.phone, config.saltOptions.userLoginSalt, '7d')

                    res.send({msg:config.sceneValues.validCode.success.msg,status:config.sceneValues.validCode.success.code, __utk: {key: 'utk', utk: __utk}, time: 7})
                } else {
                    res.send({msg:config.sceneValues.validCode.fail.msg,status:config.sceneValues.validCode.fail.code})
                }
            } else {
                res.send({msg: '手机号已被注册', status: config.sceneValues.register.fail.code});
            }

        })

    }

    // app注册
    appRegister(req, res) {
        // console.log('req.body  注册 ==>',req.body);

        //查找手机是否被注册
        api.findData('User', {
            phone: req.body.phone
        }, ['userId']).then(result => {
            // console.log('result ==>',result)
            if (result.length == 0) {

                //生成用户id
                let userId = config.saltOptions.userIdSalt + new Date().getTime();

                //加密密码
                let password = utils.encodeString(req.body.password);

                let o = {
                    phone: req.body.phone,
                    password,
                    userId
                };
                // console.log('o ==> ', o);

                //在商家用户表user添加记录
                api.createData('User', o)
                    .then(result => {
                        res.send({msg: config.sceneValues.register.success.msg, status: config.sceneValues.register.success.code});
                    })
                    .catch(err => {
                        // console.log('err ==> ', err);
                        res.send({msg: config.sceneValues.register.fail.msg, status: config.sceneValues.register.fail.code});
                    })
            }else {
                res.send({msg: config.sceneValues.register.fail.msg, status: config.sceneValues.register.fail.code});
            }
        }).catch(err => {
            res.send({msg: config.sceneValues.findData.fail.msg, status: config.sceneValues.findData.fail.code});
        })

    }

    // 首页数据
    appProduct(req, res){

        api.findPaginationData('Product',{
            product_type:"remaiguoshu"
        },0,20)
            .then(result => {
                res.send({msg:config.sceneValues.findData.success.msg,status:config.sceneValues.findData.success.code,data:result});
            }).catch(err => {
                res.send({msg:config.sceneValues.findData.fail.msg,status:config.sceneValues.findData.fail.code,data:result})
            })
    }

    // 商品详情数据
    productDetail(req, res) {
        // console.log('req.query 商品==>',req.query)
        api.findData('Product',{
           productId:req.query.id 
        }).then(result => {
            res.send({msg:config.sceneValues.findData.success.msg,status:config.sceneValues.findData.success.code,data:result});
        }).catch(err => {
            res.send({msg:config.sceneValues.findData.fail.msg,status:config.sceneValues.findData.fail.code,data:result})
        })
    }

    // 商品类型数据
    getTypeData(req, res) {
        console.log('req.query 商品==>',req.query)
        api.findData('Product',{
           product_type:req.query.typeId
        }).then(result => {
            res.send({msg:config.sceneValues.findData.success.msg,status:config.sceneValues.findData.success.code,data:result});
        }).catch(err => {
            res.send({msg:config.sceneValues.findData.fail.msg,status:config.sceneValues.findData.fail.code,data:result})
        })
    }

    // app登录
    appLogin(req, res) {
        console.log('req.body  登录 ==>',req.body);

        // appLoginToken.phone = req.body.phone
        // console.log('appLoginToken.phone ==>',appLoginToken.phone)

        api.findData('User', {
            phone: req.body.phone
        }, ['password', 'userId']).then(result => {  
            if (result.length == 0) {
                res.send({msg: config.sceneValues.login.info.msg, status: config.sceneValues.login.info.code});
            } else{
                //匹配密码
                //获取查询密码
                let password = result[0].dataValues.password;
                let userId = result[0].dataValues.userId;

                // 字符串加密前端发过来的密码
                let appPassword = utils.encodeString(req.body.password);

                //验证密码是否一致
                if(password == appPassword){
                    //生成token凭证
                    let __utk = utils.getToken(req.body.phone, config.saltOptions.userLoginSalt, '7d');

                    let userData = {
                        phone:req.body.phone,
                        userId:userId
                    }
                    req.headers.user = req.body.phone

                    res.send({msg: config.sceneValues.login.success.msg, status: config.sceneValues.login.success.code, __utk: {key: 'utk', utk: __utk}, time: 7,userData});
                } else {
                    res.send({msg: config.sceneValues.login.warnPassword.msg, status: config.sceneValues.login.warnPassword.code});
                } 
            }
        }).catch(err => {
            res.send({msg: config.sceneValues.login.fail.msg, status: config.sceneValues.login.fail.code});
        })

    }

    // 查询用户购物车数据
    findShopcartData(req, res){
        // console.log('req.query ==>',req.query)
        api.findData('User',{
            phone:req.query.phone
        },['userId']).then(result => {
            if(result.legnth == 0){
                return res.send({msg:config.sceneValues.login.info.msg,status:config.sceneValues.login.info.code})
            } else {
                if(result[0].dataValues.userId !== req.query.userId){
                    return res.send({msg:config.sceneValues.login.againLogin.msg,status:config.sceneValues.login.againLogin.code})
                } else{
                    
                    // 根据用户id和商品状态=0查询购物车数据
                    let sql = 'SELECT `u`.`user_id`, `s`.`product_id`, `s`.`product_name`, `s`.`product_price`, `s`.`product_img`,`s`.`product_count`, `s`.`product_detail`,`s`.`status`, `s`.`created_at` FROM `user` AS `u` INNER JOIN `shopcart` AS `s` ON `u`.`user_id` = `s`.`user_id`AND `u`.`phone` = $phone AND `s`.`status` = 0';
                    api.queryData(sql, {
                    phone: req.query.phone
                    }).then(result => {
                        // console.log('result  购物车数据==>',result)
                    res.send({msg: config.sceneValues.findData.success.msg, status: config.sceneValues.findData.success.code, data: result});
                    }).catch(err => {
                    res.send({msg: config.sceneValues.findData.fail.msg, status: config.sceneValues.findData.fail.code});
                    })
                }
            }      
        }).catch(err => {
            res.send({msg:config.sceneValues.login.againLogin.msg,status:config.sceneValues.login.againLogin.code})
        })    
    }

    // 加入购物车
    addShopcart(req, res){
        // console.log("req,body ==>",req.body)
        api.findData('User',{
            phone:req.body.phone
        },['userId']).then(result => {
            if(result.legnth == 0){
                return res.send({msg:config.sceneValues.login.info.msg,status:config.sceneValues.login.info.code})
            } else {
                if(result[0].dataValues.userId !== req.body.userId){
                    return res.send({msg:config.sceneValues.login.againLogin.msg,status:config.sceneValues.login.againLogin.code})
                } else{
                    
                    //查询用户id和商品的价格、商品图片、商品名称,商品详情
                    let sql = 'SELECT `u`.`user_id`, `p`.`product_id`, `p`.`product_name`, `p`.`product_price`, `p`.`product_img`,`p`.`product_detail`,`p`.`business_id` FROM `user` AS `u` INNER JOIN `product` AS `p` ON `u`.`phone` = $phone AND `p`.`product_id` = $productId';
                    api.queryData(sql, {
                    phone: req.body.phone,
                    productId: req.body.productId
                    }).then(result => {
                        // console.log('result ==>',result)
                        if (result.length > 0) {
                            api.createData('Shopcart', {
                                productCount: req.body.count,
                                productId: result[0].product_id,
                                productName: result[0].product_name,
                                productPrice: result[0].product_price,
                                productImg: result[0].product_img,
                                productDetail: result[0].product_detail,
                                userId: result[0].user_id,
                                businessId: result[0].business_id
                            }).then(result => {
                                res.send({msg: config.sceneValues.shopcart.success.msg, status: config.sceneValues.shopcart.success.code,data:result});
                            })
                        } else {
                            res.send({msg: config.sceneValues.shopcart.fail.msg, status: config.sceneValues.shopcart.fail.code});
                        }
                    }).catch(err => {
                        res.send({msg: config.sceneValues.findData.fail.msg, status: config.sceneValues.findData.fail.code});
                    })
                }
            }      
        }).catch(err => {
            res.send({msg:config.sceneValues.login.againLogin.msg,status:config.sceneValues.login.againLogin.code})
        })  
    }

    // 修改购物车中的商品数量
    modifyShopcartCount(req,res){
        
        // let time = utils.formatDate(req.body.time,'YYYY-MM-DD hh:mm:ss');
        // console.log('time ==>',time)
        api.findData('User',{
            phone:req.body.phone
        },['userId']).then(result => {
            if(result.legnth == 0){
                return res.send({msg:config.sceneValues.login.info.msg,status:config.sceneValues.login.info.code})
            } else {
                if(result[0].dataValues.userId !== req.body.userId){
                    return res.send({msg:config.sceneValues.login.againLogin.msg,status:config.sceneValues.login.againLogin.code})
                } else{

                    api.updateData('Shopcart',{
                        productCount:Number(req.body.count)
                    },{
                        productId:req.body.productId,
                        userId:req.body.userId,
                        createdAt:req.body.time
                    }).then(result => {
                        // console.log('result ==更新>',result)
                        if(result[0] ==0){
                            // 没有更新
                            res.send({msg: config.sceneValues.shopcart.warn.msg, status: config.sceneValues.shopcart.warn.code})
                        }else {
                            res.send({msg: config.sceneValues.shopcart.info.msg, status: config.sceneValues.shopcart.info.code,data:result}) 
                        }                  
                    }).catch( err => {
                        res.send({msg: config.sceneValues.shopcart.warn.msg, status: config.sceneValues.shopcart.warn.code})
                    })                            
                }
            }      
        }).catch(err => {
            res.send({msg:config.sceneValues.login.againLogin.msg,status:config.sceneValues.login.againLogin.code})
        })  
    }

    // 删除购物车商品
    delectShopcartProduct(req,res){
        // console.log("req,body ==>",req.body)
        let deleteData = JSON.parse(req.body.deleteData);
        console.log('deleteData ==>',deleteData)
        api.findData('User',{
            phone:req.body.phone
        },['userId']).then(result => {
            if(result.legnth == 0){
                return res.send({msg:config.sceneValues.login.info.msg,status:config.sceneValues.login.info.code})
            } else {
                if(result[0].dataValues.userId !== req.body.userId){
                    return res.send({msg:config.sceneValues.login.againLogin.msg,status:config.sceneValues.login.againLogin.code})
                } else{

                    api.destroyData('Shopcart', {
                        userId: req.body.userId,
                        [config.Op.or]: deleteData
                    }).then(result => {
                        // console.log('result ==>',result)
                        if (result == 0) {
                          //删除失败
                          res.send({msg: config.sceneValues.shopcart.deleteFail.msg, status: config.sceneValues.shopcart.deleteFail.code, data: result});
                        } else {
                          res.send({msg: config.sceneValues.shopcart.deleteSuccess.msg, status: config.sceneValues.shopcart.deleteSuccess.code, data: result});
                        }
                        
                    }).catch(err => {
                        res.send({msg: config.sceneValues.shopcart.deleteFail.msg, status: config.sceneValues.shopcart.deleteFail.code});
                    })        
                }
            }      
        }).catch(err => {
            res.send({msg:config.sceneValues.login.againLogin.msg,status:config.sceneValues.login.againLogin.code})
        })  
    }

    // 查询用户信息
    findUserData(req,res){
        api.findData('User',{
            phone:req.body.phone
        },['userId']).then(result => {
            // console.log('result ==>',result)
            if(result.legnth == 0){
                return res.send({msg:config.sceneValues.login.info.msg,status:config.sceneValues.login.info.code})
            } else {
                if(result[0].dataValues.userId !== req.body.userId){
                    return res.send({msg:config.sceneValues.login.againLogin.msg,status:config.sceneValues.login.againLogin.code})
                } else{

                    api.findData('User',{
                        phone:req.body.phone
                    },['nickname']).then(result => {
                        // console.log('result name==>',result)
                        res.send({msg: config.sceneValues.findData.success.msg, status: config.sceneValues.findData.success.code, data: result});         
                    }).catch(err => {
                        res.send({msg: config.sceneValues.findData.fail.msg, status: config.sceneValues.findData.fail.code});
                    })           
                }
            }      
        }).catch(err => {
            res.send({msg:config.sceneValues.login.againLogin.msg,status:config.sceneValues.login.againLogin.code})
        }) 
    }

    // 添加地址
    address(req,res){
        // console.log('req.body ==>',req.body)
        let o = {
            user:req.body.user,
            name:req.body.name,
            address:req.body.address,
            postal:req.body.postal,
            phone:req.body.phone
        }
        //在地址表表添加记录
        api.createData('Address', o)
        .then(result => {
            console.log('reslut ==>',result)
            res.send({msg: config.sceneValues.address.success.msg, status: config.sceneValues.address.success.code,data:result.dataValues});
        })
        .catch(err => {
            // console.log('err ==> ', err);
            res.send({msg: config.sceneValues.address.fail.msg, status: config.sceneValues.address.fail.code});
        })
    }

    // 查询地址
    findAddress(req,res){
        let sql = 'SELECT `user`, `name`, `address`, `postal`, `address_type`,`phone`,`created_at` FROM `address`'
        api.queryData(sql, {
            phone: req.query.phone
        }).then(result => {
            // console.log('result  地址数据==>',result)
            res.send({msg: config.sceneValues.findData.success.msg, status: config.sceneValues.findData.success.code, data: result});
        }).catch(err => {
            res.send({msg: config.sceneValues.findData.fail.msg, status: config.sceneValues.findData.fail.code});
        })
    }

    // 修改为默认地址
    defaultAddress(req,res){
        // console.log('req.body.user 默认==>',req.body)
        // res.send('aaaa')
        api.updateData('Address',{
            addressType:1
        },{
            user:req.body.user,
            createdAt:req.body.createdAt
        }).then(result => {
            // console.log('result 默认==>',result);

            // 更新成功
            if(result[0] == 1){
                res.send({msg: config.sceneValues.changeAddress.success.msg, status: config.sceneValues.changeAddress.success.code})
            }else {
                // 更新失败
                res.send({msg: config.sceneValues.changeAddress.fail.msg, status: config.sceneValues.changeAddress.fail.code})
            }
            
        }).catch(err => {
            // 更新失败
            res.send({msg: config.sceneValues.changeAddress.fail.msg, status: config.sceneValues.changeAddress.fail.code})
        })
    }

    // 修改为普通地址
    nodefaultAddress(req,res){
        // console.log('req.body.user 普通==>',req.body)
        api.updateData('Address',{
            addressType:0
        },{
            user:req.body.user,
            createdAt:req.body.createdAt
        }).then(result => {
            // console.log('result 普通==>',result);
            // 更新成功
            if(result[0] == 1){
                res.send({msg: config.sceneValues.changeAddress.success.msg, status: config.sceneValues.changeAddress.success.code})
            }else {
                // 更新失败
                res.send({msg: config.sceneValues.changeAddress.fail.msg, status: config.sceneValues.changeAddress.fail.code})
            }
        }).catch(err => {
            // 更新失败
            res.send({msg: config.sceneValues.changeAddress.fail.msg, status: config.sceneValues.changeAddress.fail.code})
        })
    }

    // 确认支付订单链接
    createOrderURL(req,res){
        // console.log('req.query 11111111111111111111111111111==>',req.query)
        let order = req.query
        utils.createOrder(order).then(data => {
            res.send({msg: config.sceneValues.alipay.createOrderSuccess.msg, status: config.sceneValues.alipay.createOrderSuccess.code,payUrl:data.payUrl,outTradeNo:data.outTradeNo})
        }).catch(err => {
            res.send({msg: config.sceneValues.alipay.createOrderFail.msg, status: config.sceneValues.alipay.createOrderFail.code})
        })
    }

    // 订单查询
    verifyData(req,res){
        // console.log('req.body ==>',req.body)
        console.log('req.query ==>',req.query)
        // let outTradeNo =JSON.parse(req.query[0])
        // console.log('outTradeNo ==>',outTradeNo)

        utils.verify(req.query[0]).then(data => {
            console.log('data 111111==>',data)
            res.send({code:400,data})
        }).catch(err => {
            res.send({msg:'失败'})
        })
        // res.send({code:300})
    }

    // 创建订单
    createOrder(req,res){
        console.log('结果 ==>',req.query)
        //根据商品id查询商品的价格、商品图片、商品名称,商品详情,商家id
        let sql = 'SELECT `s`.`user_id`,`s`.`product_count`, `p`.`product_id`, `p`.`product_name`, `p`.`product_price`, `p`.`product_img`,`p`.`product_detail`,`p`.`business_id` FROM `shopcart` AS `s` INNER JOIN `product` AS `p` ON `s`.`product_id` = $productId AND `s`.`created_at` = $createdAt AND `p`.`product_id` = $productId';
        api.queryData(sql, {
            productId: req.query.productId,
            createdAt: req.query.createdAt
            // createdAt
        }).then(result => {
            console.log('result 结果==>',result)
            if (result.length > 0) {
                api.createData('Order', {
                    orderId: req.query.outTradeNo,
                    productId: result[0].product_id,
                    productName: result[0].product_name,
                    productDetail: result[0].product_detail,
                    productPrice: result[0].product_price,
                    productImg: result[0].product_img,
                    productCount: result[0].product_count,
                    status:'未支付',
                    address:req.query.defaultAddress,
                    userId: result[0].user_id,
                    businessId: result[0].business_id
                }).then(result => {
                    res.send({msg: config.sceneValues.alipay.createOrderSuccess.msg, status: config.sceneValues.alipay.createOrderSuccess.code});
                })
            } else {
                res.send({msg: config.sceneValues.alipay.createOrderFail.msg, status: config.sceneValues.alipay.createOrderFail.code});
            }
        })

        // let orderDatas =req.query;
        // orderDatas.orderData = JSON.parse(orderDatas.orderData)
        // console.log('orderDatas 创建订单==>',orderDatas)   
        // api.createData('Order', {
        //     [config.Op.or]: orderDatas.orderData
        //     // productCount: req.body.count,
        //     // productId: result[0].product_id,
        //     // productName: result[0].product_name,
        //     // productPrice: result[0].product_price,
        //     // productImg: result[0].product_img,
        //     // productDetail: result[0].product_detail,
        //     // userId: result[0].user_id,
        //     // businessId: result[0].business_id
        // }).then(result => {
        //     console.log('result 结果==>',result)
        //     // res.send({msg: config.sceneValues.shopcart.success.msg, status: config.sceneValues.shopcart.success.code});
        // })
   

        
        // orderDatas.orderData.forEach(v =>{
        //     console.log('v ==>',v)
        //     //根据商品id查询商品的价格、商品图片、商品名称,商品详情,商家id
        //     let sql = 'SELECT `s`.`user_id`, `p`.`product_id`, `p`.`product_name`, `p`.`product_price`, `p`.`product_img`,`p`.`product_detail`,`p`.`business_id` FROM `shopcart` AS `s` INNER JOIN `product` AS `p` ON `s`.`product_id` = $productId AND `p`.`product_id` = $productd';
        //     api.queryData(sql, {
        //     // phone: req.body.phone,
        //     productId: v.product_id

        //     }).then(result => {
        //         console.log('result 111111111==>',result)
        //         // if (result.length > 0) {
        //         //     api.createData('Shopcart', {
        //         //         productCount: req.body.count,
        //         //         productId: result[0].product_id,
        //         //         productName: result[0].product_name,
        //         //         productPrice: result[0].product_price,
        //         //         productImg: result[0].product_img,
        //         //         productDetail: result[0].product_detail,
        //         //         userId: result[0].user_id,
        //         //         businessId: result[0].business_id
        //         //     }).then(result => {
        //         //         res.send({msg: config.sceneValues.shopcart.success.msg, status: config.sceneValues.shopcart.success.code});
        //         //     })
        //         // } else {
        //         //     res.send({msg: config.sceneValues.shopcart.fail.msg, status: config.sceneValues.shopcart.fail.code});
        //         // }
        //     }).catch(err => {
        //         // console.log('productId ==>',productId)
        //         res.send({msg: config.sceneValues.findData.fail.msg, status: config.sceneValues.findData.fail.code});
        //     })
        // })


        




        // res.send(' 创建订单')
    }

    // 成功支付
    successPay(req,res){
        // console.log('req.body ==>',req.body.outTradeNo)

        // let sql = 'SELECT `status` FROM `order`'
        api.findData('Order', {
            orderId:req.body.outTradeNo,
        },['status']).then(result => {
            console.log('result  支付状态==>',result.length)
            if(result.length){

                api.updateData('Order',{
                    status:'已支付'
                },{
                    orderId:req.body.outTradeNo,
                }).then(data => {
                    console.log('data 支付==>',data);
        
                    // 支付成功
                    if(data[0] == result.length){
                        res.send({msg: config.sceneValues.alipay.successPay.msg, status: config.sceneValues.alipay.successPay.code})
                    }else {
                        // 支付失败
                        res.send({msg: config.sceneValues.alipay.failPay.msg, status: config.sceneValues.alipay.failPay.code})
                    }
                    
                }).catch(err => {
                    // 支付失败
                    res.send({msg: config.sceneValues.alipay.failPay.msg, status: config.sceneValues.alipay.failPay.code})
                })

            }else{
                res.send({msg: config.sceneValues.findData.fail.msg, status: config.sceneValues.findData.fail.code});
            }
            // res.send({msg: config.sceneValues.findData.success.msg, status: config.sceneValues.findData.success.code, data: result});
        }).catch(err => {
            res.send({msg: config.sceneValues.findData.fail.msg, status: config.sceneValues.findData.fail.code});
        })

        
    }

    // 待付款数据
    waitPayData(req, res){
        // console.log('req.query ==>',req.query)
        api.findData('User',{
            phone:req.query.phone
        },['userId']).then(result => {
            if(result.legnth == 0){
                return res.send({msg:config.sceneValues.login.info.msg,status:config.sceneValues.login.info.code})
            } else {
                if(result[0].dataValues.userId !== req.query.userId){
                    return res.send({msg:config.sceneValues.login.againLogin.msg,status:config.sceneValues.login.againLogin.code})
                } else{
                    // 根据用户id和商品状态=0查询购物车数据
                    // let sql = 'SELECT * FROM `order` ON `user_id` = $userId AND `status` = 未支付';
                    api.findData('Order', {
                    status: "未支付"
                    }).then(result => {
                        // console.log('result  未支付 ==>',result)
                        res.send({msg: config.sceneValues.findData.success.msg, status: config.sceneValues.findData.success.code, data: result});
                    }).catch(err => {
                        res.send({msg: config.sceneValues.findData.fail.msg, status: config.sceneValues.findData.fail.code});
                    })
                }
            }      
        }).catch(err => {
            res.send({msg:config.sceneValues.login.againLogin.msg,status:config.sceneValues.login.againLogin.code})
        })    
    }
    
    // 全部订单
    allOrder(req,res){
        // console.log('req.query.userId ==>',req.query)
        api.findData('Order', {
            user_id:req.query.userId,  
        }).then(result => {
            // console.log('result  全部 ==>',result)
            res.send({msg: config.sceneValues.findData.success.msg, status: config.sceneValues.findData.success.code, data: result});
        }).catch(err => {
            res.send({msg: config.sceneValues.findData.fail.msg, status: config.sceneValues.findData.fail.code});
        })
    }

    // 其他订单类型
    typeOrder(req,res){
        // console.log('req.query.userId ==>',req.query)
        api.findData('Order', {
            user_id:req.query.userId,  
            status:req.query.type
        }).then(result => {
            // console.log('result  全部 ==>',result)
            res.send({msg: config.sceneValues.findData.success.msg, status: config.sceneValues.findData.success.code, data: result});
        }).catch(err => {
            res.send({msg: config.sceneValues.findData.fail.msg, status: config.sceneValues.findData.fail.code});
        })
    }

    // 立即付款
    againCreateOrder(req,res){
        // console.log('req.query ==>',req.query)
        api.createData('Order', {
            orderId: req.query.outTradeNo,
            productId: req.query.productId,
            productName: req.query.productName,
            productDetail: req.query.productDetail,
            productPrice: req.query.productPrice,
            productImg: req.query.productImg,
            productCount: req.query.productCount,
            status:'未支付',
            address:req.query.address,
            userId: req.query.userId,
            businessId: req.query.businessId
        }).then(result => {
            res.send({msg: config.sceneValues.alipay.createOrderSuccess.msg, status: config.sceneValues.alipay.createOrderSuccess.code});
        })
    }

    // 删除订单表中重新付款的商品
    delectOrder(req,res){
        // console.log("req,body ==>",req.body)
        let deleteData = JSON.parse(req.body.deleteData);
        console.log('deleteData ==>',deleteData)
        api.findData('User',{
            phone:req.body.phone
        },['userId']).then(result => {
            if(result.legnth == 0){
                return res.send({msg:config.sceneValues.login.info.msg,status:config.sceneValues.login.info.code})
            } else {
                if(result[0].dataValues.userId !== req.body.userId){
                    return res.send({msg:config.sceneValues.login.againLogin.msg,status:config.sceneValues.login.againLogin.code})
                } else{

                    api.destroyData('Order', {
                        userId: req.body.userId,
                        [config.Op.or]: deleteData
                    }).then(result => {
                        // console.log('result ==>',result)
                        if (result == 0) {
                          //删除失败
                          res.send({msg: config.sceneValues.shopcart.deleteFail.msg, status: config.sceneValues.shopcart.deleteFail.code, data: result});
                        } else {
                          res.send({msg: config.sceneValues.shopcart.deleteSuccess.msg, status: config.sceneValues.shopcart.deleteSuccess.code, data: result});
                        }
                        
                    }).catch(err => {
                        res.send({msg: config.sceneValues.shopcart.deleteFail.msg, status: config.sceneValues.shopcart.deleteFail.code});
                    })        
                }
            }      
        }).catch(err => {
            res.send({msg:config.sceneValues.login.againLogin.msg,status:config.sceneValues.login.againLogin.code})
        })  
    }

    // 确认收货
    received(req,res){
        // console.log('req.body.user 普通==>',req.body)
        api.updateData('Order',{
            status:'已收货'
        },{
            productId:req.body.productId,
            createdAt:req.body.createdAt,
            userId:req.body.userId
        }).then(result => {
            // console.log('result 普通==>',result);
            // 更新成功
            if(result[0] == 1){
                res.send({msg: config.sceneValues.changeAddress.success.msg, status: config.sceneValues.changeAddress.success.code})
            }else {
                // 更新失败
                res.send({msg: config.sceneValues.changeAddress.fail.msg, status: config.sceneValues.changeAddress.fail.code})
            }
        }).catch(err => {
            // 更新失败
            res.send({msg: config.sceneValues.changeAddress.fail.msg, status: config.sceneValues.changeAddress.fail.code})
        })
    }

    // 我的页面的用户数据
    mineUser(req,res){
        api.findData('User',{
            phone:req.body.phone
        }).then(result => {
            // console.log('result name==>',result)
            res.send({msg: config.sceneValues.findData.success.msg, status: config.sceneValues.findData.success.code, data: result});         
        }).catch(err => {
            res.send({msg: config.sceneValues.findData.fail.msg, status: config.sceneValues.findData.fail.code});
        })   
    }
    
}

//导出RouteController实例
module.exports = new RouteController();