var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var userSchema = new Schema({
    userId: String,
    accessToken : String,
   	handle : String,
   	pass : String,
   	email : String
}, { collection: 'User' });


module.exports = mongoose.model('User', userSchema, 'User');

