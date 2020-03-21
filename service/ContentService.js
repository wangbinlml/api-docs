var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');
var mongoose = require('mongoose');

exports.getContentByCategoryId = async (categoryId) => {
    var data = await Content.find({categoryId: categoryId, isDel: 0}).sort({opt: -1, _id: -1});
    return data;
};

exports.getContentByParams= async (obj) => {
    var data = await Content.find(obj).sort({_id: -1}).limit(10);
    return data;
};

exports.getContentById= async (id) => {
    var data = await Content.findOne({
        _id: mongoose.Types.ObjectId(id)
    });
    return data;
};

exports.addContent = async (contentObj) => {
    return await new Content(contentObj).save();
}

exports.updateContent = async (contentObj) => {
    return await Content.updateOne({
        _id: mongoose.Types.ObjectId(contentObj.id),
        userId: contentObj.userId
    }, contentObj);
}
exports.deleteContent = async (id) => {
    return await Content.updateOne({
        _id: mongoose.Types.ObjectId(id)
    }, {
        isDel: 1
    });
}