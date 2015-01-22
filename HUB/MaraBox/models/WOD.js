var mongoose     = require('mongoose');

var WODSchema = mongoose.Schema({

  MaraBox : {
    idBox    : String,
    Nombre   : String,
    Timecap  : Number,
    WarmUp   : [mongoose.Schema.Types.Mixed],
    WOD      : [mongoose.Schema.Types.Mixed],
    BuyOut   : [mongoose.Schema.Types.Mixed],
    Fecha    : Date,
  }
  
});

// create the model for users and expose it to our app
module.exports = mongoose.model('WOD', WODSchema);