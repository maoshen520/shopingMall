$(function () {
  
  let requestUrl = 'http://127.0.0.1:10002'
  
  //将cookie转换为普通对象
  function transformCookieObject(value){
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

  // 登录身份验证
  // 获取cookie
  let cookieData = transformCookieObject(document.cookie);
  // console.log('cookieData11111 ==>',cookieData)

  // 进行身份验证
  $.ajax({
    type:'POST',
    url:requestUrl + '/business',
    // 跨域携带cookie
    data:{
      key:'default'
    },
    xhrFields:{
      withCredentials:true
    },
    success: function (data){
      // console.log('data2222 ==>',data)

      if(data.status == 5000){
        $('#user_name').text(data.msg.username)
      }else {
        location.href = '/login';
      }
      
    }

  })

  // 商品类型列表
  let eleName = '';

  // 每一页展示两条数据
  let count = 2;

  // // 总页数
  // let pageTotalCount = 0;

  // 当前页码
  let currentPageCode = 0


  $('#list-group').on('click','li',function(){
    if($(this).hasClass('active')){
      return;
    }
    $(this).addClass('active').siblings().removeClass('active');

    let title = $(this).parent().data('title');//获取当前父元素的data的title值

    let lititle = $(this).data('lititle');

    let lis = $('.breadcrumb').find('li');

    //删除长度大于2的部分
    if(lis.length>=2){
      lis.last().remove();
    }

    // 增加节点
    lis.eq(0).text(title);
    $('.breadcrumb').append('<li class="breadcrumb-item">' + lititle + '</li>');

    // 当点击下一个节点时，上一个节点隐藏
    if (eleName != '') {
      $('.' + eleName).hide();
    }

    // 点击的当前的节点显示
    eleName = $(this).attr('name');

    if(eleName == 'add-product'){

      // 添加商品
      $.ajax({
        type:'GET',
        url:requestUrl + '/productsType',
        data:{
          key:'default'
        },
        xhrFields:{
          withCredentials: true
        },
        success: function (data) {

          if(data.status == 7000){

            // 将其他分类的option删除（商品类型）
            $('#product-type').find('option:not([value="default])').remove()

            data.data.forEach( v => {
              let option = $(`<option value="${v.typeId}">${v.typeTitle}</option>`)
              $('#product-type').append(option)
            })
          }else {
            res.send({msg:data.msg})
          }
        }
      })
    } else if(eleName == 'edit-product'){
      // 分页查询
      getPaginationData(0,1)
      
    }

    $('.' + eleName).show();
  })

  // 分页查询请求
  function getPaginationData(offset,pageCode) {
    $.ajax({
      type:'GET',
      url:requestUrl + '/findProjectData',
      data:{
        key:'default',
        offset
      },
      xhrFields:{
        withCredentials: true
      },
      success: function (data) {
        // console.log('data 获取商家的商品数据 ==>',data)

        if(data.status == 8000){

          // 先清空
          $('tbody').html('');
          // 总页数
          let pageCount = Math.ceil(data.data.count / count)

          $('#page-count').text(pageCount);
          // 设置当前页码
          $('#page').text(pageCode);
          currentPageCode = pageCode ;
          // console.log('currentPageCode 222==>',currentPageCode)


          // 生成商品数据
          for (let i=0; i<data.data.result.length; i++){
            let d = data.data.result[i];

            let $tr = $(`<tr>
                <td><input type="checkbox"></td>
                <td>${i + 1}</td>
                <td>
                  <div class="img-box">
                    <img class="auto-img" src="${requestUrl + '/assets/' + d.product_img}" alt="">
                  </div>
                </td>
                <td>${d.product_id}</td>
                <td>${d.product_name}</td>
                <td>${d.product_price}</td>
                <td>${d.vip_price}</td>
                <td>${d.is_vip == 0 ? '否': '是'}</td>
                <td>${d.type_title}</td>
                <td>${d.product_count}</td>
                <td>${d.created_at}</td>
                <td>
                  <button data-id="${d.product_id} type="button" class="btn btn-success btn-sm">查看</button>
                  <button data-id="${d.product_id} type="button" class="btn btn-dark btn-sm">编辑</button>
                  <button data-id="${d.product_id}" type="button" class="btn disable-btn btn-warning btn-sm ${d.product_is_user == 0 ? 'hide' : ''}">禁用</button>
                  <button data-id="${d.product_id} type="button" class="btn enable-btn btn-info btn-sm ${d.product_is_user == 1 ? 'hide' : ''}">启用</button>
                  <button data-id="${d.product_id} type="button" class="btn btn-danger btn-sm">删除</button>
                </td>
              </tr>`);

            $('tbody').append($tr);
          }

        } else {
          console.log(data.msg)
        }
            
      }
    })

  }

  // 分页查询
  $('.pagination').on('click','li', function () {

    let id = $(this).attr('id')
    // console.log('id ==>',id)


    // 获取总页数
    let pageCount = $('#page-count').text();

    // 上一页
    if(id == 'prev'){
      if(currentPageCode == 1){     
        // 没有可查询
        return;
      }
      getPaginationData((currentPageCode - 2) * count, --currentPageCode)
      // console.log('currentPageCode ==>',currentPageCode)
      
    }else if((id == 'next')) {
      // 下一页
      if(currentPageCode == pageCount){
        // 没有可查询
        return;
      }       
      getPaginationData(currentPageCode * count, ++currentPageCode)
    }

  })

  // 商品表单验证
  let productValid = {

    // 表单中的name属性值
    // 类型
    'product-type':{
      // 验证不通过显示的文本提示
      errorMsg:'请选择商品类型'
    
    },

    // 商品名称
    'product-name':{

      // 必填
      required:true,

      //正则表达式
      reg:/^(?!.*[<>]).{1,30}$/,

      // 验证不通过显示的文本提示
      errorMsg:'请输入不能含有<>且长度为1-30的商品名称'

    },

    // 商品价格
    'product-price': {
      required:true,
      reg:/^([1-9]\d*|0)(\.(\d{2}))?$/,
      errorMsg:'价格必须是数字且最多2位小数'
    },

    // 会员价格
    'vip-price':{
      required:true,
      reg:/^([1-9]\d*|0)(\.(\d{2}))?$/,
      errorMsg:'会员价格必须是数字且最多2位小数'
    },

    // 商品详情
    'product-detail':{
      required:true,
      reg:/^(?!.*[<>]).{0,300}$/,
      errorMsg: '商品描述选填且不能含有<>且字符长度为0-300'
    },

    // 商品数量
    'product-count': {
      required: true,
      reg: /^((0)|([1-9]\d*))$/,
      errorMsg: '库存量只能是整数值'
    },

    // 商品图片
    'product-img': {
      required: true,
      errorMsg: '请上传商品图片'
    }

  }


  //开始会员价格
  $('#open-vip').on('change', function () {

    let isChecked = $(this).prop('checked')
    $('#vip-price').prop('disabled', !isChecked);

    // configValid['product-vip-price'].required = isChecked;

    if (!isChecked) {
      $('#vip-price').val('');
    }
  })

  // 后台服务器写入图片的base64码
  let serverBase64Img = ''

  // 保存图片类型
  let imgType = '';

  // 上传图片
  $('#upload').on('change', function () {

    let file = $(this)[0].files[0];
    console.log('file ==>',file)

    // 只能是jpg,jpeg,png,webp
    let types = ['jpg', 'jpeg', 'png', 'webp'];
    let type = file.type.split('/')[1];

    if(types.indexOf(type) > -1){

      // 图片大小不能超过1M
      let size = 1024 * 1024;
      if(file.size > size) {
        console.log('上传图片大小不能超过1M');
        return;
      }

      // 创建读取对象文件对象
      let reader = new FileReader();

      // 读取文件
      reader.readAsDataURL(file);

      reader.onload = function (e) {

        // 获取读取图片的base64码
        let base64 = e.target.result;
        // console.log('base64 ==>',base64)

        //保存后台服务器base64格式
        serverBase64Img = base64.replace(/^data:image\/[A-Za-z]+;base64,/, '');

        //创建图片对象
        let image = $(`<img class="auto-img" src="${base64}"  />`);
        $('#preview-img').html('').append(image);

        image.on('load',function () {

        // 获取图片的原始尺寸
        let naturalWidth = image[0].naturalWidth;
        let naturalHeight = image[0].naturalHeight;

        console.log('naturalWidth ==>',naturalWidth)
        console.log('naturalHeight ==>',naturalHeight)

        // 图片宽高必须大于400px
          if(naturalWidth >=30 && naturalWidth == naturalHeight){

            $('.preview-box').show();

            // 记录图片类型
            imgType = type;

          } else {
            console.log('图片尺寸不合适')

            // 清空上传文件控制的值
            $('#upload').val();
            $('#preview-img').html('')

          }
        })    
      }

    } else {
      $(this).val('');  
    }
  })


    // 提交
  $('#commit').on('click',function(){
    let result = validForm.valid(productValid);
    // console.log("result ==>",result)
    console.log(result)

    if(result.isValid) {
      console.log('发起ajax请求');

      delete result.data['product-img'];

      result.data.serverBase64Img = serverBase64Img;

      // 后台验证登录验证标识
      result.data.key = 'default';

      // 图片类型
      result.data.imgType = imgType;

      console.log('result.data ==>', result.data);

      result.data['is-vip']= result.data['vip-price'] == '' ? 0 : 1;

      result.data['vip-price']=Number(result.data['vip-price']) ;

      result.data['product-price']=Number(result.data['product-price']) ;

      result.data['product-count']=Number(result.data['product-count']) ;


      // 发起ajax请求
      $.ajax({
        type:'POST',
        url:requestUrl + '/uploadProductData',
        data: result.data,
        xhrFields:{
          withCredentials:true
        },
        success: function (data) {
          console.log('data ==>', data)
          if(data.status == 2001){
            location.href = '/login';
          }
        }
      })
    }

  })


  // 安全退出
  $('#signOut').on('click',function () {
    // 格林威志时间
    let expires = new Date('1970-01-01 00:00:00').toUTCString();

    // 删除cookie
    document.cookie = 'utk=;expires=' + expires;
    location.href = '/login';
  })

  //禁用
  $('tbody').on('click','.disable-btn',function(){
    let _this = this;

    // 获取商品id
    let pid = $(this).data('id');

    $.ajax({
      type:'POST',
      url:requestUrl + '/disabledProductData',
      data:{
        key:'default',
        pid
      },
      xhrFields:{
        withCredentials:true
      },
      success: function (data){
        console.log('data ==>',data)
        
        // 禁用成功
        if(data.status == 9000){
          $(_this).hide();
          $(_this).parents('tr').find('.enable-btn').show();
        }else {
          console.log('data ==>',data)
        }
      }
    })
  })


})