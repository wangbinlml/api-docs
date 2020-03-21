const mongoose = require('../core/db');

const Schema = mongoose.Schema;
const CategorySchema = new Schema({
    name: {type: String},
    pid: {type: String},
    icon: {type: String},
    userId: {type: Number},
    opt: {type: Number},
    level: {type: Number},
    isDefault: {type: Boolean, default: false},
    createAt: {type: Date, default: Date.now}
});
module.exports = mongoose.model('Category', CategorySchema, 'category');