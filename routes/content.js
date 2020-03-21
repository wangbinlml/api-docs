const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Category = require('../models/Category');
const Content = require('../models/Content');
const CategoryService = require('../service/CategoryService');
const ContentService = require('../service/ContentService');

router.get('/', async function (req, res, next) {
    const userId = req.query.userId || 1;
    const type = req.query.type || 0;
    let category = [];
    let content = [];
    if (type == 1) {
        // 最新的
        content = await ContentService.getContentByParams({isDel: 0});
    } else if (type == 2) {
        // 分享给我的
        content = await ContentService.getContentByParams({isDel: 0});
    } else if (type == 3) {
        // 标签
        const tags = req.query.pid;
        content = await ContentService.getContentByParams({isDel: 0, tags: {in: tags}});
    } else if (type == 4) {
        // 加星
        content = await ContentService.getContentByParams({isDel: 1});
    } else if (type == 5) {
        // 回收站
        content = await ContentService.getContentByParams({isDel: 1});
    } else if (type == 6) {
        const keywords = req.query.pid;
        const reg = new RegExp(keywords, 'i');
        // 搜索
        const where = {
            isDel: 0,
            $or: [{title: reg}, {content: reg}]
        };
        content = await ContentService.getContentByParams(where);
    } else {
        const pid = req.query.pid || "5e74d421bd68c4301208cf5b";
        category = await CategoryService.getCategoryByPid(pid);
        content = await ContentService.getContentByCategoryId(pid);
    }
    res.status(200).json({
        code: 0,
        msg: "获取成功",
        data: {
            category: category,
            content: content
        }
    });
});
router.get('/detail', async function (req, res, next) {
    const userId = req.query.userId || 1;
    const id = req.query.id || 0;
    if (id == 0) {
        res.status(200).json({
            code: 1,
            msg: "数据不存在"
        });
    } else {
        const content = await ContentService.getContentById(id);
        res.status(200).json({
            code: 0,
            msg: "获取成功",
            data: content
        });
    }
});

router.post('/', async function (req, res, next) {
    const userId = req.body.userId || 1;
    const id = req.body.id;
    const title = req.body.title || '新建文档';
    const content = req.body.content;
    const categoryId = req.body.categoryId || "5e74d421bd68c4301208cf5b";

    const link = req.body.link || "";
    const password = req.body.link || "";
    const top = req.body.link || 0;
    const star = req.body.link || false;

    const contentObj = {
        title: title,
        userId: userId,
        categoryId: categoryId,
        content: content,
        link: link,
        password: password,
        star: star,
        top: top
    };
    if (!id) {
        await ContentService.addContent(contentObj);
    } else {
        contentObj.id = id;
        await ContentService.updateContent(contentObj);
    }
    res.status(200).json({code: 0, msg: "保存成功"});
});

router.post('/delete', async function (req, res, next) {
    const userId = req.body.userId || 1;
    const id = req.body.id;
    if (!id) {
        res.status(200).json({code: 101, msg: "参数不全"});
    } else {
        await ContentService.deleteContent(id, userId);
        res.status(200).json({code: 0, msg: "删除成功"});

    }
});

module.exports = router;
