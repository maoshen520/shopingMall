
// 需要token的白名单
module.exports = {
    // '/register'
    code:{
        key:'code',
        title:'验证码的token验证',
        url:['/register','/changePwd']
    },

    // 默认登录验证
    default:{
        key:'login',
        title:'登录的token验证',
        url:['/business','/uploadProductData','/findProjectData','/disabledProductData','/findSoldProjectData']
    }
   
}