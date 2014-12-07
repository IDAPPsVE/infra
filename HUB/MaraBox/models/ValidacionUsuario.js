var mongoose     = require('mongoose');

var ValidacionUsuarioSchema = mongoose.Schema({
  MaraBox : {
    Codigo    : String,
    Validado  : Number,
    idBox     : String,
    isUsuario : String,
  }
});


// create the model for users and expose it to our app
module.exports = mongoose.model('ValidacionUsuario', ValidacionUsuarioSchema);