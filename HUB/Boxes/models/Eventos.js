var mongoose     = require('mongoose');

var EventosSchema = mongoose.Schema({

  Boxes : {
    Nombre           : String,
    Imagen           : String,
    Ciudad           : String,
    Estado           : String,
    Direccion        : String,
    FechaInicio      : Date,
    FechaCulminacion : Date,
    Costo            : Number,
    idBox            : String
  }

});


// create the model for users and expose it to our app
module.exports = mongoose.model('EventosBoxes', EventosSchema);