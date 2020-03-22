const mongoose = require('../core/db');

const Schema = mongoose.Schema;
const CategorySchema = new Schema({
    name: {type: String},
    pid: {type: String},
    icon: {type: String},
    userId: {type: String},
    opt: {type: Number},
    level: {type: Number},
    isDefault: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now}
});
module.exports = mongoose.model('Category', CategorySchema, 'category');