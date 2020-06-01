

// 导入加密模块
let crypto = require('crypto');

//导入发邮件模块
let nodemailer = require('nodemailer');

//导入jsonwebtoken模块
let jsonwebtoken = require('jsonwebtoken');

// 导入阿里云发短信
let SMSClient = require('@alicloud/sms-sdk')

// 支付宝
const AlipaySdk = require('alipay-sdk').default
const AlipayFormData = require('alipay-sdk/lib/form').default
const fs = require('fs')
const path = require('path')
const request = require('request')


// 创建发送邮件实例
let transporter = nodemailer.createTransport({

    host: config.emailOptions.host,

    port: config.emailOptions.port,

    // 授权验证
    auth: {
        // 授权用户邮箱地址
        user: config.emailOptions.user,

        //授权码
        pass: config.emailOptions.pass
    }
})

// 导入时间格式化模块
let moment = require('moment')

// 发短信实例
let smsClient = new SMSClient({accessKeyId:config.messageOption.accessKeyId, secretAccessKey:config.messageOption.AccessKeySecret})


// 工具库
class Utils {

    // 字符串加密
    encodeString(value){
        //value: 被加密的字符串
        value = config.saltOptions.pwdSalt + value;

        // 使用MD5方式加密
        let md5 = crypto.createHash('md5');

        // 对value加密
        md5.update(value);

        return  md5.digest('hex');

    }

    //随机生成6位验证码
    getValidCode() {
        let codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        let codeString = '';

        for(let i=0; i<6; i++){
            let randomIndex = Math.floor(Math.random() * codes.length);

            codeString +=codes[randomIndex];
        }
        return codeString;
    }

    //发邮件
    sendEmail(emails, validCode, fn) {
    //emails: 接收邮件地址列表，array类型

        // 发送邮件
        transporter.sendMail({
            from: config.emailOptions.user, //邮件发送地址
            to: emails.join(','), //邮件接收地址
            subject:'邮件验证码',  //主题
            text:`验证码: ${validCode}, 小心受骗`
        },fn)
    }

    //将cookie转换为普通对象
    transformCookieObject(value){
        if(value){
            let cookieObject = {};
            value = value.split(/; /);
            for(let i=0; i<value.length; i++){
                let v= value[i].split('=');
                cookieObject[v[0]] = v[1];

            }
            return cookieObject;
        }
        return null;
    }

    // 生成token
    getToken(value, salt, time){
        // data: 生成token的数据
        // expiresIn:过期时间
        // salt：token加盐
        let codeToken = jsonwebtoken.sign({
            // 签名数据
            data:value
        }, salt, {expiresIn: time});

        return codeToken
    }

    // 验证token
    validToken(token, salt, fn){
        
        jsonwebtoken.verify(token, salt, fn);
    }

    // 发短信
    sendMessage(phones,code){
        // phones:接收短信手机号，类型string

        // let code = this.getValidCode();
        let templateParam = JSON.stringify({code});
        let params = {
            PhoneNumbers:phones.join(','),
            SignName:config.messageOption.signName,
            TemplateCode:config.messageOption.templateCode,
            TemplateParam:templateParam,
        }
        // console.log('params ==>',params)
        return smsClient.sendSMS(params)

    }

    // 格式化时间
    formatDate(dateString,format){
        return moment(dateString).format(format);
    }

    // 创建订单支付链接
    async createOrder(order){
        const alipaySdk = new AlipaySdk({
            appId:'2016101900722404',
            privateKey:'MIIEowIBAAKCAQEAwO16Rz47J+un7nzFcAcBt9tVi8QrLPO+qatJJ0u06ggucjUq9uNQZfQBNdsKW1s5/0x+IguwU93d8s7Hoy9Wo/Fj6/nu0iL/c0VBMqyAfLPY00HsVVZY5WUraCNHXrxtxXkzQi9MF8/Ng/+fL+siFbP4zSfOOFbKBV3VBPj75faPKPY1UjjBT1/L+ksduGlDTvW/PuqvotBCUGITspEIXnEKOYCEJrNTlBAox1+AK7d3YMeHnc+OOSvZz/813Byal8uin7USK22c1v738fxxOWJ6ca4SOsRb+P7gu+i/9tF3T3XxbJLj50F9KQlHez0sL4wLP90Q/WsiWziwvTyZtwIDAQABAoIBAFW88/uXT2jVVKMq9f9sTboskl7zxhBLHm9+vJrnDTZ4flOpBzgDG2bDwonxly+0YhjwIJn2wdzzm8BdXuFJl2JyU2q6fwUKIqZSn7/qY4uHzZNNF79xCT6g8GJuUzhp2wrIaxw9sr5eTkIcJt1/zH0Cp05dI0tsXol2AsYb9K5kVi4R9UbGAhO3fT3LxkTnPZyYxV+l/NZyUY9T2OLl7T/V4lF1CU1tnodvDrH+AxsxlQ1IWTLR7xixQixDaaPuD80qxBkw+byC2odkoRE2WgdJlcxPVh5KiqkdE+R5Xzu9anJ2U4751qeQSUDfC1O23hd6qr57g6uhsEg1PuW9wtECgYEA/pFp4cq57vhITHHQz1sSR8zP2pcXzSPRkhlfAsq8c41GfZ03A+qNcjqAFPaAcJhSOVew+sBQ/Vc0XngRE4Bz0FRzLRKkJWBF3iL2zVyHOz2TTio5GZ0qT6iQXXMkZCiZ71KVGaSR/PQ0ySpsfmxbu/dMqPqNtOggQl728FPYnPkCgYEAwgNMw9Hu0AEq4TymHQfmQAII568vtV/uQqVGciy1R6eE+fFMR9POXtKFgJRHGEjYD10GtP0cGr5dhcozL9sjk2VQEAxHXndrXR4qh6+KwJdxbhjqDhMWfjtSNb7WNEt7ZROBRbYc7U0DQXsiLRZHo01qUdCrHTEMFQO5M+QQCC8CgYEAgdOJK0TnZE8tGAdnlYh9ny59xp4N3mnpBFh6EwNv7oJbM87M8utY7auWDJrWUBXuwR3OvWL9KuahZ5hWJRr6dYHMJ219Vy5tE2fDdGI++WBi0pdH/Z8gp/VwgqgpJAds0hfMwIIkjdvBW+KN6D+83PS3HOqDAILtiMvDpjcsnokCgYB5Z3s35jxcaP6eJ0eDTxgj4aIU6KkgBEGh7q5gb92YUxmBFh+3qrCu4WmtBhxe8+ZP5tR1mRVnHsyDFf5l6ekfKPyqriRS1sOWZ3QRqCVZUusmC+0alZMztodBHoQIAVvb6hKwvr7nN5Pb++Ns904owB7Rx5PsFm8LD2NrN0FY/QKBgBDq60Wpa6m6RS2ZVnTg3Jms4PHUL4SN22cRy+rDGfbqPoKxBBVTXs0E38WyMSr1E70nY+z4fHRpRXyqZqKi6cpZu0PIEi0QEy/gqB6VZWOXdhT5aJNv9Aw/DKMkYi1TwPp22ShJRIHv+aGNmWFA/MI0qqFaFtcOClOYk+cf+ja/',//应用私钥
            // privateKey:fs.readFileSync('../sandbox-pem/private_pem.txt','ascli'),//应用私钥
            alipayPublicKey:'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAignNNs1btvAB0oyrSRfXUl5/2DyZp0ybhfDDZZvXD539w1Has9fkrZe0dgYlidHHvWqy23Dr5Zo7qFwLSLJ/yWOznxRItTZnAmuBVoqyK/+0WQmTI2gg+GXea/k+fbXQAc3MMgsyEFJAq9RvOpCw8ncwOeg/SHypY26r8omNa2zBQ04l4Frwa8IMl/ByNjamofeCzaju3Yo+1/5eSZ9qJztqFW0NxfIPI+E8iuLrsS6BLNULzqW5WGiU378oTOBVzUuschJ2CtpDVcMJ7jXqj72WmqFq5YcIZ5ZfgeUM5SKwc9kF+CedtaqQRTIaZPn4p5knryiPexwDLX+uTjZ9PwIDAQAB',//支付宝公钥
            gateway: 'https://openapi.alipaydev.com/gateway.do',
            // gateway: 'https://openapi.alipay.com/gateway.do',
            charset:'utf-8',	// 字符集编码
            version:'1.0',		// 版本，默认 1.0
            signType:'RSA2',
            timeout: 5000, // 网关超时时间
            camelcase:true
        })  
        const formData = new AlipayFormData();
        formData.setMethod('get');
        // formData.addField('notifyUrl','http://localhost:8080/#/homePage')
        formData.addField('notifyUrl', 'http://www.com/notify'); // 当支付完成后，支付宝主动向我们的服务器发送回调的地址
        // formData.addField('notifyUrl', 'http://localhost:8080/#/pcShopcart'); // 当支付完成后，支付宝主动向我们的服务器发送回调的地址
        formData.addField('returnUrl', 'http://localhost:8080/#/pcMyOrder'); // 当支付完成后，当前页面跳转的地址

        const bizContent = {
            outTradeNo: Date.now(),
            // outTradeNo: '2',
            productCode:'FAST_INSTANT_TRADE_PAY',
            totalAmount:order.const,
            // totalAmount:'0.01',
            // subject:'商品111',
            subject:'商品',
            body:'商品详情',
            // timeout_express:'5m',
            // passback_params: JSON.stringify(order.pack_params), // 将会返回的一个参数，可用于自定义商品信息最后做通知使用
        }

       
        formData.addField('bizContent',bizContent);
        const payUrl =await alipaySdk.exec(
            'alipay.trade.page.pay',
            // 'alipay.system.oauth.token',
            {},
            { formData: formData }
        );
        let result = []
        result.payUrl = payUrl;
        result.outTradeNo = bizContent.outTradeNo
        // console.log('result 支付链接==>',result);
        return result   
    }

    // 订单查询
    async verify(outTradeNo){
        const alipaySdk = new AlipaySdk({
            appId:'2016101900722404',
            privateKey:'MIIEowIBAAKCAQEAwO16Rz47J+un7nzFcAcBt9tVi8QrLPO+qatJJ0u06ggucjUq9uNQZfQBNdsKW1s5/0x+IguwU93d8s7Hoy9Wo/Fj6/nu0iL/c0VBMqyAfLPY00HsVVZY5WUraCNHXrxtxXkzQi9MF8/Ng/+fL+siFbP4zSfOOFbKBV3VBPj75faPKPY1UjjBT1/L+ksduGlDTvW/PuqvotBCUGITspEIXnEKOYCEJrNTlBAox1+AK7d3YMeHnc+OOSvZz/813Byal8uin7USK22c1v738fxxOWJ6ca4SOsRb+P7gu+i/9tF3T3XxbJLj50F9KQlHez0sL4wLP90Q/WsiWziwvTyZtwIDAQABAoIBAFW88/uXT2jVVKMq9f9sTboskl7zxhBLHm9+vJrnDTZ4flOpBzgDG2bDwonxly+0YhjwIJn2wdzzm8BdXuFJl2JyU2q6fwUKIqZSn7/qY4uHzZNNF79xCT6g8GJuUzhp2wrIaxw9sr5eTkIcJt1/zH0Cp05dI0tsXol2AsYb9K5kVi4R9UbGAhO3fT3LxkTnPZyYxV+l/NZyUY9T2OLl7T/V4lF1CU1tnodvDrH+AxsxlQ1IWTLR7xixQixDaaPuD80qxBkw+byC2odkoRE2WgdJlcxPVh5KiqkdE+R5Xzu9anJ2U4751qeQSUDfC1O23hd6qr57g6uhsEg1PuW9wtECgYEA/pFp4cq57vhITHHQz1sSR8zP2pcXzSPRkhlfAsq8c41GfZ03A+qNcjqAFPaAcJhSOVew+sBQ/Vc0XngRE4Bz0FRzLRKkJWBF3iL2zVyHOz2TTio5GZ0qT6iQXXMkZCiZ71KVGaSR/PQ0ySpsfmxbu/dMqPqNtOggQl728FPYnPkCgYEAwgNMw9Hu0AEq4TymHQfmQAII568vtV/uQqVGciy1R6eE+fFMR9POXtKFgJRHGEjYD10GtP0cGr5dhcozL9sjk2VQEAxHXndrXR4qh6+KwJdxbhjqDhMWfjtSNb7WNEt7ZROBRbYc7U0DQXsiLRZHo01qUdCrHTEMFQO5M+QQCC8CgYEAgdOJK0TnZE8tGAdnlYh9ny59xp4N3mnpBFh6EwNv7oJbM87M8utY7auWDJrWUBXuwR3OvWL9KuahZ5hWJRr6dYHMJ219Vy5tE2fDdGI++WBi0pdH/Z8gp/VwgqgpJAds0hfMwIIkjdvBW+KN6D+83PS3HOqDAILtiMvDpjcsnokCgYB5Z3s35jxcaP6eJ0eDTxgj4aIU6KkgBEGh7q5gb92YUxmBFh+3qrCu4WmtBhxe8+ZP5tR1mRVnHsyDFf5l6ekfKPyqriRS1sOWZ3QRqCVZUusmC+0alZMztodBHoQIAVvb6hKwvr7nN5Pb++Ns904owB7Rx5PsFm8LD2NrN0FY/QKBgBDq60Wpa6m6RS2ZVnTg3Jms4PHUL4SN22cRy+rDGfbqPoKxBBVTXs0E38WyMSr1E70nY+z4fHRpRXyqZqKi6cpZu0PIEi0QEy/gqB6VZWOXdhT5aJNv9Aw/DKMkYi1TwPp22ShJRIHv+aGNmWFA/MI0qqFaFtcOClOYk+cf+ja/',//应用私钥
            // privateKey:fs.readFileSync('../sandbox-pem/private_pem.txt','ascli'),//应用私钥
            alipayPublicKey:'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAignNNs1btvAB0oyrSRfXUl5/2DyZp0ybhfDDZZvXD539w1Has9fkrZe0dgYlidHHvWqy23Dr5Zo7qFwLSLJ/yWOznxRItTZnAmuBVoqyK/+0WQmTI2gg+GXea/k+fbXQAc3MMgsyEFJAq9RvOpCw8ncwOeg/SHypY26r8omNa2zBQ04l4Frwa8IMl/ByNjamofeCzaju3Yo+1/5eSZ9qJztqFW0NxfIPI+E8iuLrsS6BLNULzqW5WGiU378oTOBVzUuschJ2CtpDVcMJ7jXqj72WmqFq5YcIZ5ZfgeUM5SKwc9kF+CedtaqQRTIaZPn4p5knryiPexwDLX+uTjZ9PwIDAQAB',//支付宝公钥
            gateway: 'https://openapi.alipaydev.com/gateway.do',
            // gateway: 'https://openapi.alipay.com/gateway.do',
            charset:'utf-8',	// 字符集编码
            version:'1.0',		// 版本，默认 1.0
            signType:'RSA2',
            timeout: 5000, // 网关超时时间
        })  
        const formData = new AlipayFormData();
        // formData.addField('notifyUrl','http://localhost:8080/#/homePage')
        // formData.addField('notifyUrl','http://127.0.0.1:10002')
        formData.setMethod('get');
       
        formData.addField('bizContent',{
            outTradeNo: outTradeNo,
        });
        await alipaySdk.exec(
            'alipay.trade.query',
            // 'alipay.system.oauth.token',
            {},
            { formData: formData }
        ).then(result =>{
            // console.log('result 1111111==>',result)
            if(result){
                request(result,function (error,response, body){
                    let obj = JSON.parse(body);
                    // let msg = getResponseMsg(obj);    
                    console.log('obj ==>',obj)
                    // console.log('msg ==>',msg)
                })
            }
        })    
    }

 

}
module.exports = new Utils();