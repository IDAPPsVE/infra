var mongoose     = require('mongoose');

var NotificacionesSchema = mongoose.Schema({

  MaraBox : {
    Titulo  : String,
    Mensaje : String,
    Fecha   : { type: Date, default: Date.now },
  }
  
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Notificaciones', NotificacionesSchema);