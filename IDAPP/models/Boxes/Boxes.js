var mongoose     = require('mongoose');

var BoxesSchema = mongoose.Schema({

  Nombre           : String,
  idContrato       : String
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Boxes', BoxesSchema);