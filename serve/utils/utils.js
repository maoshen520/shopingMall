

// 导入加密模块
let crypto = require('crypto');

//导入发邮件模块
let nodemailer = require('nodemailer');

//导入jsonwebtoken模块
let jsonwebtoken = require('jsonwebtoken');

// 导入阿里云发短信
let SMSClient = require('@alicloud/sms-sdk')


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

        // console.log('code ==>',code)
        // console.log('templateParam ==>',templateParam)

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

}
module.exports = new Utils();