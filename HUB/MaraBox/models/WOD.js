var mongoose     = require('mongoose');

var WODSchema = mongoose.Schema({

  MaraBox : {
    idBox    : String,
    WarmUp   : {type: mongoose.Schema.Types.ObjectId, ref: 'Ejercicios'},
    WOD      : {type: mongoose.Schema.Types.ObjectId, ref: 'Ejercicios'},
    BuyOut   : {type: mongoose.Schema.Types.ObjectId, ref: 'Ejercicios'},
    Fecha    : {type: Date, default: Date.now },
  }
  
});

// create the model for users and expose it to our app
module.exports = mongoose.model('WOD', WODSchema);