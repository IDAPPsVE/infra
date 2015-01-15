var mongoose     = require('mongoose');

var EntrenadoresSchema = mongoose.Schema({

    MaraBox : {
        Nombre        : String,
        Apellido      : String,
        idUsuario     : String,
        Certificacion : String,
    }
  
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Entrenadores', EntrenadoresSchema);