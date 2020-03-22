var mongoose = require('mongoose');
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

var recursion = function (data, id) {
    var list = [];
    for (var index in data) {
        var v = data[index];
        if (v['pid'] == id) {
            v['_doc']['nodes'] = recursion(data, v['_id'].toString());
            list.push(v);
        }
    }
    return list;
};


exports.getCategories = async (userId) => {
    var data = await Category.find({
        userId: {$in: ["0", userId]}
    }).sort({pid: 1, opt: -1, _id: -1});
    return recursion (data, "0");
};

exports.getCategory = async (userId) => {
    var data = await Category.find({
        userId: userId
    }).sort({pid: 1, opt: -1, _id: -1});
    return data;
};

exports.getCategoryByPid = async (userId, pid) => {
    var data = await Category.find({userId: userId, pid: pid}).sort({opt: -1, _id: -1});
    return data;
};

exports.addCategory = async (category) => {
    return await new Category(category).save();
};
exports.updateCategory = async (category) => {
    return await Category.update({
        _id: category.id,
        userId: category.userId
    }, category);
};
exports.deleteCategory = async (id, userId) => {
    return await Category.remove({
        _id: id,
        userId: userId
    });
};