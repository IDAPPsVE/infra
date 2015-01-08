var mongoose     = require('mongoose');

var InfoUsuarioSchema = mongoose.Schema({

  Boxes : {
    Nombres           : String,
    Apellidos         : String,
    Ciudad            : String,
    Estado            : String,
    Direccion         : String,
    Telefono          : Number,
    FechaNacimiento   : Date,
  }
  
});


// create the model for users and expose it to our app
module.exports = mongoose.model('InfoUsuarioBoxes', InfoUsuarioSchema);
