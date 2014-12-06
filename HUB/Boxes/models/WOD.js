var mongoose     = require('mongoose');

var WODSchema = mongoose.Schema({

  idBox    : String,
  WarmUp   : [],
  WOD      : [],
  BuyOut   : [],
  Fecha    : Date,
});


// create the model for users and expose it to our app
module.exports = mongoose.model('WOD', WODSchema);
