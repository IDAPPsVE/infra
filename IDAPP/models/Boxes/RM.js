var mongoose     = require('mongoose');

var RMSchema = mongoose.Schema({

  idUsuario   : String,
  idBox       : String,
  idEjercicio    : String,
  Fecha   : Date,
  RM       : Number,
});


// create the model for users and expose it to our app
module.exports = mongoose.model('RM', RMSchema);