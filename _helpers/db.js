const config = require('config.json');
const mongoose = require('mongoose');
mongoose.connect('mongodb://myUserAdmin:abc123@localhost/users');
//Server config
// mongoose.connect(config.prodURL);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../users/user.model')
};
