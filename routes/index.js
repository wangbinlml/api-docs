const express = require('express');
const router = express.Router();
const CategoryService = require('../service/CategoryService');

/* GET home page. */
router.get('/', async function (req, res, next) {
    const userId = req.query.userId || 1;
    const category = await CategoryService.getCategoryByPid("0");
    res.render('index', {
        title: '云笔记',
        category: category
    });
});

module.exports = router;
