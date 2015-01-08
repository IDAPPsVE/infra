var mongoose     = require('mongoose');

// define the schema for our user model
var AsistenciaSchema = mongoose.Schema({

    Boxes : {
        idUsuario : String,
        idBox     : String,
        Hora      : Date,
        Fecha     : Date
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('AsistenciaBoxes', AsistenciaSchema);