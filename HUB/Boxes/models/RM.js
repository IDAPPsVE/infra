var mongoose     = require('mongoose');

var RMSchema = mongoose.Schema({

    Boxes : {
         idUsuario   : String,
         idEjercicio : String,
         Fecha       : Date,
         RM          : Number,
         idBox       : String,
    }
});


// create the model for users and expose it to our app
module.exports = mongoose.model('RMBoxes', RMSchema);