const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Category = require('../models/Category');
const Content = require('../models/Content');
const CategoryService = require('../service/CategoryService');

router.get('/menus', async function (req, res, next) {
    const user = req.session.user;
    const userId = user._id;
    const category = await CategoryService.getCategories(userId);
    res.status(200).json({
        code: 0,
        msg: "获取成功",
        data: category
    });
});
router.get('/getCategory', async function (req, res, next) {
    const user = req.session.user;
    const userId = user._id;
    const category = await CategoryService.getCategory(userId);
    res.status(200).json({code: 0, msg: "保存成功", data: category});
});
router.post('/add', async function (req, res, next) {
    const user = req.session.user;
    const userId = user._id;
    const name = req.body.name;
    const pid = req.body.pid || "5e74d421bd68c4301208cf5b";
    const level = req.body.level;
    const opt = req.body.opt || 1;
    const icon = req.body.icon || 'fa fa-folder';
    if (!name || !pid || !level) {
        res.status(200).json({code: 101, msg: "参数不全"});
    } else {
        let category = await Category.findOne({
            where: {
                userId: userId,
                pid: pid,
                name: name
            }
        });
        if (category) {
            res.status(200).json({code: 101, msg: name + "已经存在"});
        } else {
            category = {
                name: name,
                userId: userId,
                pid: pid,
                level: level,
                icon: icon,
                opt: opt,
                isDefault: false
            };
            await CategoryService.addCategory(category);
            res.status(200).json({code: 0, msg: "保存成功"});
        }
    }
});
router.post('/update', async function (req, res, next) {
    const user = req.session.user;
    const userId = user._id;
    const id = req.body.id;
    const name = req.body.name;
    const pid = req.body.pid || 0;
    const level = req.body.level;
    const opt = req.body.opt || 1;
    if (!id || !name || !pid || !level) {
        res.status(200).json({code: 101, msg: "参数不全"});
    } else {
        let category = await Category.findOne({
            where: {
                userId: userId,
                pid: pid,
                name: name
            }
        });
        if (category) {
            res.status(200).json({code: 101, msg: name + "已经存在"});
        } else {
            category = {
                id: id,
                name: name,
                pid: pid,
                level: level,
                opt: opt
            };
            await CategoryService.updateCategory(category);
            res.status(200).json({code: 0, msg: "更新成功"});
        }
    }
});

router.post('/delete', async function (req, res, next) {
    const user = req.session.user;
    const userId = user._id;
    const id = req.body.id;
    if (!id) {
        res.status(200).json({code: 101, msg: "参数不全"});
    } else {
        const content = await Content.findOne({
            where: {
                category: id,
                userId: userId
            }
        });
        if (content) {
            res.status(200).json({code: 101, msg: "请先删除下面文章，在删除该目录"});
        } else {
            await CategoryService.deleteCategory(id, userId);
            res.status(200).json({code: 0, msg: "删除成功"});
        }
    }
});

module.exports = router;
