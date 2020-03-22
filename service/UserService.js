var User = require('../models/User');

exports.getUser = async (username) => {
    var data = await User.findOne({username: username});
    return data;
};
exports.addUser = async (user) => {
    return await new User(user).save();
};