var mongoose     = require('mongoose');

var RegistroEventoSchema = mongoose.Schema({

  MaraBox : {
    idUsuario   : String,
    idBox       : String,
    idEvento    : String,
  }
  
});


// create the model for users and expose it to our app
module.exports = mongoose.model('RegistroEvento', RegistroEventoSchema);
