const express = require('express');
const router = express.Router();
const CategoryService = require('../service/CategoryService');

/* GET home page. */
router.get('/', async function (req, res, next) {
    const user = req.session.user;
    const userId = user._id;
    res.render('admin', {
        title: '云笔记'
    });
});

module.exports = router;
