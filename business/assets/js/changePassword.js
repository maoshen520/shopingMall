$(function () {

    let requestUrl = 'http://127.0.0.1:10002';

    //表单验证配置
    let changePasswordValid = {

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
        },1000);


        // 请求服务器发送邮箱
        $.ajax({
            type:'POST',
            url:requestUrl + '/changePwdGetEmail',
            data: {
                email:email
            },
            success: function (data){
                console.log('data==>',data)

                // 防止发送邮箱失败
                if(data.status = 4000){
                    // 发送成功

                    //设置cookie过期时间
                    let expires = new Date().getTime() + data.time * 1000;

                    //将时间转换为格林威治时间
                    expires = new Date(expires).toUTCString();

                    //将生成的token保存在cookie
                    document.cookie = data.__ctk.key + '=' + data.__ctk.ctk + ';expires=' + expires;
                }else if(data.status == 4001 || data.status == 1003) {
                    alert(data.msg)
                }

            }

        })

    });

    // 提交按钮
    $('#commit').on('click',function() {
        let result = validForm.valid(changePasswordValid);
        console.log('result==>',result)
     
        let password1 = $('#password1').val();
        // let code = 123

        changePasswordValid.password2.value = password1;

        if(result.isValid){

            delete result.data.password2

            result.data.key = 'code';
            result.data.code = $('#code').val();

            $.ajax({
                type:'POST',
                url: requestUrl + '/changePwd',
                data: result.data,
                xhrFields: {
                    withCredentials: true
                },

                success: function (data) {
                    console.log('data ==>',data)
                }
            })
        }
    })
})
