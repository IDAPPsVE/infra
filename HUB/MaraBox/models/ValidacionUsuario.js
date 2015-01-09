var mongoose     = require('mongoose');

var ValidacionUsuarioSchema = mongoose.Schema({
  MaraBox : {
    Codigo          : String,
    CorreoValidado  : Number,
    CedulaValidada  : Number,
    idBox           : String,
    idUsuario       : String,
  }
});


// create the model for users and expose it to our app
module.exports = mongoose.model('ValidacionUsuario', ValidacionUsuarioSchema);