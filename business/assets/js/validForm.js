
let validForm = {

  query: function (selector) {
    return document.querySelector(selector);
  },

  addErrorMsg: function (element, errorMsg) {

    element.classList.add('is-invalid');
    let node = element.nextSibling;

    //如果下一个节点是文本节点
    if (node.nodeType == 3) {
      node = node.nextSibling;
    }

    node.textContent = errorMsg;
  },

  //验证表单, 验证通过返回true，否则返回false
  valid: function (o) {

    let data = {};

    for (let key in o) {
      // console.log('o==>',o)
      // console.log('key==>',key)

      //获取验证控件元素
      let element = this.query('[name="' + key + '"]');
      // console.log('element==>',element)

      //获取元素的值
      let value = element.value;

      if (element.nodeName == 'SELECT' && value == 'default') {
        this.addErrorMsg(element, o[key].errorMsg);
        continue;
      }

      if (o[key].required) {
        if (value == '') {
          this.addErrorMsg(element, o[key].errorMsg);
          continue;
        }
      }

      //是否验证两值相等
      if(o[key].isEqual) {
        if (value != o[key].value) {
          this.addErrorMsg(element, o[key].errorMsg);
          continue;
        }
      }

      //如果存在正则，需要使用正则验证
      if (o[key].reg) {

        if(value != '' && !o[key].reg.test(value)) {
          //如果验证不通过
          this.addErrorMsg(element, o[key].errorMsg);
          continue;
        }

      }

     data[key] = value;

     //如果当前表单控件通过
     element.classList.remove('is-invalid');

    }

    //获取含有is-invalid类名的元素
    let isInvalidElement = this.query('.is-invalid');
    if (isInvalidElement) {
      return {isValid: false};
    }

    return {
      isValid: true,
      data
    };
  }
};
