var crypto = require("crypto");
var getIP = require('ipware')().get_ip;
var key = 'OxLYdFmu3YS1haMUcaBmGMBK0P7PbOqb'; //百度api的key

var PASSWORD_SALT = "09iioi00009ij";

/**
 * 根据指定字符串生成加密后的密码<br />
 * 加密方式:将密码+固定盐值（SALT）先进行md5得到二进制字节数组后再进行Base64加密得到密文结果
 * @param str 明文密码
 * @returns 加密密码
 */
module.exports.generatePassword = function (str) {
    return crypto.createHash("md5").update(str + PASSWORD_SALT).digest("base64");
};

module.exports.getReqRemoteIp = function (req) {
    const ipInfo = getIP(req);
    return ipInfo.clientIp.replace("::ffff:", "");
};
