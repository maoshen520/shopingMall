let fs = require('fs')
let path = require('path')

const AlipayBaseConfig = {
    appId: '2016101900722404',
    gateway: 'https://openapi.alipaydev.com/gateway.do',
    signType: 'RSA2', 
    privateKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA06Z0u8fsBAbcR8p3GQIBRLl/AynuLrGQ290Qq48zxEmgpQd5DnwRLgg+3l0LMCezt0mEwAYz8MsniDBl8FLleREWhwhVeTn1vWO/KwLUgMx+DcpX7wsK01ZENm/Sbol2o9+F9flF4CGpPQG6K9YwK4tiGYHtayuyymvfsgLqmk9ZaAFaFN8oE5F4FHeWa/D2YsLU42pO+zPom75yN4xvX3ol3VIUTEyjX9Ok4a4o/zDRjVSkUOa7dFnviluyCGgzbuhmrHj9mHkc0Dz7EchctZW/tY5JTQ8R3HpaTD8znWl0/4eJSxfo9UErn2y7qU8VjCrVC88Gv9IvXlk7i8YNEQIDAQAB',
    alipayPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAignNNs1btvAB0oyrSRfXUl5/2DyZp0ybhfDDZZvXD539w1Has9fkrZe0dgYlidHHvWqy23Dr5Zo7qFwLSLJ/yWOznxRItTZnAmuBVoqyK/+0WQmTI2gg+GXea/k+fbXQAc3MMgsyEFJAq9RvOpCw8ncwOeg/SHypY26r8omNa2zBQ04l4Frwa8IMl/ByNjamofeCzaju3Yo+1/5eSZ9qJztqFW0NxfIPI+E8iuLrsS6BLNULzqW5WGiU378oTOBVzUuschJ2CtpDVcMJ7jXqj72WmqFq5YcIZ5ZfgeUM5SKwc9kF+CedtaqQRTIaZPn4p5knryiPexwDLX+uTjZ9PwIDAQAB',//刚刚你使用公钥在沙箱页面生成的支付宝公钥
    charset:'utf-8',
    version:'1.0',
}

module.exports = {
    AlipayBaseConfig:AlipayBaseConfig,
}