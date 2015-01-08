var mongoose     = require('mongoose');

var NotificacionesSchema = mongoose.Schema({

  Boxes : {
    Titulo  : String,
    Mensaje : String,
    Fecha   : { type: Date, default: Date.now },
    idBox   : String,
  }
  
});


// create the model for users and expose it to our app
module.exports = mongoose.model('NotificacionesBoxes', NotificacionesSchema);