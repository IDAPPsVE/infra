var mongoose     = require('mongoose');

var InfoUsuarioSchema = mongoose.Schema({

  Nombres           : String,
  Apellidos         : String,
  Ciudad            : String,
  Estado            : String,
  Direccion         : String,
  Telefono          : Number,
  FechaNacimiento   : Date,
  
});


// create the model for users and expose it to our app
module.exports = mongoose.model('InfoUsuario', InfoUsuarioSchema);
