var mongoose     = require('mongoose');
//var Schema       = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var ValidacionSchema = mongoose.Schema({
  user_id    : String,
  Validacion : String,
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Validacion', ValidacionSchema);
