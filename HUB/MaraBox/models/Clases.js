var mongoose     = require('mongoose');

// define the schema for our user model
var ClasesSchema = mongoose.Schema({

    MaraBox : {
        Fecha        : Date,
        Hora         : Date,
        idEntrenador : String,
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Clases', ClasesSchema);