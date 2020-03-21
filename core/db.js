const mongoose = require('mongoose');
const logger = require('../core/utils/Logger').getLogger("system");
const config = require("../config/config");
const DB_URL = config.db_url;
/** * 连接 */
mongoose.connect(DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
/** * 连接成功 */
mongoose.connection.on('connected', function () {
    logger.info('Mongoose connection open to ' + DB_URL);
});
/** * 连接异常 */
mongoose.connection.on('error', function (err) {
    logger.error('Mongoose connection error: ' + err);
});
/** * 连接断开 */
mongoose.connection.on('disconnected', function () {
    logger.info('Mongoose connection disconnected');
});

module.exports = mongoose;