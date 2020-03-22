const express = require('express');
const router = express.Router();
const UserService = require('../service/UserService');
const stringUtils = require('../core/utils/StringUtils');
var UUID = require('uuid');

router.get('/', async function (req, res, next) {
    const user = req.session && req.session.user;
    if (user) {
        res.redirect("/admin");
    }
    res.render('index', {
        title: '云笔记',
        msg: "请输入您的用户名和密码"
    });
});

router.get('/exit', (req, res, next) => {
    req.session.destroy(function (err) {
        if (err) {
            console.error("--> session destroy failed.err -> ", err);
        }
    });
    res.redirect("/");
});
/* POST */
router.post("/login", async (req, res, next) => {
    console.log(req.body)
    var password = req.body.password;
    var username = req.body.username;
    var user = await UserService.getUser(username);
    if (user) {
        var salt = user.salt;
        var password2 = stringUtils.generatePassword(password.trim() + salt);
        if (user.password != password2) {
            res.status(200).json({error: 1, msg: "用户名或者密码错误"});
            return;
        }
        req.session.user = user;
        res.status(200).json({error: 0, msg: "登录成功"});
    } else {
        res.status(200).json({error: 1, msg: "用户名或者密码错误"});
    }
});
/* POST */
router.post("/register", async (req, res, next) => {
    console.log(req.body)
    var password = req.body.password;
    var repassword = req.body.repassword;
    var username = req.body.username;
    if (username == "" || username.trim() == "") {
        res.status(200).json({error: 1, msg: "用户名不能为空"});
    } else if (password == "" || password.trim() == "" || repassword == ""|| repassword.trim() == "") {
        res.status(200).json({error: 1, msg: "密码不能为空"});
    }else if (password.trim() != repassword.trim()) {
        res.status(200).json({error: 1, msg: "两次输入密码不相等"});
    } else {
        var user = await UserService.getUser(username);
        if (user) {
            res.status(200).json({error: 1, msg: "该账号已经存在"});
        } else {
            var salt = UUID.v1();
            var e_password = stringUtils.generatePassword(password+salt);
            await UserService.addUser({
                username: username, //用户账号
                password: e_password, //密码
                salt: salt, //salt
                email: "", //email
                phone: "", //phone
                IP: "", //Ip
                status:  0 //状态;0:正常，1：删除，2：禁用
            });
            res.status(200).json({error: 0, msg: "注册成功，请登录"});;
        }
    }
})

module.exports = router;
