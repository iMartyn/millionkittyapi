var mongoose = require('mongoose')
var Schema = mongoose.Schema

SettableBlockProperties = {
    block_id: Number, // 1-72
    url: String,
    amount_paid: Number,
    scale: Number, //0 to 1
    text: String
}

var BlockSchema = new Schema(SettableBlockProperties);

module.exports = mongoose.model('Block', BlockSchema);
