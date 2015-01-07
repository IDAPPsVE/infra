var mongoose     = require('mongoose');

var DescripcionEjercicioSchema = mongoose.Schema({
  MaraBox : {
    idEjercicio : String,
    Descripcion : String,
    urlVideo : String
  }
  
});


// create the model for users and expose it to our app
module.exports = mongoose.model('DescripcionEjercicio', DescripcionEjercicioSchema);