const mongoose = require('../core/db');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    username: {type: String}, //用户账号
    password: {type: String}, //密码
    email: {type: String}, //email
    phone: {type: String}, //phone
    createAt: {type: Date, default: Date.now}, //创建时间
    IP: {type: String}, //Ip
    loginDate: {type: Date} //最近登录时间
});
module.exports = mongoose.model('User', UserSchema, 'user');