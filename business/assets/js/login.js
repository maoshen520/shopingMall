$(function(){

    let requestUrl = 'http://127.0.0.1:10002'

    // 验证表单
    let loginVolid = {

        // 用户名
        // username:{
        //     required: true,
        //     reg:/^[\w\u4e00-\u9fa5]{3,8}/,
        //     errorMsg:'用户支持汉字字母数字下划线组合且长度为3-8个字符'
        // },
        // 用户名
        email: {
            required: true,
            reg: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
            errorMsg: '邮箱格式不正确'
        },

        // 密码
        password1: {
            required: true,
            reg:/^(?=.*[A-Za-z])(?=.*\d)[\d\D]{8,16}$/,
            errorMsg:'密码支持至少1个字母，至少1个数字，任意字符且长度为8-16字符'
        },
    };


    // 登录
    $('#login').on('click',function(){

        let result = validForm.valid(loginVolid);
        console.log('result==>',result)

        if(result.isValid){

            // 发起登录post请求
            $.ajax({
                type:'POST',
                url:requestUrl + '/login',
                data: result.data,
                //跨域携带cookie
                //跨域携带cookie
                xhrFields: {
                    withCredentials: true
                },
                // dataType: 'jsonp',  // 请求方式为jsonp
                success:function (data){
                    console.log('data ==>',data)

                    if (data.status == 2000) {

                        // 使用cookie保存token凭证，用于登录验证
                        let time = new Date().getTime() + data.time * 24 * 60 * 60 * 1000;

                        time = new Date(time).toUTCString();
                        // console.log('time ==>',time);

                        // 设置cookie
                        document.cookie = data.__utk.key + '=' + data.__utk.utk + ';expires=' + time;

                        // 路径跳转
                        location.href = '/';
                        alert(data.msg)
                    } else {
                        alert(data.msg);
                    }

                }
            })
        }

    })





})