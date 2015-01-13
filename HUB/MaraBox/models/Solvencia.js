var mongoose     = require('mongoose');

var SolvenciaSchema = mongoose.Schema({

    MaraBox : {
         idUsuario        : String,
         FechaInicio      : Date,
         FechaCulminacion : Date,
         DiasHabiles      : Number,
    }
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Solvencia', SolvenciaSchema);