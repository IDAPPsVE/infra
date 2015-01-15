var mongoose     = require('mongoose');

// define the schema for our user model
var AsistenciaSchema = mongoose.Schema({

    MaraBox : {
        idUsuario   : String,
        idBox       : String,
        idClase     : Date,
        Validado    : Number,
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Asistencia', AsistenciaSchema);