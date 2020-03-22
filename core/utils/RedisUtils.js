var ioRedis = require("ioredis");

var config = require("../../config/config").redis;

var client = null;

if (config.cluster) {
    client = new ioRedis.Cluster(config.connect_info);
} else {
    client = new ioRedis(config.connect_info[0]);
}

module.exports.Redis = client;
