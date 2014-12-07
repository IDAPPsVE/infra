var mongoose     = require('mongoose');

var EjerciciosSchema = mongoose.Schema({

    MaraBox : {
        Nombre       : String,
    }
  
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Ejercicios', EjerciciosSchema);