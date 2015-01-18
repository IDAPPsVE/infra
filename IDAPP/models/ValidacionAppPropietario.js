var mongoose     = require('mongoose');

var ValidacionAppPropietarioSchema = mongoose.Schema({
  IDAPP : {
    Codigo    : String,
    Validado  : Number,
    idBox     : String,
    idUsuario : String,
  }
});


// create the model for users and expose it to our app
module.exports = mongoose.model('ValidacionAppPropietario', ValidacionAppPropietarioSchema);
