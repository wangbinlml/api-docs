const mongoose = require('../core/db');
const Schema = mongoose.Schema;
const ContentSchema = new Schema({
    //标题
    title: {
        type: String,
        default: ''
    },
    //内容
    content: {
        type: String,
        default: ''
    },
    link: {
        type: String,
    },
    password: {
        type: String
    },
    star: {
        type: Boolean,
        default: false
    },
    top: {
        type: Number,
        default: 0
    },
    categoryId: {
        type: String
    },
    userId: {
        type: String
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    isDel: {
        type: Number,
        default: 0
    },
    tags: {
        type: Array,
        default: []
    }
});
module.exports = mongoose.model('Content', ContentSchema, 'content');