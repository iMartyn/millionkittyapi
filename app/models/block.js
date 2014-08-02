var mongoose = require('mongoose')
var Schema = mongoose.Schema

var BlockSchema = new Schema({
    url: String,
    paid: Number
});

module.exports = mongoose.model('Block', BlockSchema);
