$(function () {

    let requestUrl = 'http://127.0.0.1:10002';

    //表单验证配置
    let registerValid = {

        // 用户名
        username:{
            required: true,
            reg:/^[\w\u4e00-\u9fa5]{3,8}/,
            errorMsg:'用户支持汉字字母数字下划线组合且长度为3-8个字符'
        },

        //邮箱
        email: {
            required: true,
            reg: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
            errorMsg: '邮箱格式不正确'
        },

        // 密码
        password1: {
            required: true,
            reg:/^(?=.*[A-Za-z])(?=.*\d)[\d\D]{8,16}$/,
            errorMsg:'用户支持至少1个字母，至少1个数字，任意字符且长度为8-16字符'
        },

        // 确认密码
        password2:{
            isEqual:true,//是否验证两值相等
            value:'',
            required:true,
            errorMsg:'两次密码不一致'
        },

        // // 验证码
        // code:{
        //     isEqual:true,//是否验证两值相等
        //     value:'',
        //     required:true,
        //     errorMsg:'验证码不正确'
        // }

    };

    //获取验证码
    let time = 10;
    $('#getcode').on('click',function() {
        let _this = this;

        //获取邮箱
        let email = $('#email').val();
        $(this).text(time + 's后重新获取').prop('disabled',true);

        

        let timer = setInterval(function () {
            time--;
            if(time < 0){
                clearInterval(timer);
                time = null;
                $(_this).text('获取验证码').prop('disabled',false);
                time = 10;
                return;
            }
            $(_this).text(time + 's后重新获取');
        },1000)


        // 请求服务器发送邮件
        $.ajax({
            type:'POST',
            url: requestUrl + '/sendEmail',
            data:{
                email: email
            },
            success:function(data){
                console.log('data1111==>',data);

                // 防止发送邮箱失败
                if(data.status = 4000){
                    //设置cookie过期时间
                    let expires = new Date().getTime() + data.time * 1000;

                    //将时间转换为格林威治时间
                    expires = new Date(expires).toUTCString();

                    //将生成的token保存在cookie
                    document.cookie = data.__ctk.key + '=' + data.__ctk.ctk + ';expires=' + expires;
                }
                else {
                    alert(data.msg)
                }

            }
        })


    })

    // 注册
    $('#register').on('click',function () {

        let password1 = $('#password1').val();

        registerValid.password2.value = password1;
        // registerValid.code.value = code;

        let result = validForm.valid(registerValid)
        console.log('result==>',result)

        if(result.isValid){
            //发起注册post请求

            // 删除确认密码
            delete result.data.password2;

            //获取用户输入的验证码
            result.data.code = $('#code').val();

            // 用于判断验证的token验证
            result.data.key = 'code';

            // 发起请求
            $.ajax({
                type:'POST',
                url: requestUrl + '/register',
                data:result.data,

                //跨域携带cookie
                xhrFields: {
                    withCredentials: true
                },

                success:function(data){
                    console.log('data==>',data);

                    if(data.status == 1000){
                        location.href = '/login'
                    } else if(data.status ==1001 || data.status == 1002){
                        console.log(data.msg)
                    }                    
                }
            })

        }
        
    })

})