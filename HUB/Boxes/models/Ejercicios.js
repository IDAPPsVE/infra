var mongoose     = require('mongoose');

var EjerciciosSchema = mongoose.Schema({

    Boxes : {
        Nombre       : String,
    }
  
});


// create the model for users and expose it to our app
module.exports = mongoose.model('EjerciciosBoxes', EjerciciosSchema);