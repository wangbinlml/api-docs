const createError = require('http-errors');
const express = require('express');
const log4js = require('log4js');

const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const redisClient = require("./core/utils/RedisUtils");
const logger = require('./core/utils/Logger').getLogger("system");
const config = require('./config/config');

const adminRouter = require('./routes/admin');
const categoryRouter = require('./routes/category');
const usersRouter = require('./routes/users');
const contentRouter = require('./routes/content');
const indexRouter = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(log4js.connectLogger(log4js.getLogger("express")));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session超时时间，单位：分钟
const timeout_minute = config.session_time_out_minute || 120;
app.use(session({
    secret: 'express',
    store: new RedisStore({
        client: redisClient.Redis,
        prefix: "admin_session_",
        ttl: timeout_minute * 60 // 过期时间
    }),
    resave: true,
    saveUninitialized: true
}));

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/admin/category', categoryRouter);
app.use('/admin/content', contentRouter);
app.use('/users', usersRouter);

function is_login(req) {
    if (req.url.indexOf("/admin") == 0 && !req.session.user) {
        return true;
    }
    return false;
}
app.use(function (req, res, next) {
    if (req.session == undefined) {
        var str = "无法获取session（cookie），确保redis是否连接正常。";
        logger.error(str);
        res.render("error", {msg: str, status: 403});
        return;
    }  else if (is_login(req)) {
        res.render("index", {msg: '您未登录或登录已超时！'});
        return;
    }
    next();
});

// catch 404 and forward to error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 404);
    res.render('error',{
        msg: '资源未发现',
        status: 404,
    });
    next();
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        msg: err.message,
        error: {}
    });
});

module.exports = app;
