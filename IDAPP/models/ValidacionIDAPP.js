var mongoose     = require('mongoose');

var ValidacionIDAPPSchema = mongoose.Schema({
  IDAPP : {
    Codigo    : String,
    Validado  : Number,
    idUsuario : String,
  }
});


// create the model for users and expose it to our app
module.exports = mongoose.model('ValidacionIDAPP', ValidacionIDAPPSchema);
