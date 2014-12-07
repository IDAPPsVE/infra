var mongoose     = require('mongoose');

var ValidacionBoxSchema = mongoose.Schema({
  IDAPP : {
    Codigo : String,
    Validado : Number,
    idBox : String
  }
});


// create the model for users and expose it to our app
module.exports = mongoose.model('ValidacionBox', ValidacionBoxSchema);